from django.db import models


class Student(models.Model):
    name = models.CharField(max_length=100)
    student_reg_no = models.CharField(max_length=20, unique=True)
    student_no = models.IntegerField(unique=True)
    email = models.EmailField(max_length=255, unique=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    year_of_study = models.IntegerField()
    gender = models.CharField(max_length=20, default='other')
    semester = models.IntegerField()
    
    def __str__(self):
        return self.name
    
