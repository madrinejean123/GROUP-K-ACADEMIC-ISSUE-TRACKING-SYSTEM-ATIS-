from rest_framework import serializers
from . models import *


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ['name', 'student_reg_no', 'student_no', 'email'] 
        