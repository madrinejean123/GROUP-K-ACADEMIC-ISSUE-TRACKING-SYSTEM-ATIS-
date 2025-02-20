from django.db import models

# Create your models here.


class Student(models.Model):
    name = models.models.CharField(max_length=50)
 