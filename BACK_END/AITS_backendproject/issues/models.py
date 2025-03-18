from django.db import models
from users.models import Student, Lecturer, CollegeRegister
from department.models import Department
# Create your models here.

class Issues(models.Model):
    email = models.EmailField(max_length=225, unique=True)
    category = models.CharField(max_length=50)
    STATUS_CHOICE = [
        ('pending', 'Pending'),
        ('resolved', 'Resolved'),
        ('rejected', 'Rejected'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICE, default='pending')
    title = models.CharField(max_length=255, default = 'untitled issue')
    description = models.TextField()
    attachment = models.ImageField(upload_to='insert tab/', blank=True, null=True)
    assigned_lecturer = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    author = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='issue', default='')
    register = models.ForeignKey(CollegeRegister, on_delete=models.CASCADE, related_name='register', default='')
    lecturer = models.ForeignKey(Lecturer, on_delete=models.CASCADE, related_name='lecturer', default='')
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='department', default='')
    
    
    def __str__(self):
        return self.title


