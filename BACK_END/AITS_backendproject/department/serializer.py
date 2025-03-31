from rest_framework import serializers
from .models import College, School, Department

# College Serializer
class CollegeSerializer(serializers.ModelSerializer):
    class Meta:
        model = College
        fields = ['id', 'name', 'code']
#school serializer
class SchoolSerializer(serializers.ModelSerializer):
    college = CollegeSerializer(read_only=True)
    class Meta:
        model = School
        fields = ['id', 'school_name', 'college']
    
        
        
class SchoolSerializer(serializers.ModelSerializer):
    college = CollegeSerializer(read_only=True)
    
    class Meta:
        model = School
        fields = ['id', 'school_name', 'college']

# Department Serializer
class DepartmentSerializer(serializers.ModelSerializer):
    school = SchoolSerializer(read_only=True)  # Include school details

    class Meta:
        model = Department
        fields = ['id', 'name', 'description', 'school']
        