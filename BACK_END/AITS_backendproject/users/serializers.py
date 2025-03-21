from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from django.contrib.auth import get_user_model
from .models import User, Student, Lecturer, CollegeRegister
from department.models import Department, College  

User = get_user_model()

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
    student_no = serializers.CharField(write_only=True, required=False)  # Added student_no, made it write_only and optional.

    class Meta:
        model = User
<<<<<<< HEAD
        fields = ['id', 'user_role', 'full_name', 'student_no', 'mak_email', 'password', 'confirm_password']  # Added student_no to fields.

    def validate(self, attrs):
        """
        Validate that password and confirm_password match.
        """
        password = attrs.get('password')
        confirm_password = attrs.get('confirm_password')

        if password != confirm_password:
            raise serializers.ValidationError({"confirm_password": "Passwords must match."})

        return attrs
=======
        fields = ['id', 'username', 'email', 'password', 'user_role', 'gender', 'year_of_study', 'college']
>>>>>>> 5612254bfe2eacc911a0882a93b2dc6b743970e5

    def create(self, validated_data):
        # Print out validated data for debugging
        print("Validated Data:", validated_data)  # This line will print the incoming data

        # Hash the password before saving
        password = validated_data.pop('password')
        confirm_password = validated_data.pop('confirm_password')  # Remove confirm password from validated data.
        student_no = validated_data.pop('student_no', None)  # Remove student_no from validated data.

        user = User.objects.create(
            username=validated_data['full_name'],  # Use full_name as the username
            mak_email=validated_data['mak_email'],  # Use mak_email instead of email
            password=make_password(password),  # Hash password
            user_role=validated_data['user_role'],
        )

        # Create role-specific profile
        if user.user_role == 'student':
            Student.objects.create(user=user, student_no=student_no)
        elif user.user_role == 'lecturer':
            Lecturer.objects.create(user=user)
        elif user.user_role == 'register':
            CollegeRegister.objects.create(user=user)

        return user

# User Login Serializer but am still working on it 
class UserLoginSerializer(serializers.Serializer):
    mak_email = serializers.EmailField()  # Changed email to mak_email
    password = serializers.CharField(write_only=True)

# User Profile Serializer
class UserProfileSerializer(serializers.ModelSerializer):
    college = CollegeSerializer(read_only=True)  # Include college details

    class Meta:
        model = User
<<<<<<< HEAD
        fields = ['id', 'username', 'mak_email', 'user_role', 'profile_pic', 'office']

# User Update Serializers
class UserUpdateSerializers(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'profile_pic', 'office']
=======
        fields = ['id', 'username', 'email', 'user_role', 'gender', 'profile_pic', 'office', 'college']


class UserUpdateSerializers(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'gender', 'profile_pic', 'office', 'college']
>>>>>>> 5612254bfe2eacc911a0882a93b2dc6b743970e5
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
        fields = ['id', 'user', 'student_number']


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

<<<<<<< HEAD
    def validate_name(self, value):
        """
        Validate that the department name is unique within a college.
        """
        college = self.initial_data.get('college')
        if Department.objects.filter(name__iexact=value, college=college).exists():
            raise serializers.ValidationError("A department with this name already exists in this college.")
        return value
=======
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'user_role', 'gender', 'profile_pic', 'office', 'college']
>>>>>>> 5612254bfe2eacc911a0882a93b2dc6b743970e5
