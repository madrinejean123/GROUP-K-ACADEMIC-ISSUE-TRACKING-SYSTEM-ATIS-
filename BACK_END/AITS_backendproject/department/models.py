from django.db import models

# College Choices
COLLEGE_CHOICES = [
    ('cees', 'College of Education and External Studies (CEES)'),
    ('cocis', 'College of Computing and Information Sciences (COCIS)'),
    ('cedat', 'College of Engineering, Design, Art and Technology (CEDAT)'),
    ('chs', 'College of Health Sciences (CHS)'),
    ('chuss', 'College of Humanities and Social Sciences (CHUSS)'),
    ('conas', 'College of Natural Sciences (CONAS)'),
    ('caes', 'College of Agricultural and Environmental Sciences (CAES)'),
    ('cobams', 'College of Business and Management Sciences (COBAMS)'),
    ('covab', 'College of Veterinary Medicine, Animal Resources and Biosecurity (COVAB)'),
]

# College Model
class College(models.Model):
    name = models.CharField(max_length=100, choices=COLLEGE_CHOICES, unique=True, default='')
    code = models.CharField(max_length=50, unique=True, default='COCIS')  # Default value

    def __str__(self):
        return self.get_name_display()  # Returns the full name of the college
    

class Department(models.Model):
    name = models.CharField(max_length=100, unique=True, default="Unnamed Department")  # Default value
    description = models.TextField(verbose_name='Department Description')
    college = models.ForeignKey(College, on_delete=models.CASCADE, related_name='departments', default=1)

    def __str__(self):
        return f"{self.name} ({self.college.name})"
    

    