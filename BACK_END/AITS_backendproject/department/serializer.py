from rest_framework import serializers
from .models import Department


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'department_name', 'description']
        read_only_fields = ['id']
        extra_kwargs = {'department_name':{'required':True},
                        'description':{'require':False},
                        }
        