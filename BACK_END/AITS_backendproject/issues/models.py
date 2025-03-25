from django.db import models
from users.models import Student, Lecturer, CollegeRegister
from department.models import Department, College
# Create your models here.

class Issues(models.Model):
    email = models.EmailField(max_length=225, unique=True)
    category = models.CharField(max_length=50)
    STATUS_CHOICE = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('rejected', 'Rejected'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICE, default='pending')
    title = models.CharField(max_length=255, default = 'untitled issue')
    description = models.TextField()
    attachment = models.ImageField(upload_to='issue_attachments/', blank=True, null=True)
    assigned_lecturer = models.ForeignKey(Lecturer, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_issues')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    author = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='submitted_issues')
    register = models.ForeignKey(CollegeRegister, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_issues')
    college = models.ForeignKey(College, on_delete=models.CASCADE, related_name='issues', null=True, blank=True) 
    
    
    def __str__(self):
        return self.title



