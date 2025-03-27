from rest_framework import serializers
from .models import Issues
from users.serializers import StudentSerializer, LecturerSerializer, CollegeRegisterSerializer

class IssueSerializers(serializers.ModelSerializer):
    author = StudentSerializer(read_only=True)
    assigned_lecturer = LecturerSerializer(read_only=True)
    register = CollegeRegisterSerializer(read_only=True)

    class Meta:
        model = Issues
        fields = '__all__'