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
    GET /users/profile/        → nested college/school/department
    PUT/PATCH /users/profile/update_me/  → accepts college, school, department as IDs or names
    """
    student_no = serializers.CharField(source='student.student_no', read_only=True)

    # ─── Single fields that do BOTH read (nested) and write (PK/name) ───
    college    = CustomPrimaryKeyRelatedField(
                     queryset=College.objects.all(),
                     required=False, allow_null=True
                 )
    school     = CustomPrimaryKeyRelatedField(
                     queryset=School.objects.all(),
                     required=False, allow_null=True
                 )
    department = CustomPrimaryKeyRelatedField(
                     queryset=Department.objects.all(),
                     required=False, allow_null=True
                 )

    class Meta:
        model  = User
        fields = [
            'id', 'username', 'full_name', 'mak_email', 'user_role',
            'gender', 'profile_pic', 'office',
            'college',       # read/write via the same field
            'student_no',
            'school',        # read/write via the same field
            'department',    # read/write via the same field
            'notification_email',
        ]

    def to_representation(self, instance):
        """
        On GET: return nested serializers instead of raw PK.
        """
        data = super().to_representation(instance)

        # choose where to read from
        if instance.user_role == 'student' and hasattr(instance, 'student'):
            col = instance.student.college
            sch = instance.student.school
            dep = instance.student.department
        else:
            col = instance.college
            sch = None
            dep = None

        data['college']    = CollegeSerializer(col).data if col else None
        data['school']     = SchoolSerializer(sch).data if sch else None
        data['department'] = DepartmentSerializer(dep).data if dep else None
        return data

    def update(self, instance, validated_data):
        """
        On PATCH/PUT: assign incoming college/school/department to Student (if student),
        or to User.college (if registrar/lecturer).
        """
        col = validated_data.pop('college', serializers.empty)
        sch = validated_data.pop('school', serializers.empty)
        dep = validated_data.pop('department', serializers.empty)

        # 1) Update any other User fields
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()

        # 2) Assign to student or user
        if instance.user_role == 'student':
            student, _ = Student.objects.get_or_create(user=instance)
            if col is not serializers.empty:
                student.college = col
            if sch is not serializers.empty:
                student.school = sch
            if dep is not serializers.empty:
                student.department = dep
            student.save()
        else:
            # registrar or lecturer → update User.college
            if col is not serializers.empty:
                instance.college = col
                instance.save()

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


class UserLogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()

    def validate(self, attrs):
        self.refresh_token = attrs['refresh']
        return attrs
    
class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        value = value.lower()
        try:
            user = User.objects.get(notification_email=value)
            if not user.notification_email:
                raise serializers.ValidationError("No verified Gmail found for this account.")
            return value
        except User.DoesNotExist:
            raise serializers.ValidationError("No user found with this Gmail.")