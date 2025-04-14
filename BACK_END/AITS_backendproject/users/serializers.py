from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from django.contrib.auth import authenticate
import re

from .models import User, Student, Lecturer, CollegeRegister
from department.models import College, School, Department
from department.serializers import CollegeSerializer, SchoolSerializer, DepartmentSerializer


class CustomPrimaryKeyRelatedField(serializers.PrimaryKeyRelatedField):
    """
    Accepts PK, dict {'id': pk}, or name lookups for College/School/Department.
    """
    default_error_messages = {
        'invalid': 'Invalid identifier "{input}".',
        'does_not_exist': 'No object found matching "{value}".',
        'incorrect_type': 'Incorrect type. Expected primary key value, received {input_type}.',
    }

    def to_internal_value(self, data):
        # allow {"id": 3} or "Engineering" lookups
        if isinstance(data, dict):
            data = data.get('id')
        if isinstance(data, str) and not data.isdigit():
            qs = self.get_queryset()
            model = qs.model
            for field in ('name', 'school_name', 'department_name'):
                if hasattr(model, field):
                    try:
                        return qs.get(**{field: data})
                    except model.DoesNotExist:
                        continue
            self.fail('does_not_exist', value=data)
        return super().to_internal_value(data)


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    student_no = serializers.CharField(write_only=True, required=False)
    college = CustomPrimaryKeyRelatedField(
        queryset=College.objects.all(),
        write_only=True,
        required=False
    )

    class Meta:
        model = User
        fields = [
            'id', 'full_name', 'mak_email',
            'password', 'confirm_password',
            'user_role', 'student_no', 'college',
        ]

    def validate(self, data):
        if data.get('password') != data.get('confirm_password'):
            raise serializers.ValidationError({'confirm_password': 'Passwords must match.'})
        role = data.get('user_role')
        if role == 'student' and not data.get('student_no'):
            raise serializers.ValidationError({'student_no': 'Student number is required.'})
        if role == 'registrar' and not data.get('college'):
            raise serializers.ValidationError({'college': 'College is required for registrar.'})
        return data

    def create(self, validated_data):
        pwd = validated_data.pop('password')
        validated_data.pop('confirm_password')
        student_no = validated_data.pop('student_no', None)
        college = validated_data.pop('college', None)
        role = validated_data.get('user_role')

        user = User.objects.create(
            username=validated_data['mak_email'],
            full_name=validated_data.get('full_name', ''),
            mak_email=validated_data['mak_email'],
            password=make_password(pwd),
            user_role=role,
            college=college if role == 'registrar' else None
        )

        if role == 'student':
            Student.objects.create(user=user, student_no=student_no)
        elif role == 'lecturer':
            Lecturer.objects.create(user=user)
        else:
            CollegeRegister.objects.create(user=user, college=college)
        return user


class UserLoginSerializer(serializers.Serializer):
    mak_email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    user_role = serializers.CharField(write_only=True, required=False)
    student_no = serializers.CharField(write_only=True, required=False)
    college = CustomPrimaryKeyRelatedField(
        queryset=College.objects.all(),
        write_only=True,
        required=False
    )

    def validate(self, data):
        email = data.get('mak_email', '').lower()
        role = data.get('user_role', '').lower()
        if role == 'student' and not re.match(r'^[\w\.]+@students\.mak\.ac\.ug$', email):
            raise serializers.ValidationError({'mak_email': 'Invalid student email.'})
        user = authenticate(username=email, password=data.get('password'))
        if not user:
            raise serializers.ValidationError({'non_field_errors': ['Invalid credentials.']})
        return data


class UserProfileSerializer(serializers.ModelSerializer):
    """
    profile GET and update_me PUT/PATCH
    """
    student_no = serializers.CharField(source='student.student_no', read_only=True)

    # —— READ: nested serializers for full detail —— #
    college = CollegeSerializer(source='student.college', read_only=True)
    school = SchoolSerializer(source='student.school', read_only=True)
    department = DepartmentSerializer(source='student.department', read_only=True)

    # —— WRITE: still accept PK/dict/name via CustomPK —— #
    college_id = CustomPrimaryKeyRelatedField(
        source='student.college',
        queryset=College.objects.all(),
        write_only=True,
        required=False,
        allow_null=True
    )
    school_id = CustomPrimaryKeyRelatedField(
        source='student.school',
        queryset=School.objects.all(),
        write_only=True,
        required=False,
        allow_null=True
    )
    department_id = CustomPrimaryKeyRelatedField(
        source='student.department',
        queryset=Department.objects.all(),
        write_only=True,
        required=False,
        allow_null=True
    )

    class Meta:
        model = User
        fields = [
            'id', 'username', 'full_name', 'mak_email', 'user_role',
            'gender', 'profile_pic', 'office', 'college',
            'student_no', 'school', 'department', 'notification_email',
        ]

    def get_student_no(self, obj):
        if obj.user_role == 'student' and hasattr(obj, 'student'):
            return obj.student.student_no
        return None

    def get_department(self, obj):
        if obj.user_role == 'student' and hasattr(obj, 'student'):
            return obj.student.department.department_name if obj.student.department else None
        if obj.user_role == 'lecturer' and hasattr(obj, 'lecturers'):
            return obj.lecturers.department.department_name if obj.lecturers.department else None
        return None

    def validate(self, attrs):
        if attrs.get('user_role') == 'registrar' and not attrs.get('college'):
            raise serializers.ValidationError({'college': 'College is required for a registrar.'})
        return attrs


# ──────────────────────────────────────────────────────────────────────────────
# User Update Serializer
class UserUpdateSerializers(serializers.ModelSerializer):
    gender = serializers.ChoiceField(choices=User.GENDER_CHOICES, required=False)
    college = CustomPrimaryKeyRelatedField(queryset=College.objects.all(), required=False)
    school = CustomPrimaryKeyRelatedField(queryset=School.objects.all(), required=False)
    department = CustomPrimaryKeyRelatedField(queryset=Department.objects.all(), required=False)

    class Meta:
        model = User
        fields = ['username', 'gender', 'profile_pic', 'office', 'college', 'school', 'department']
        extra_kwargs = {
            'profile_pic': {'required': False},
            'username': {'required': False},
            'college': {'required': False},
            'school': {'required': False},
            'department': {'required': False},
        }

    def validate_username(self, value):
        if value == self.instance.username:
            return value
        if not re.match(r'^[\w.@+-]+$', value):
            raise serializers.ValidationError(
                "Username may only contain letters, numbers and @/./+/-/_ characters."
            )
        return value

    def validate_gender(self, value):
        if not value:
            return None
        conversion_map = {'m': 'male', 'male': 'male', 'f': 'female', 'female': 'female'}
        normalized = conversion_map.get(value.lower())
        if not normalized:
            raise serializers.ValidationError(
                f"Invalid gender. Must be one of: {[v for _, v in User.GENDER_CHOICES]}"
            )
        return normalized

    def update(self, instance, validated_data):
        student_data = validated_data.pop('student', {})
        # Update User fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        # Ensure Student exists
        student, _ = Student.objects.get_or_create(user=instance)
        # Update nested Student fields
        for attr, value in student_data.items():
            setattr(student, attr, value)
        student.save()
        return instance


class StudentSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)

    class Meta:
        model = Student
        fields = ['id', 'user', 'student_no', 'college', 'school', 'department']


class LecturerSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)

    class Meta:
        model = Lecturer
        fields = ['id', 'user', 'college', 'is_lecturer']


class CollegeRegisterSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)

    class Meta:
        model = CollegeRegister
        fields = ['id', 'user', 'college']


class UserSerializer(serializers.ModelSerializer):
    college = CollegeSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'full_name', 'mak_email', 'user_role', 'gender', 'profile_pic', 'office', 'college', 'notification_email']
