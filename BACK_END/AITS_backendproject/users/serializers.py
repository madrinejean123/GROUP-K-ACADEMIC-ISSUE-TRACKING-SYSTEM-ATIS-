from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from django.contrib.auth import authenticate
from .models import User, Student, Lecturer, CollegeRegister
from department.models import College
from department.serializers import CollegeSerializer
import re  

# Custom field to allow string representations for college primary key.
class CustomPrimaryKeyRelatedField(serializers.PrimaryKeyRelatedField):
    def to_internal_value(self, data):
        if isinstance(data, str):
            try:
                data = int(data)
            except ValueError:
                self.fail('invalid', input=data)
        return super().to_internal_value(data)


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
            'id',
            'full_name',
            'mak_email',
            'password',
            'confirm_password',
            'user_role',
            'student_no',
            'college',
        ]

    def validate(self, data):
        # 1) Passwords must match
        if data.get('password') != data.get('confirm_password'):
            raise serializers.ValidationError({'confirm_password': 'Passwords must match.'})

        role = data.get('user_role')

        # 2) Role-specific requirements
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
        # Extract and remove write-only fields
        password = validated_data.pop('password')
        validated_data.pop('confirm_password')
        student_no = validated_data.pop('student_no', None)
        college = validated_data.pop('college', None)
        role = validated_data.get('user_role')

        # Create the User
        user = User.objects.create(
            username=validated_data['mak_email'],
            full_name=validated_data.get('full_name', ''),
            mak_email=validated_data['mak_email'],
            password=make_password(password),
            user_role=role,
            # Only assign college on the User if registrar
            college=college if role == 'registrar' else None
        )

        # Role‑specific profile
        if role == 'student':
            Student.objects.create(user=user, student_no=student_no)
        elif role == 'lecturer':
            # NOTE: Your Lecturer model must allow college=null
            Lecturer.objects.create(user=user)
        else:  # registrar
            CollegeRegister.objects.create(user=user, college=college)

        return user


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

        # Superusers bypass role checks
        if self.context.get('is_superuser'):
            return data

        if role == 'student':
            if not re.match(r'^[a-zA-Z]+\.[a-zA-Z]+@students\.mak\.ac\.ug$', email):
                raise serializers.ValidationError({
                    'mak_email': 'Student email must be firstname.lastname@students.mak.ac.ug.'
                })
            if not data.get('student_no'):
                raise serializers.ValidationError({
                    'student_no': 'Student number is required for students.'
                })

        elif role in ['lecturer', 'registrar']:
            if not re.match(r'^[a-zA-Z]+\.[a-zA-Z]+@mak\.ac\.ug$', email):
                raise serializers.ValidationError({
                    'mak_email': 'Email must be firstname.lastname@mak.ac.ug.'
                })
            if role == 'registrar' and not data.get('college'):
                raise serializers.ValidationError({
                    'college': 'College is required for registrars.'
                })

        # Authentication check
        user = authenticate(username=email, password=data.get('password'))
        if user is None:
            raise serializers.ValidationError({
                'non_field_errors': ['Invalid credentials. Please try again.']
            })

        return data


# User Profile Serializer
class UserProfileSerializer(serializers.ModelSerializer):
    college = CollegeSerializer(read_only=True)
    student_no = serializers.SerializerMethodField()
    department = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'full_name',
            'mak_email',
            'user_role',
            'gender',
            'profile_pic',
            'office',
            'college',
            'student_no',
            'school',
            'department',
        ]

    def get_student_no(self, obj):
        if obj.user_role == 'student' and hasattr(obj, 'student'):
            return obj.student.student_no
        return None

    def get_department(self, obj):
        if obj.user_role == 'student' and hasattr(obj, 'student'):
            return obj.student.department.name if obj.student.department else None
        if obj.user_role == 'lecturer' and hasattr(obj, 'lecturers'):
            return obj.lecturers.department.name if obj.lecturers.department else None
        return None

    def validate(self, attrs):
        if attrs.get('user_role') == 'registrar' and not attrs.get('college'):
            raise serializers.ValidationError({
                'college': 'College is required for a registrar.'
            })
        return attrs


# User Update Serializer
class UserUpdateSerializers(serializers.ModelSerializer):
    GENDER_CHOICES = [
        ("M", "Male"),
        ("F", "Female"),
    ]
    gender = serializers.ChoiceField(choices=GENDER_CHOICES, required=False)

    class Meta:
        model = User
        fields = ['username', 'gender', 'profile_pic', 'office', 'college']
        extra_kwargs = {
            'profile_pic': {'required': False},
            'username': {'required': False},
            'college': {'required': False},
        }

    def update(self, instance, validated_data):
        # Handle updating the user data first
        college = validated_data.get('college', None)
        instance = super().update(instance, validated_data)

        # If the college was updated, link to the CollegeRegister
        if college:
            college_register = CollegeRegister.objects.filter(college=college).first()
            if college_register:
                instance.linked_register = college_register
                instance.save()

        return instance


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


# General User Serializer
class UserSerializer(serializers.ModelSerializer):
    college = CollegeSerializer(read_only=True)
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'full_name',
            'mak_email',
            'user_role',
            'gender',
            'profile_pic',
            'office',
            'college',
        ]
