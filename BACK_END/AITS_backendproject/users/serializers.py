from rest_framework.serializers import ModelSerializer
from rest_framework import serializers
from .models import User, Student, Lecturer, CollegeRegister
from django.contrib.auth.hashers import make_password
from django.contrib.auth import get_user_model

User = get_user_model()

class UserRegistrationSerializer(ModelSerializer):
    #
    password = serializers.CharField(write_only= True)
     
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'user_role', 'password']
    
    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)

class UserloginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only = True)

class UserProfileSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'user_role', 'gender', 'college', 'office']  
class UserUpdateSerializers(ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'gender', 'college', 'office']
        extra_kwargs = {'username': {'required': False}, 'gender': {'required': False}}


class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = "__all__"


class StudentSerializer(ModelSerializer):
    user = UserProfileSerializer()
    class Meta:
        model = Student
        fields = "__all__" 

class LecturerSerializer(ModelSerializer):
    user = UserProfileSerializer()


    class Meta:
        model = Lecturer  
        fields = "__all__" 

class CollegeRegisterSerializer(ModelSerializer):
    user = UserProfileSerializer()

    class Meta:
        model = CollegeRegister  
        fields = "__all__" 