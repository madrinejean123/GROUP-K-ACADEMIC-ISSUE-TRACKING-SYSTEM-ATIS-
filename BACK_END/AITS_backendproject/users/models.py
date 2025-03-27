from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission
from django.core.exceptions import ValidationError
from cloudinary.models import CloudinaryField  # For profile picture storage

# Import Department and College models from the departments app
from department.models import Department, College

# Custom validator for university email domain
def validate_email_domain(value, user_role):
    if user_role == 'student' and not value.endswith('@students.mak.ac.ug'):
        raise ValidationError('Student email must belong to the student domain: @students.mak.ac.ug')
    elif user_role in ['lecturer', 'registrar'] and not value.endswith('@mak.ac.ug'):
        raise ValidationError('Email must belong to the university domain: @mak.ac.ug')

# Custom User Model
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

    full_name = models.CharField(max_length=255, blank=True, null=True)  # Added full_name field
    user_role = models.CharField(max_length=25, choices=USER_ROLES_CHOICES, default='student')
    mak_email = models.EmailField(unique=True)  # The email will be stored exactly as entered
    gender = models.CharField(max_length=8, choices=GENDER_CHOICES)
    profile_pic = CloudinaryField('image', blank=True, null=True)  # Use Cloudinary for file storage
    college = models.ForeignKey(College, on_delete=models.SET_NULL, null=True, blank=True)
    office = models.CharField(max_length=20, blank=True, null=True)

    groups = models.ManyToManyField(Group, related_name="custom_user_groups")
    user_permissions = models.ManyToManyField(Permission, related_name="custom_user_permissions")

    def __str__(self):
        return self.username

    # Override the save method to validate the email without modifying it
    def save(self, *args, **kwargs):
        # Validate the email using the custom validator without altering its content.
        validate_email_domain(self.mak_email, self.user_role)
        super().save(*args, **kwargs)


class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student', unique=True, null=True)
    student_no = models.CharField(max_length=20, unique=True)  # Added student_no field

    def __str__(self):
        return self.user.username

    # Ensure student_no is only required for students
    def save(self, *args, **kwargs):
        if self.user.user_role != 'student':
            self.student_no = None  # Do not require student number for non-students (Lecturer/Registrar)
        super().save(*args, **kwargs)


# Lecturer Model
class Lecturer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='lecturer', unique=True)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, related_name='lecturer')

    def __str__(self):
        return f"{self.user.username}-{self.department}"


# College Register Model
class CollegeRegister(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='registrar', unique=True)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, related_name='register')

    def __str__(self):
        return f"{self.user.username}-{self.department}"
