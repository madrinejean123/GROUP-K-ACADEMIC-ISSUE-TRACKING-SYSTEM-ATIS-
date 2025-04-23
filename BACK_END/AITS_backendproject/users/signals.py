from django.db.models.signals import post_save  
from django.dispatch import receiver  
from users.models import User  

@receiver(post_save, sender=User)  
def update_student_college(sender, instance, **kwargs):  
    if hasattr(instance, 'student') and instance.college:  
        instance.student.college = instance.college  
        instance.student.save()  