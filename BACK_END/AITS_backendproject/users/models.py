from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission
from django.core.exceptions import ValidationError
from cloudinary.models import CloudinaryField
from department.models import Department, College, School
import re

# Custom validator for university email domain
def validate_email_domain(value, user_role):
    pattern = {
        'student': r'^[a-z]+\.[a-z]+@students\.mak\.ac\.ug$',
        'lecturer': r'^[a-z]+\.[a-z]+@mak\.ac\.ug$',
        'registrar': r'^[a-z]+\.[a-z]+@mak\.ac\.ug$'
    }.get(user_role)

    if not pattern or not re.fullmatch(pattern, value.lower()):
        raise ValidationError(
            f"Email must be in format: firstname.lastname@{'students.' if user_role=='student' else ''}mak.ac.ug"
        )

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
    user_role = models.CharField(max_length=25, choices=USER_ROLES_CHOICES, default='student')
    mak_email = models.EmailField(unique=True)
    gender = models.CharField(max_length=8, choices=GENDER_CHOICES,default='Male')
    profile_pic = CloudinaryField('image', blank=True, null=True)
    office = models.CharField(max_length=20, blank=True, null=True)
    notification_email = models.EmailField(blank=True, null=True)  # Optional notification email

    groups = models.ManyToManyField(Group, related_name="custom_user_groups")
    user_permissions = models.ManyToManyField(Permission, related_name="custom_user_permissions")
    reset_token = models.CharField(max_length=32, blank=True, null=True)
    reset_token_expiry = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return self.username

    def save(self, *args, **kwargs):
        validate_email_domain(self.mak_email, self.user_role)
        super().save(*args, **kwargs)


class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student', unique=True, null=True)
    student_no = models.CharField(max_length=20, unique=True)
    college = models.ForeignKey(College, on_delete=models.CASCADE, blank=False, default='')
    school = models.ForeignKey(School, on_delete=models.SET_NULL, default='', null=True)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, default='', null=True)

    def __str__(self):
        return self.user.username

    def save(self, *args, **kwargs):
        if self.user.user_role != 'student':
            self.student_no = None
        super().save(*args, **kwargs)


class Lecturer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='lecturers', unique=True)
    college = models.ForeignKey(College, on_delete=models.CASCADE, blank=False, default='')
    is_lecturer = models.BooleanField(default=True)
    def __str__(self):
        return f"{self.user.username} - {self.college}"


class CollegeRegister(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='registrar', unique=True)
    college = models.ForeignKey(College, on_delete=models.CASCADE, blank=False, default='') 
    
    def __str__(self):
        return f"{self.user.username} - {self.college}"
