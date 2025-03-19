from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from cloudinary.models import CloudinaryField  # For profile picture storage

# Import Department and College models from the departments app
from department.models import Department, College

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

    user_role = models.CharField(max_length=25, choices=USER_ROLES_CHOICES, default='student') 
    email = models.EmailField(unique=True, validators=[validate_email_domain])  # Ensure university email
    gender = models.CharField(max_length=8, choices=GENDER_CHOICES)
    profile_pic = CloudinaryField('image', blank=True, null=True)  # Use Cloudinary for file storage
    college = models.ForeignKey(College, on_delete=models.SET_NULL, null=True, blank=True) 
    office = models.CharField(max_length=20, blank=True, null=True)  

    groups = models.ManyToManyField(Group, related_name="custom_user_groups")
    user_permissions = models.ManyToManyField(Permission, related_name="custom_user_permissions")

    def __str__(self):
        return self.username


class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student', unique=True)
    year_of_study = models.PositiveSmallIntegerField() 
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True)  # Link to Department

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