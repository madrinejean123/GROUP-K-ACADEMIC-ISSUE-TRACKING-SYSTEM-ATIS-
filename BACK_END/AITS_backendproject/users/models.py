from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from cloudinary.models import CloudinaryField  # For profile picture storage
from department.models import Department  # Import Department model from the other app

# Custom validator for university email domain
def validate_email_domain(value):
    if not value.endswith('@mak.ac.ug'):
        raise ValidationError('Email must belong to the university domain.')

# Custom User Model
class User(AbstractUser):
    USER_ROLES_CHOICES = [
        ('student', 'Student'),
        ('register', 'College Register'),
        ('lecturer', 'Lecturer'),
    ]

    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'), 
    ]

    full_name = models.CharField(max_length=255, blank=True, null=True)  # Added full_name field
    user_role = models.CharField(max_length=25, choices=USER_ROLES_CHOICES, default='student') 
    mak_email = models.EmailField(unique=True, validators=[validate_email_domain]) 
    gender = models.CharField(max_length=8, choices=GENDER_CHOICES)
    profile_pic = CloudinaryField('image', blank=True, null=True)  # for profile picture storage
    office = models.CharField(max_length=20, blank=True, null=True)  # For lecturers/registrars

    # Fix conflict with Django's default User model
    groups = models.ManyToManyField(Group, related_name="custom_user_groups")
    user_permissions = models.ManyToManyField(Permission, related_name="custom_user_permissions")

    def __str__(self):
        return self.username

    def get_full_name(self):
        if self.full_name:
            return self.full_name
        return f"{self.first_name} {self.last_name}"  # Fallback to Django's default full name if no full_name is provided

# Student Model
class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student', unique=True, null=True)
    student_no = models.CharField(max_length=20, unique=True)  # Added student_no field
  

    def __str__(self):
        return self.user.username

# Lecturer Model
class Lecturer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='lecturer', unique=True)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, related_name='lecturer')

    def __str__(self):
        return f"{self.user.username}-{self.department}"

# College Register Model
class CollegeRegister(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='register', unique=True)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, related_name='register')

    def __str__(self):
        return f"{self.user.username}-{self.department}"
