from rest_framework import serializers
from .models import CrimeReport as Report
from django.utils import timezone
import math
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password

class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = [
            'id',
            'crime_type',
            'crime_type_other',
            'description',
            'lat',
            'lon',
            'occurred_at',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']
    
    def validate_description(self, value):
        value = value.strip()
        
        if not value:
            raise serializers.ValidationError("Description cannot be empty.")
        elif len(value) < 10:
            raise serializers.ValidationError("Description must be at least 10 characters long.")
        elif len(value) > 300:
            raise serializers.ValidationError("Description cannot exceed 300 characters.")
        else:
            return value
    
    def validate_crime_type(self, value):
        if value is None:
            raise serializers.ValidationError("Crime type is required.")
        if not isinstance(value, str):
            raise serializers.ValidationError("Invalid crime type.")

        value = value.strip().lower()
        allowed_types = [choice[0] for choice in Report._meta.get_field('crime_type').choices]
        if value not in allowed_types:
            raise serializers.ValidationError(f"Crime type must be one of: {', '.join(allowed_types)}.")
        return value

    def validate_crime_type_other(self, value):
        # Determine crime_type from incoming data (not the already-validated field)
        crime_type_raw = self.initial_data.get('crime_type', '')
        crime_type = crime_type_raw.strip().lower() if isinstance(crime_type_raw, str) else str(crime_type_raw).lower()

        # If crime_type is not 'other', ignore any provided "other" text and clear the field
        if crime_type != 'other':
            return None

        # From here on we require a non-empty string value for crime_type_other
        if value is None:
            raise serializers.ValidationError("This field is required when crime type is 'other'.")
        if not isinstance(value, str):
            raise serializers.ValidationError("Invalid value for other crime type.")

        v = value.strip()
        if not v:
            raise serializers.ValidationError("This field is required when crime type is 'other'.")
        if len(v) < 3:
            raise serializers.ValidationError("Other crime type must be at least 3 characters long.")
        if len(v) > 50:
            raise serializers.ValidationError("Other crime type cannot exceed 50 characters.")

        return v
    
    def validate_lon(self, value):
        if not (-180 <= value <= 180):
            raise serializers.ValidationError("Longitude must be between -180 and 180.")
        if math.isnan(value) or math.isinf(value):
            raise serializers.ValidationError("Longitude must be a valid number.")  
        return value
    
    def validate_lat(self, value):
        if not (-90 <= value <= 90):
            raise serializers.ValidationError("Latitude must be between -90 and 90.")
        if math.isnan(value) or math.isinf(value):
            raise serializers.ValidationError("Latitude must be a valid number.")
        return value
    
    def validate_occurred_at(self, value):
        year_ago = timezone.now() - timezone.timedelta(days=365)
        if value < year_ago:
            raise serializers.ValidationError("Occurred at cannot be more than 1 year in the past.")
        if value > timezone.now():
            raise serializers.ValidationError("Occurred at cannot be in the future.")
        return value
    
    def validate(self, attrs):
        crime_type = attrs.get('crime_type', '').strip().lower()
        crime_type_other = attrs.get('crime_type_other')

        if crime_type == 'other' and not crime_type_other:
            raise serializers.ValidationError("crime_type_other is required when crime_type is 'other'.")
        if crime_type != 'other' and crime_type_other:
            raise serializers.ValidationError("crime_type_other must be empty when crime_type is not 'other'.")
        


        return attrs
    
class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    REpassword = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'REpassword']

    def validate(self, attrs):
        if attrs['password'] != attrs['REpassword']:
            raise serializers.ValidationError({"password": "Password needs to match."})
        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    new_password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    REnew_password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value

    def validate(self, attrs):
        if attrs['new_password'] != attrs['REnew_password']:
            raise serializers.ValidationError({"new_password": "New password needs to match."})
        if attrs['new_password'] == attrs['old_password']:
            raise serializers.ValidationError({"new_password": "New password cannot be the same as the old password."})
        validate_password(attrs['new_password'], user=self.context['request'].user)
        return attrs

class changeEmailSerializer(serializers.Serializer):
    old_email = serializers.EmailField(write_only=True, required=True)
    new_email = serializers.EmailField(write_only=True, required=True)

    def validate_old_email_password(self, value):
        user = self.context['request'].user
        if user.email != value:
            raise serializers.ValidationError("Old email is incorrect.")
        if not user.check_password(self.context['request'].data.get('password')):
            raise serializers.ValidationError("Password is incorrect.")
        return value

    def validate_new_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already in use.")
        return value