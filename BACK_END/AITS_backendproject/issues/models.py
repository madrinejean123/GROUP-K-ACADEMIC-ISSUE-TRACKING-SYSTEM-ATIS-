from django.db import models

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
<<<<<<< HEAD
    assigned_lecturer = models.CharField(max_length=100, )
=======
    assigned_lecturer = models.CharField(max_length=100, blank=True, null=True)
>>>>>>> 8df424e23ba6f22dd51dd8047b4354aee42813a7
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
