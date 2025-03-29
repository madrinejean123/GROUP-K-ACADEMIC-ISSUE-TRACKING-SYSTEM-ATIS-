from django.utils import timezone
from django.utils.crypto import get_random_string
from datetime import timedelta

def generate_reset_token():
    """Generate secure 32-character reset token"""
    return get_random_string(32)

def get_token_expiry():
    """Get timezone-aware expiry datetime (24 hours from now)"""
    return timezone.now() + timedelta(hours=24)

def validate_token_expiry(expiry):
    """Check if token is still valid"""
    return expiry and timezone.now() < expiry