from django.db import models

class Student(models.Model):
    name = models.CharField(max_length=50)
    student_reg_no = models.CharField(max_length=20)
    student_no = models.IntegerField(unique=True)
    email = models.EmailField(max_length=255, unique=True)
    
