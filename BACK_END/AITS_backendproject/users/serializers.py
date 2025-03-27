from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from django.contrib.auth import get_user_model
from .models import User, Student, Lecturer, CollegeRegister
from department.models import Department, College
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

# College Serializer
class CollegeSerializer(serializers.ModelSerializer):
    class Meta:
        model = College
        fields = ['id', 'name', 'code']

# Department Serializer
class DepartmentSerializer(serializers.ModelSerializer):
    college = CollegeSerializer(read_only=True)  # Include college details

    class Meta:
        model = Department
        fields = ['id', 'name', 'college']

# User Registration Serializer
class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)  # Added confirm password field
    student_no = serializers.CharField(write_only=True, required=False)  # Optional by default
    # Use the custom field for college.
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
        initial = self.initial_data or {}
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
        password = data.get('password')
        confirm_password = data.get('confirm_password')
        if password != confirm_password:
            raise serializers.ValidationError("Passwords do not match.")
        
        role = data.get('user_role', '').lower()

        # Email validation based on user role
        email = data.get('mak_email', '').lower()
        if role == 'student':
            if not re.match(r'^[a-zA-Z]+\.[a-zA-Z]+@students\.mak\.ac\.ug$', email):
                raise serializers.ValidationError({"mak_email": "Student email must be in the format: firstname.lastname@students.mak.ac.ug."})
        elif role in ['lecturer', 'registrar']:
            if not re.match(r'^[a-zA-Z]+\.[a-zA-Z]+@mak\.ac\.ug$', email):
                raise serializers.ValidationError({"mak_email": "Email must be in the format: firstname.lastname@mak.ac.ug."})

        if role == 'student' and not data.get('student_no'):
            raise serializers.ValidationError({"student_no": "Student number is required for students."})
        if role == 'registrar' and not data.get('college'):
            raise serializers.ValidationError({"college": "College is required for registrars."})
        
        return data

    def create(self, validated_data):
        # Debug print
        print("Validated Data:", validated_data)

        password = validated_data.pop('password')
        validated_data.pop('confirm_password')
        student_no = validated_data.pop('student_no', None)  # Only for student role
        college = validated_data.pop('college', None)  # Only for registrar role

        # Create the user with basic fields.
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
        mak_email = data.get('mak_email').lower()
        password = data.get('password')

        print("Validating data:", data)  # Debugging: Print incoming data

        # Email format validation
        if not re.match(r'^[a-zA-Z]+\.[a-zA-Z]+@(students\.)?mak\.ac\.ug$', mak_email):
            raise serializers.ValidationError("Invalid email format.")

        if mak_email and password:
            if not User.objects.filter(mak_email=mak_email).exists():
                print("User does not exist for mak_email:", mak_email)  # Debugging: Print user not found
                raise serializers.ValidationError("Invalid credentials")
        else:
            raise serializers.ValidationError("Must include 'mak_email' and 'password'")

        return data

# User Profile Serializer
class UserProfileSerializer(serializers.ModelSerializer):
    college = CollegeSerializer(read_only=True)  # Include college details

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
            'college'
        ]

class UserUpdateSerializers(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'gender', 'profile_pic', 'office', 'college']
        extra_kwargs = {
            'username': {'required': False},
            'profile_pic': {'required': False},
            'office': {'required': False},
            'college': {'required': False},
        }

class StudentSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer()
    class Meta:
        model = Student
        fields = ['id', 'user', 'student_no']

class LecturerSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer()
    class Meta:
        model = Lecturer
        fields = ['id', 'user', 'department']

class CollegeRegisterSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer()
    class Meta:
        model = CollegeRegister
        fields = ['id', 'user', 'department']

# User Serializer (for general use)
class UserSerializer(serializers.ModelSerializer):
    college = CollegeSerializer(read_only=True)  # Include college details
    class Meta:
        model = User
        fields = ['id', 'username', 'mak_email', 'user_role', 'gender', 'profile_pic', 'office', 'college']
