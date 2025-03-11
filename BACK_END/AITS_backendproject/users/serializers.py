from rest_framework.serializers import ModelSerializer
from .models import *
class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = "__all__"


class StudentSerializer(ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Student
        fields = "__all__" 

class LecturerSerializer(ModelSerializer):
    user = UserSerializer()


    class Meta:
        model = Lecturer  
        fields = "__all__" 

class CollegeRegisterSerializer(ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = CollegeRegister  
        fields = "__all__" 
