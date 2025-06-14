from pathlib import Path
import os
from datetime import timedelta

import dj_database_url
import django_heroku

# ----------------------------------------------------------------------------
# Custom User Model
# ----------------------------------------------------------------------------

AUTH_USER_MODEL = 'users.User'

# ----------------------------------------------------------------------------
# Base Directory
# ----------------------------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

# ----------------------------------------------------------------------------
# Security Settings
# ----------------------------------------------------------------------------

SECRET_KEY = os.environ.get(
    'DJANGO_SECRET_KEY',
    'django-insecure-x&9+)hjc6k(tq_ob(m%dnc0r!g0ta@ow-emdqbc9k-2!&g3ni_'  # fallback for local dev
)

DEBUG = os.environ.get('DJANGO_DEBUG', '') != 'False'

ALLOWED_HOSTS = os.environ.get('DJANGO_ALLOWED_HOSTS', '*').split(',')

# ----------------------------------------------------------------------------
# Installed Applications
# ----------------------------------------------------------------------------

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Local apps
    'users',
    'issues',
    'department',

    # Third-party apps
    'rest_framework',
    'corsheaders',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
]

AUTHENTICATION_BACKENDS = [
    'users.authentication.EmailBackend',  # custom backend
    'django.contrib.auth.backends.ModelBackend',  # default
]

MIDDLEWARE = [
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'corsheaders.middleware.CorsMiddleware',
]

# ----------------------------------------------------------------------------
# URL Configuration
# ----------------------------------------------------------------------------

ROOT_URLCONF = 'AITS_backendproject.urls'

# ----------------------------------------------------------------------------
# Templates
# ----------------------------------------------------------------------------

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# ----------------------------------------------------------------------------
# WSGI Application
# ----------------------------------------------------------------------------

WSGI_APPLICATION = 'AITS_backendproject.wsgi.application'

# ----------------------------------------------------------------------------
# Database Configuration
# ----------------------------------------------------------------------------

DATABASES = {
    'default': dj_database_url.config(
        default=os.environ.get('DATABASE_URL'),
        conn_max_age=600,
        ssl_require=not DEBUG
    )
}

# If no DATABASE_URL is provided, use local SQLite
if not os.environ.get('DATABASE_URL'):
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# ----------------------------------------------------------------------------
# Password Validation
# ----------------------------------------------------------------------------

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ----------------------------------------------------------------------------
# Internationalization
# ----------------------------------------------------------------------------

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# ----------------------------------------------------------------------------
# Static Files
# ----------------------------------------------------------------------------

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# ----------------------------------------------------------------------------
# Default Primary Key Field Type
# ----------------------------------------------------------------------------

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ----------------------------------------------------------------------------
# Django REST Framework
# ----------------------------------------------------------------------------

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    )
}

# ----------------------------------------------------------------------------
# JWT Authentication
# ----------------------------------------------------------------------------

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'PASSWORD_RESET_TOKEN_LIFETIME': timedelta(hours=1),
}

# ----------------------------------------------------------------------------
# CORS Settings
# ----------------------------------------------------------------------------

CORS_ALLOWED_ORIGINS = [
    "https://group-k-academic-issue-tracking-system-atis-i1751nod2.vercel.app",
]
CORS_ALLOW_ALL_ORIGINS = True

# ----------------------------------------------------------------------------
# Email (Gmail SMTP Configuration)
# ----------------------------------------------------------------------------

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', 'groupkaits02@gmail.com')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', 'qpttfviwmffplljn')
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER

# ----------------------------------------------------------------------------
# Activate Django-Heroku'S Settings
# ----------------------------------------------------------------------------

django_heroku.settings(locals())
