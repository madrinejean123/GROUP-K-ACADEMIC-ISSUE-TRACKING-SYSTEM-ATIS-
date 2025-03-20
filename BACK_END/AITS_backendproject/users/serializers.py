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
    year_of_study = serializers.IntegerField(required=False)  # Add this field

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'user_role', 'gender', 'year_of_study', 'college']

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

# User Login Serializer but am still working on it 
class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

# User Profile Serializer
class UserProfileSerializer(serializers.ModelSerializer):
    college = CollegeSerializer(read_only=True)  # Include college details

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'user_role', 'gender', 'profile_pic', 'office', 'college']


class UserUpdateSerializers(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'gender', 'profile_pic', 'office', 'college']
        extra_kwargs = {
            'username': {'required': False},
            'gender': {'required': False},
            'profile_pic': {'required': False},
            'office': {'required': False},
            'college': {'required': False},
        }


class StudentSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer()

    class Meta:
        model = Student
        fields = ['id', 'user', 'year_of_study', 'department']


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
        fields = ['id', 'username', 'email', 'user_role', 'gender', 'profile_pic', 'office', 'college']