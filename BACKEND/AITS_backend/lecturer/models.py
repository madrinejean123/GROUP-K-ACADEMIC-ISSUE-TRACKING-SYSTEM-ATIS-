from django.db import models


class Lecturer(models.Model):
    name = models.CharField(max_length=100)
    lecturer_id = models.CharField(max_length=20, unique=True)
    email = models.EmailField(max_length=255, unique=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    department = models.CharField(max_length=100)
    gender = models.CharField(max_length=20, default='other')
    college = models.CharField(max_length=100)
    
    def __str__(self):
        return self.name
    