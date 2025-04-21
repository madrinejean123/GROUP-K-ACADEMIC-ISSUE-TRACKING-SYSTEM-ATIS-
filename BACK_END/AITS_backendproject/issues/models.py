from django.db import models
from users.models import Student, Lecturer, CollegeRegister
from department.models import Department, College, School
from django.core.validators import FileExtensionValidator, RegexValidator
from django.core.exceptions import ValidationError

class Issues(models.Model):
    # --- Existing Fields (Unchanged) ---
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('rejected', 'Rejected'),
    ]
    TITLE_CHOICES = [
        ('registration_issue', 'REGISTRATION ISSUE'),
        ('marks_correction', 'MARKS CORRECTION'),
    ]

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    title = models.CharField(max_length=255, choices=TITLE_CHOICES, default='marks_correction')
    description = models.TextField()
    attachment = models.FileField(
        upload_to='issue_attachments/',
        blank=True,
        null=True,
        validators=[FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'pdf'])]
    )

    # --- New Fields (Backend-Only) ---
    CATEGORY_CHOICES = [
        ('missing_marks', 'Missing Marks'),
        ('appeals', 'Appeals'),
        ('correction', 'Correction'),
    ]
    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        blank=True,
        null=True,
        help_text="Issue category (e.g., Missing Marks, Appeals)"
    )

    course_code = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        validators=[
            RegexValidator(
                regex=r'^[A-Z]{3,4}\s\d{4}$',  # Format: "MATH 2200" or "CS 1010"
                message='Course code must be: 3-4 capital letters + space + 4 digits (e.g., "MATH 2200").'
            )
        ],
        help_text="Format: [Department Prefix][Space][4 digits] (e.g., CSC 1201)"
    )

    # --- Existing Relationships (Unchanged) ---
    assigned_lecturer = models.ForeignKey(
        Lecturer, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_issues'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    author = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='submitted_issues')
    register = models.ForeignKey(CollegeRegister, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_issues')
    college = models.ForeignKey(College, on_delete=models.CASCADE, related_name='issues')
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='issues')
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='issues')

    def __str__(self):
        return f'{self.title} - {self.status} (By {self.author})'
    
    