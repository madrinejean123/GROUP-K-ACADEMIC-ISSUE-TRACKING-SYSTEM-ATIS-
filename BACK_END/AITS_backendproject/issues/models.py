from django.db import models
from users.models import Student, Lecturer, CollegeRegister
from department.models import Department, College, School

class Issues(models.Model):
    STATUS_CHOICE = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('rejected', 'Rejected'),
    ]
    TITLE_CHOICES = [
        ('registration_issue', 'REGISTRATION ISSUE'),
        ('marks_correction', 'MARKS CORRECTION'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICE, default='pending')
    title = models.CharField(max_length=255, choices=TITLE_CHOICES, default='marks_correction')
    description = models.TextField()
    attachment = models.ImageField(upload_to='issue_attachments/', blank=True, null=True)
    assigned_lecturer = models.ForeignKey(Lecturer, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_issues')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    author = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='submitted_issues')
    register = models.ForeignKey(CollegeRegister, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_issues')
    college = models.ForeignKey(College, on_delete=models.CASCADE, related_name='issues', default=1)  # Direct link to college
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='issues', default=1)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='issues', default=1)
    def __str__(self):
        return f'{self.title} - {self.status}, (By {self.author})'