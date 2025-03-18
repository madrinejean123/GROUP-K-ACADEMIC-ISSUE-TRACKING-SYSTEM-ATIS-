# users/serializers.py
from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from django.contrib.auth import get_user_model
from .models import User, Student, Lecturer, CollegeRegister, Department

User = get_user_model()

# User Registration Serializer
class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    year_of_study = serializers.IntegerField(required=False)  # Add this field

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'user_role', 'gender', 'year_of_study']

    def create(self, validated_data):
        # Extract year_of_study if provided
        year_of_study = validated_data.pop('year_of_study', None)

        # Hash the password before saving
        validated_data['password'] = make_password(validated_data['password'])
        user = User.objects.create(**validated_data)

        # Create role-specific profile
        if user.user_role == 'student':
            if year_of_study is None:
                raise serializers.ValidationError({"year_of_study": "This field is required for students."})
            Student.objects.create(user=user, year_of_study=year_of_study)
        elif user.user_role == 'lecturer':
            Lecturer.objects.create(user=user)
        elif user.user_role == 'register':
            CollegeRegister.objects.create(user=user)

        return user

# User Login Serializer
class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

# User Profile Serializer
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'user_role', 'gender', 'profile_pic', 'office']

# User Update Serializer
class UserUpdateSerializers(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'gender', 'profile_pic', 'office']
        extra_kwargs = {
            'username': {'required': False},
            'gender': {'required': False},
            'profile_pic': {'required': False},
            'office': {'required': False},
        }

# Student Serializer
class StudentSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer()

    class Meta:
        model = Student
        fields = ['id', 'user', 'year_of_study', 'department']

# Lecturer Serializer
class LecturerSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer()

    class Meta:
        model = Lecturer
        fields = ['id', 'user', 'department']

# College Register Serializer
class CollegeRegisterSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer()

    class Meta:
        model = CollegeRegister
        fields = ['id', 'user', 'department']

# Department Serializer
class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'name', 'college']

    def validate_name(self, value):
        """
        Validate that the department name is unique within a college.
        """
        college = self.initial_data.get('college')
        if Department.objects.filter(name__iexact=value, college=college).exists():
            raise serializers.ValidationError("A department with this name already exists in this college.")
        return value