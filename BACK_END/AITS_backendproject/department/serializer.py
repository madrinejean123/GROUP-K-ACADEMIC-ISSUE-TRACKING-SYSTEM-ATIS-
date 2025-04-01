from rest_framework import serializers
from .models import College, School, Department

# College Serializer
class CollegeSerializer(serializers.ModelSerializer):
    class Meta:
        model = College
        fields = ['id', 'name', 'code']

# School Serializer
class SchoolSerializer(serializers.ModelSerializer):
    class Meta:
        model = School
        fields = '__all__'

# Department Serializer
class DepartmentSerializer(serializers.ModelSerializer):
    college = CollegeSerializer(read_only=True)  # Include college details

    class Meta:
        model = Department
        fields = ['id', 'name', 'description', 'college']
