from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from django.contrib.auth import authenticate
import re

from .models import User, Student, Lecturer, CollegeRegister
from department.models import College, School, Department
from department.serializers import CollegeSerializer

# ──────────────────────────────────────────────────────────────────────────────
# Custom PK field: accepts int PK, dict with 'id', numeric strings, or string name lookup
class CustomPrimaryKeyRelatedField(serializers.PrimaryKeyRelatedField):
    default_error_messages = {
        'invalid': 'Invalid identifier "{input}".',
        'does_not_exist': 'No object found matching "{value}".',
        'incorrect_type': 'Incorrect type. Expected primary key value, received {input_type}.',
    }

    def to_internal_value(self, data):
        # dict with 'id'
        if isinstance(data, dict):
            data = data.get('id')

        # string: try numeric pk or model-specific name lookup
        if isinstance(data, str):
            if data.isdigit():
                return super().to_internal_value(int(data))

            qs = self.get_queryset()
            model = qs.model

            # determine lookup field on the model
            if hasattr(model, 'school_name'):
                lookup_field = 'school_name'
            elif hasattr(model, 'department_name'):
                lookup_field = 'department_name'
            elif hasattr(model, 'name'):
                lookup_field = 'name'
            else:
                # fallback to pk
                self.fail('invalid', input=data)

            try:
                return qs.get(**{lookup_field: data})
            except model.DoesNotExist:
                self.fail('does_not_exist', value=data)

        # other types (int, etc.)
        return super().to_internal_value(data)


# ──────────────────────────────────────────────────────────────────────────────
# User Registration Serializer
class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    student_no = serializers.CharField(write_only=True, required=False)
    college = CustomPrimaryKeyRelatedField(
        queryset=College.objects.all(),
        required=False,
        write_only=True
    )

    class Meta:
        model = User
        fields = [
            'id', 'full_name', 'mak_email', 'password', 'confirm_password',
            'user_role', 'student_no', 'college',
        ]

    def validate(self, data):
        if data.get('password') != data.get('confirm_password'):
            raise serializers.ValidationError({'confirm_password': 'Passwords must match.'})
        role = data.get('user_role')
        if role == 'student':
            if not data.get('student_no'):
                raise serializers.ValidationError({'student_no': 'Student number is required for students.'})
            if data.get('college') is not None:
                raise serializers.ValidationError({'college': 'Students should not supply a college.'})
        elif role == 'lecturer':
            if data.get('student_no') is not None:
                raise serializers.ValidationError({'student_no': 'Lecturers should not supply a student number.'})
            if data.get('college') is not None:
                raise serializers.ValidationError({'college': 'Lecturers should not supply a college.'})
        elif role == 'registrar':
            if not data.get('college'):
                raise serializers.ValidationError({'college': 'College is required for a registrar.'})
        else:
            raise serializers.ValidationError({'user_role': 'Invalid role.'})
        return data

    def create(self, validated_data):
        password = validated_data.pop('password')
        validated_data.pop('confirm_password')
        student_no = validated_data.pop('student_no', None)
        college = validated_data.pop('college', None)
        role = validated_data.get('user_role')
        user = User.objects.create(
            username=validated_data['mak_email'],
            full_name=validated_data.get('full_name', ''),
            mak_email=validated_data['mak_email'],
            password=make_password(password),
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


# ──────────────────────────────────────────────────────────────────────────────
# User Login Serializer
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
        if self.context.get('is_superuser'):
            return data
        if role == 'student':
            if not re.match(r'^[a-zA-Z]+\.[a-zA-Z]+@students\.mak\.ac\.ug$', email):
                raise serializers.ValidationError({'mak_email': 'Student email must be firstname.lastname@students.mak.ac.ug.'})
            if not data.get('student_no'):
                raise serializers.ValidationError({'student_no': 'Student number is required for students.'})
        elif role in ['lecturer', 'registrar']:
            if not re.match(r'^[a-zA-Z]+\.[a-zA-Z]+@mak\.ac\.ug$', email):
                raise serializers.ValidationError({'mak_email': 'Email must be firstname.lastname@mak.ac.ug.'})
            if role == 'registrar' and not data.get('college'):
                raise serializers.ValidationError({'college': 'College is required for registrars.'})
        user = authenticate(username=email, password=data.get('password'))
        if user is None:
            raise serializers.ValidationError({'non_field_errors': ['Invalid credentials. Please try again.']})
        return data


# ──────────────────────────────────────────────────────────────────────────────
# User Profile Serializer
class UserProfileSerializer(serializers.ModelSerializer):
    college = CollegeSerializer(read_only=True)
    student_no = serializers.SerializerMethodField()
    department = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'full_name', 'mak_email', 'user_role',
            'gender', 'profile_pic', 'office', 'college',
            'student_no', 'school', 'department',
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
        college = validated_data.pop('college', None)
        school = validated_data.pop('school', None)
        department = validated_data.pop('department', None)

        if hasattr(instance, 'student'):
            student = instance.student
            if college is not None:
                student.college = college
            if school is not None:
                student.school = school
            if department is not None:
                student.department = department
            student.save()
        elif hasattr(instance, 'lecturers'):
            lecturer = instance.lecturers
            if college is not None:
                lecturer.college = college
            if department is not None:
                lecturer.department = department
            lecturer.save()

        return super().update(instance, validated_data)


# ──────────────────────────────────────────────────────────────────────────────
# Student, Lecturer, Registrar serializers
class StudentSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer()
    class Meta:
        model = Student
        fields = ['id', 'user', 'student_no', 'college', 'school', 'department']


class LecturerSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer()
    class Meta:
        model = Lecturer
        fields = ['id', 'user', 'college', 'is_lecturer']


class CollegeRegisterSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer()
    class Meta:
        model = CollegeRegister
        fields = ['id', 'user', 'college']


# ──────────────────────────────────────────────────────────────────────────────
# General User Serializer
class UserSerializer(serializers.ModelSerializer):
    college = CollegeSerializer(read_only=True)
    class Meta:
        model = User
        fields = ['id', 'username', 'full_name', 'mak_email', 'user_role', 'gender', 'profile_pic', 'office', 'college']
