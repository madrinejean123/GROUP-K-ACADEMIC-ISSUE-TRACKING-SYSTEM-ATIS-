from django.db import models


class Department(models.Model):
    Department_name = models.CharField(max_length=100, verbose_name='Department')
    description = models.TextField(verbose_name='Department Description')
    
    def __str__(self):
        return self.department_name
    
