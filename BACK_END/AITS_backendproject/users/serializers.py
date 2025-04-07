from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from django.contrib.auth import get_user_model
from .models import User, Student, Lecturer, CollegeRegister
from department.models import College, School, Department
from department.serializers import DepartmentSerializer, CollegeSerializer, SchoolSerializer
import re  

User = get_user_model()

# Custom field to allow string representations for college primary key.
class CustomPrimaryKeyRelatedField(serializers.PrimaryKeyRelatedField):
    def to_internal_value(self, data):
        if isinstance(data, str):
            try:
                data = int(data)
            except ValueError:
                self.fail('invalid', input=data)
        return super().to_internal_value(data)

# User Registration Serializer
class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)  # Added confirm password field
    student_no = serializers.CharField(write_only=True, required=False)  # Optional by default
    college = CustomPrimaryKeyRelatedField(queryset=College.objects.all(), required=False, write_only=True)

    class Meta:
        model = User
        fields = [
            'id', 
            'full_name', 
            'mak_email', 
            'password', 
            'user_role', 
            'confirm_password', 
            'student_no', 
            'college'
        ]

    def __init__(self, *args, **kwargs):
        """
        Adjust fields based on the user_role provided in the initial data.
        - For "student": Require student_no, remove college.
        - For "lecturer": Remove student_no and college.
        - For "registrar": Require college, remove student_no.
        """
        super().__init__(*args, **kwargs)
        initial = getattr(self, 'initial_data', {}) or {}
        role = initial.get('user_role', '').lower()
        if role == 'student':
            self.fields['student_no'].required = True
            self.fields.pop('college', None)
        elif role == 'lecturer':
            self.fields.pop('student_no', None)
            self.fields.pop('college', None)
        elif role == 'registrar':
            self.fields['college'].required = True
            self.fields.pop('student_no', None)

    def validate(self, data):
        if data.get('user_role') == 'register' and not data.get('college'):
            if not self.context.get('is_superuser'):
                raise serializers.ValidationError({'college': 'College is required for a registrar.'})
        return data

    
    

    def create(self, validated_data):
        password = validated_data.pop('password')
        validated_data.pop('confirm_password')
        student_no = validated_data.pop('student_no', None)  # Only for student role
        college = validated_data.pop('college', None)  # Only for registrar role

        # Create the user with basic fields.
        if self.context.get('is_superuser'):
            user = User.objests.create(
                username=validated_data.get('username', ''),
                mak_email=validated_data['mak_email'],
                password=make_password(password),
                user_role=validated_data['user_role'],
                college=college
            )
        else:
            user = User.objects.create(
                username=validated_data['full_name'],  # Using full_name as username
                mak_email=validated_data['mak_email'],   # The user enters their own email
                password=make_password(password),         # Hash password
                user_role=validated_data['user_role'],
                college=college  # Set for registrar; None for others
        )

        # Save the user with the entered email.
        user.save()

        # Create role-specific profile.
        if user.user_role == 'student':
            Student.objects.create(user=user, student_no=student_no)
        elif user.user_role == 'lecturer':
            Lecturer.objects.create(user=user)
        elif user.user_role == 'registrar':
            CollegeRegister.objects.create(user=user)

        return user

# User Login Serializer
class UserLoginSerializer(serializers.Serializer):
    mak_email = serializers.EmailField()  # Changed email to mak_email
    password = serializers.CharField(write_only=True)

    def validate(self, data): 
        email = data.get('mak_email', '').lower()
        role = data.get('user_role', '')
        
        if 'is_superuser' in self.context and self.context['is_superuser']:
            return data
        
        if role == 'student':
            if not re.match(r'^[a-zA-Z]+\.[a-zA-Z]+@students\.mak\.ac\.ug$', email):
                raise serializers.ValidationError({'mak_email': 'Student email must be in the format: firstname.lastname@students.mak.ac.ug.'})
        elif role in ['lecturer', 'registrar']:
            if not re.match(r'^[a-zA-Z]+\.[a-zA-Z]+@mak\.ac\.ug$', email):
                raise serializers.ValidationError({'mak_email': 'Email must be in the format: firstname.lastname@mak.ac.ug.'})
        
        if role == 'student' and not data.get('student_no'):
            raise serializers.ValidationError({"student_no": "Student number is required for students."})
        if role == 'registrar' and not data.get('college'):
            raise serializers.ValidationError({"college": "College is required for registrars."})

        return data
        
            

           
# User Profile Serializer
class UserProfileSerializer(serializers.ModelSerializer):
    college = CollegeSerializer(read_only=True)  # Include college details
    student_no = serializers.SerializerMethodField()  # Add student_no field
    department = serializers.SerializerMethodField()  # Add department field

    class Meta:
        model = User
        fields = [
            'id', 
            'username', 
            'mak_email', 
            'user_role', 
            'gender', 
            'profile_pic', 
            'office', 
            'college',
            'student_no',  
            'school',
            'department',  # Include department in the fields list
        ]

    def get_student_no(self, obj):
        # Check if the user is a student and return the student_no
        if obj.user_role == 'student':
            student = Student.objects.filter(user=obj).first()
            if student:
                return student.student_no
        return None
    def validate(self, attrs):
        # Get the user role and college from the request data
        user_role = attrs.get('user_role')
        college = attrs.get('college')

        # Check if the user role is 'registrar' and college is not provided
        if user_role == 'registrar' and not college:
            raise serializers.ValidationError({"college": "College is required for a registrar."})

        return attrs

    def get_department(self, obj):
        # Get the department based on the user role (Student or Lecturer)
        if obj.user_role == 'student':
            student = Student.objects.filter(user=obj).first()
            if student and student.department:
                return student.department.name  # or student.department.id
        elif obj.user_role == 'lecturer':
            lecturer = Lecturer.objects.filter(user=obj).first()
            if lecturer and lecturer.department:
                return lecturer.department.name  # or lecturer.department.id
        return None


class UserUpdateSerializers(serializers.ModelSerializer):
    GENDER_CHOICES = [
        ("M", "Male"),
        ("F", "Female"),
    ]

    gender = serializers.ChoiceField(choices=GENDER_CHOICES, required=False)

    class Meta:
        model = User
        fields = ['username', 'gender', 'profile_pic', 'office']
        extra_kwargs = {
            'profile_pic': {'required': False},
            'username': {'required': False},
            'college': {'required': False}  
        }

class StudentSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer()
    class Meta:
        model = Student
        fields = ['id', 'user', 'student_no', 'college', 'school', 'department']

class LecturerSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer()
    class Meta:
        model = Lecturer
        fields = ['id', 'user', 'college', 'is_lecturer']

class CollegeRegisterSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer()
    class Meta:
        model = CollegeRegister
        fields = ['id', 'user', 'college']

# User Serializer (for general use)
class UserSerializer(serializers.ModelSerializer):
    college = CollegeSerializer(read_only=True)  # Include college details
    class Meta:
        model = User
        fields = ['id', 'username', 'mak_email', 'user_role', 'gender', 'profile_pic', 'office','college']
        
        
