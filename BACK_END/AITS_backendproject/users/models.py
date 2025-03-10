from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission

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

    user_role = models.CharField(max_length=25, choices=USER_ROLES_CHOICES) 
    email_domain = models.CharField(max_length=50)
    gender = models.CharField(max_length=8, choices=GENDER_CHOICES)
    profile_pic = models.ImageField(upload_to='profile/', blank=True, null=True)
    college = models.CharField(max_length=20)
    office = models.CharField(max_length=20, blank=True, null=True)

    # Fix conflict with Django's default User model
    groups = models.ManyToManyField(Group, related_name="custom_user_groups")
    user_permissions = models.ManyToManyField(Permission, related_name="custom_user_permissions")

    def __str__(self):
        return self.username

class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student')
    year_of_study = models.PositiveSmallIntegerField()  # Prevents negative values

    def __str__(self):
        return self.user.username
