from django.db import models


class Department(models.Model):
    DEPARTMENT_CHOICES = [
        ('cees', 'CEES'),
        ('cocis', 'COCIS'),
        ('cedat', 'CEDAT'),
        ('chs', 'CHS'),
        ('chuss', 'CHUSS'),
        ('conas', 'CONAS'),
        ('caes', 'CAES'),
        ('cobams', 'COBAMS'),
        ('covab', 'COVAB'),
        ('school of law', 'SCHOOL OF LAW'),
    ]
    Department_name = models.CharField(max_length=100, verbose_name='Department', choices=DEPARTMENT_CHOICES)
    description = models.TextField(verbose_name='Department Description')
    
    def __str__(self):
        return self.department_name
    
