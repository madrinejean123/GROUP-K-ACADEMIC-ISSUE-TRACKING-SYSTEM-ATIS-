from django.db import models
from django.core.validators import (
    FileExtensionValidator, 
    RegexValidator,
)
from django.core.exceptions import ValidationError
from users.models import Student, Lecturer, CollegeRegister
from department.models import Department, College, School
from django.utils import timezone

def validate_file_size(value):
    limit = 5 * 1024 * 1024  # 5MB
    if value.size > limit:
        raise ValidationError('File too large. Size should not exceed 5MB.')

def issue_attachment_path(instance, filename):
    """Organizes attachments by year/month/temp folder (since issue not saved yet)"""
    date = timezone.now().strftime("%Y/%m")
    return f'issues/attachments/{date}/temp/{filename}'

class Issue(models.Model):
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
        ('rejected', 'Rejected'),
    ]
    
    CATEGORY_CHOICES = [
        ('missing_marks', 'Missing Marks'),
        ('appeals', 'Appeals'),
        ('correction', 'Correction'),
    ]

    # Core Fields
    title = models.CharField(max_length=255)
    description = models.TextField()
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='open',
        db_index=True
    )
    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        null=True,
        blank=True
    )

    # Academic Context
    course_code = models.CharField(
        max_length=20,
        validators=[
            RegexValidator(
                regex=r'^[A-Z]{3,4}\d{4}$',
                message='Course code must be 3-4 letters followed by 4 digits (e.g., CSC1200)'
            )
        ],
        null=True,
        blank=True
    )

    # File Attachments
    attachment = models.FileField(
        upload_to=issue_attachment_path,
        validators=[
            FileExtensionValidator(
                allowed_extensions=['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx']
            ),
            validate_file_size
        ],
        null=True,
        blank=True
    )

    # Relationships
    author = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='authored_issues'
    )
    assigned_lecturer = models.ForeignKey(
        Lecturer,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_issues'
    )
    handled_by = models.ForeignKey(
        CollegeRegister,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='handled_issues'
    )

    # Institutional Hierarchy
    college = models.ForeignKey(
        College,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    school = models.ForeignKey(
        School,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status_changed_at = models.DateTimeField(auto_now_add=True)

    # Tracking
    last_updated_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    resolution_notes = models.TextField(
        null=True,
        blank=True
    )

    class Meta:
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['assigned_lecturer', 'status']),
        ]
        ordering = ['-created_at']

    def __str__(self):
        return f"Issue #{self.id}: {self.title} ({self.get_status_display()})"

    def clean(self):
        """Validation logic"""
        if self.status == 'resolved' and not self.resolution_notes:
            raise ValidationError("Resolution notes are required when marking as resolved")
