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
        if isinstance(data, dict):
            data = data.get('id')
        if isinstance(data, str) and not data.isdigit():
            qs    = self.get_queryset()
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
    password         = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    student_no       = serializers.CharField(write_only=True, required=False)
    college          = CustomPrimaryKeyRelatedField(
                         queryset=College.objects.all(),
                         write_only=True, required=False
                       )

    class Meta:
        model  = User
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
        pwd         = validated_data.pop('password')
        validated_data.pop('confirm_password')
        student_no  = validated_data.pop('student_no', None)
        college_obj = validated_data.pop('college', None)
        role        = validated_data.get('user_role')

        user = User.objects.create(
            username   = validated_data['mak_email'],
            full_name  = validated_data.get('full_name', ''),
            mak_email  = validated_data['mak_email'],
            password   = make_password(pwd),
            user_role  = role,
            college    = college_obj if role == 'registrar' else None,
        )

        if role == 'student':
            Student.objects.create(
                user       = user,
                student_no = student_no
            )
        elif role == 'lecturer':
            Lecturer.objects.create(user=user)
        else:  # registrar
            CollegeRegister.objects.create(user=user, college=college_obj)

        return user


class UserLoginSerializer(serializers.Serializer):
    mak_email = serializers.EmailField()
    password  = serializers.CharField(write_only=True)
    user_role = serializers.CharField(write_only=True, required=False)

    def validate(self, data):
        email = data.get('mak_email', '').lower()
        role  = data.get('user_role', '').lower()
        if role == 'student' and not re.match(r'^[\w\.]+@students\.mak\.ac\.ug$', email):
            raise serializers.ValidationError({'mak_email': 'Invalid student email.'})
        user = authenticate(username=email, password=data.get('password'))
        if not user:
            raise serializers.ValidationError({'non_field_errors': ['Invalid credentials.']})
        return data


class UserProfileSerializer(serializers.ModelSerializer):
    """
    GET /users/profile/  → nested college/school/department
    PUT/PATCH /users/profile/update_me/  → accepts college_id/school_id/department_id
    """
    student_no = serializers.CharField(source='student.student_no', read_only=True)

    # — READ —
    college    = serializers.SerializerMethodField()
    school     = SchoolSerializer(source='student.school',    read_only=True)
    department = DepartmentSerializer(source='student.department', read_only=True)

    # — WRITE for students (maps into student.*) —
    college_id    = CustomPrimaryKeyRelatedField(
                       source='student.college',
                       queryset=College.objects.all(),
                       write_only=True, required=False, allow_null=True
                    )
    school_id     = CustomPrimaryKeyRelatedField(
                       source='student.school',
                       queryset=School.objects.all(),
                       write_only=True, required=False, allow_null=True
                    )
    department_id = CustomPrimaryKeyRelatedField(
                       source='student.department',
                       queryset=Department.objects.all(),
                       write_only=True, required=False, allow_null=True
                    )

    class Meta:
        model  = User
        fields = [
            'id', 'username', 'full_name', 'mak_email', 'user_role',
            'gender', 'profile_pic', 'office',
            'college',    'college_id',
            'student_no',
            'school',     'school_id',
            'department', 'department_id',
            'notification_email',
        ]

    def get_college(self, obj):
        # student → read from student.college
        if obj.user_role == 'student' and hasattr(obj, 'student'):
            return CollegeSerializer(obj.student.college).data if obj.student.college else None
        # registrar or lecturer → read from user.college
        return CollegeSerializer(obj.college).data if obj.college else None

    def update(self, instance, validated_data):
        # 1) pull out student.* updates
        student_data = validated_data.pop('student', {})

        # 2) update any direct User fields (none here for students)
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()

        # 3) apply to Student
        if student_data:
            student, _ = Student.objects.get_or_create(user=instance)
            for attr, val in student_data.items():
                setattr(student, attr, val)
            student.save()

        return instance


class UserUpdateSerializers(serializers.ModelSerializer):
    """
    (unused by update_me, but available elsewhere)
    """
    gender     = serializers.ChoiceField(choices=User.GENDER_CHOICES, required=False)
    college    = CustomPrimaryKeyRelatedField(queryset=College.objects.all(), required=False)
    school     = CustomPrimaryKeyRelatedField(queryset=School.objects.all(), required=False)
    department = CustomPrimaryKeyRelatedField(queryset=Department.objects.all(), required=False)

    class Meta:
        model  = User
        fields = ['username', 'gender', 'profile_pic', 'office', 'college', 'school', 'department']


class StudentSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)

    class Meta:
        model  = Student
        fields = ['id', 'user', 'student_no', 'college', 'school', 'department']


class LecturerSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)

    class Meta:
        model  = Lecturer
        fields = ['id', 'user', 'college', 'is_lecturer']


class CollegeRegisterSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)

    class Meta:
        model  = CollegeRegister
        fields = ['id', 'user', 'college']


class UserSerializer(serializers.ModelSerializer):
    college = CollegeSerializer(read_only=True)

    class Meta:
        model  = User
        fields = [
            'id', 'username', 'full_name', 'mak_email', 'user_role',
            'gender', 'profile_pic', 'office', 'college', 'notification_email'
        ]
