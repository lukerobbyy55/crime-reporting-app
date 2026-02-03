from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Report(models.Model):
    crime_type = models.CharField(choices=[
        ('theft', 'Theft'),
        ('assault', 'Assault'),
        ('burglary', 'Burglary'),
        ('vandalism', 'Vandalism'),
        ('fraud', 'Fraud'),
        ('other', 'Other'),], 
        max_length=20
        )
    crime_type_other = models.TextField(null=True, blank=True)
    description = models.TextField()
    lat = models.FloatField()
    lon = models.FloatField()
    occurred_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    reported_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports')
    
    def __str__(self):
        return f"Report #{self.id} | {self.crime_type} | user {self.reported_by_id}"