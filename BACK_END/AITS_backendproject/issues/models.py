from django.db import models
from users.models import Student, Lecturer, CollegeRegister
from department.models import Department, College, School
from django.core.validators import FileExtensionValidator

class Issues(models.Model):
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

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')  # Changed 'pending' to 'open'
    title = models.CharField(max_length=255, choices=TITLE_CHOICES, default='marks_correction')
    description = models.TextField() 
    attachment = models.FileField(
        upload_to='issue_attachments/',
        blank=True,
        null=True,
        validators=[FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'pdf'])]
    )#i addded this field to do add more files not just images

    
    assigned_lecturer = models.ForeignKey(
        Lecturer, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_issues'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Relationships
    author = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='submitted_issues')
    register = models.ForeignKey(CollegeRegister, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_issues')
    college = models.ForeignKey(College, on_delete=models.CASCADE, related_name='issues')
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='issues')
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='issues')

    def __str__(self):
        return f'{self.title} - {self.status}, (By {self.author})'



