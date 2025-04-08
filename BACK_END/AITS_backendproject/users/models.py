from django.core.exceptions import ValidationError  # Add this import
from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission
from cloudinary.models import CloudinaryField
from department.models import Department, College, School
import re
from django.core.exceptions import ValidationError
from django.contrib.auth.models import BaseUserManager
# Custom validator for university email domain


def validate_email_domain(value, user_role=None): 
    pattern = {
        'student': r'^[a-z]+\.[a-z]+@students\.mak\.ac\.ug$',
        'lecturer': r'^[a-z]+\.[a-z]+@mak\.ac\.ug$',
        'registrar': r'^[a-z]+\.[a-z]+@mak\.ac\.ug$'
    }.get(user_role)

    if not pattern or not re.fullmatch(pattern, value.strip().lower()):
        raise ValidationError(
            f"Email must be in format: firstname.lastname@{'students.' if user_role=='student' else ''}mak.ac.ug"
        )
        
class UserManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        """Create and return a regular user."""
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        """Create and return a superuser with only username, email, and password."""
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        # Remove fields that should NOT be required for superusers
        extra_fields.pop("mak_email", None)  # Ignore mak_email
        extra_fields.pop("college", None)  # Ignore college
        extra_fields.pop("user_role", None)  # Ignore role
        extra_fields.pop("full_name", None)  # Ignore full_name
        extra_fields.pop("gender", None)  # Ignore gender
        extra_fields.pop("profile_pic", None)  # Ignore profile_pic
        extra_fields.pop("office", None)  # Ignore office
        extra_fields.pop("notification_email", None)  # Ignore notification_email
        extra_fields.pop("school", None)  # Ignore school
        extra_fields.pop("full_name", None)
        extra_fields.pop("groups", None)
        extra_fields.pop("department", None)
        return self.create_user(username, email, password, **extra_fields)


class User(AbstractUser):
    USER_ROLES_CHOICES = [
        ('student', 'Student'),
        ('registrar', 'Registrar'),
        ('lecturer', 'Lecturer'),
    ]

    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
    ]

    full_name = models.CharField(max_length=255, blank=True, null=True)
    user_role = models.CharField(max_length=25, choices=USER_ROLES_CHOICES, blank=True, null=True)
    mak_email = models.EmailField(unique=True, blank=True, null=True)
    gender = models.CharField(max_length=8, choices=GENDER_CHOICES, default='male')
    profile_pic = CloudinaryField('image', blank=True, null=True)
    office = models.CharField(max_length=20, blank=True, null=True)
    notification_email = models.EmailField(blank=True, null=True)  # Optional notification email
    college = models.ForeignKey(College, on_delete=models.CASCADE, blank=True, null=True)  # Optional for students and lecturers
    groups = models.ManyToManyField(Group, related_name="custom_user_groups")
    user_permissions = models.ManyToManyField(Permission, related_name="custom_user_permissions")
    school = models.ForeignKey(School, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.username
    
    def clean(self):
        if not self.is_superuser and self.mak_email:
            validate_email_domain(self.mak_email, self.user_role)

    def save(self, *args, **kwargs):
        if not self.is_superuser and not self.college:
            raise ValidationError('Non superuse users need to be in a certain  college')
        if self.is_superuser and self.college:
            self.college = None
        self.full_clean()
        super().save(*args, **kwargs)


class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student', unique=True, null=True)
    student_no = models.CharField(max_length=20, unique=True)
    school = models.ForeignKey(School, on_delete=models.SET_NULL, default='', null=True)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, default='', null=True)
    # The college field is optional for students
    college = models.ForeignKey(College, on_delete=models.SET_NULL, blank=True, null=True)

    def __str__(self):
        return self.user.username

    def save(self, *args, **kwargs):
        if not self.is_superuser:
            validate_email_domain(self.mak_email, self.user_role)
        super().save(*args, **kwargs)
        


class Lecturer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='lecturers', unique=True)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, default='', null=True)
    college = models.ForeignKey(College, on_delete=models.CASCADE, blank=False, default='')  # Non-optional for lecturers
    is_lecturer = models.BooleanField(default=True)  # This can help to distinguish lecturers

    def __str__(self):
        return f"{self.user.username} - {self.college}"


class CollegeRegister(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='registrar', unique=True)
    # The college field is mandatory for registrars
    college = models.ForeignKey(College, on_delete=models.CASCADE, blank=False, default='1')

    def __str__(self):
        return f"{self.user.username} - {self.college}"
