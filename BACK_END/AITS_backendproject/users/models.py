from django.core.exceptions import ValidationError
from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission, BaseUserManager
from cloudinary.models import CloudinaryField
from department.models import Department, College, School
import re

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
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        # Remove fields not required for superusers
        for fld in [
            "mak_email","college","user_role","full_name","gender",
            "profile_pic","office","notification_email","school",
            "groups","department"
        ]:
            extra_fields.pop(fld, None)
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
    notification_email = models.EmailField(blank=True, null=True)
    college = models.ForeignKey(
        College,
        on_delete=models.SET_NULL,
        blank=True,
        null=True
    )  # Optional for students and lecturers
    groups = models.ManyToManyField(Group, related_name="custom_user_groups")
    user_permissions = models.ManyToManyField(Permission, related_name="custom_user_permissions")
    school = models.ForeignKey(School, on_delete=models.SET_NULL, null=True, blank=True)

    objects = UserManager()

    def __str__(self):
        return self.username
    
    def clean(self):
        if not self.is_superuser and self.mak_email:
            validate_email_domain(self.mak_email, self.user_role)

    def save(self, *args, **kwargs):
        # Only enforce college requirement for registrars (non-superusers)
        if not self.is_superuser:
            if self.user_role == 'registrar' and not self.college:
                raise ValidationError('Registrar users must have a college.')
        # Ensure superusers never retain a college
        if self.is_superuser and self.college:
            self.college = None

        self.full_clean()
        super().save(*args, **kwargs)


class Student(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='student',
        unique=True,
        null=True
    )
    student_no = models.CharField(max_length=20, unique=True)
    school = models.ForeignKey(
        School,
        on_delete=models.SET_NULL,
        default=None,
        null=True,
        blank=True
    )
    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        default=None,
        null=True,
        blank=True
    )
    college = models.ForeignKey(
        College,
        on_delete=models.SET_NULL,
        blank=True,
        null=True
    )
    

    def __str__(self):
        return self.user.username

    def save(self, *args, **kwargs):
        if not self.user.is_superuser:
            validate_email_domain(self.user.mak_email, self.user.user_role)
        super().save(*args, **kwargs)
        


class Lecturer(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='lecturers',
        unique=True
    )
    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        default=None,
        null=True,
        blank=True
    )
    college = models.ForeignKey(
        College,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )  # Changed: now optional
    is_lecturer = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.username} - {self.college}"


class CollegeRegister(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='registrar',
        unique=True
    )
    college = models.ForeignKey(
        College,
        on_delete=models.CASCADE
    )  # Still required

    def __str__(self):
        return f"{self.user.username} - {self.college}"
