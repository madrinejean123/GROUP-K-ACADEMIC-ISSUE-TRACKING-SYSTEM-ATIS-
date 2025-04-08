from pathlib import Path
import os
from datetime import timedelta

import dj_database_url
import django_heroku


# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# ------------------------------------------------------------------------------
# Quick‑start development settings - unsuitable for production
# ------------------------------------------------------------------------------

# SECURITY WARNING: keep the secret key used in production secret!
# (You can override this via Heroku config var DJANGO_SECRET_KEY)
SECRET_KEY = os.environ.get(
    'DJANGO_SECRET_KEY',
    'django-insecure-x&9+)hjc6k(tq_ob(m%dnc0r!g0ta@ow-emdqbc9k-2!&g3ni_'
)

# SECURITY WARNING: don't run with debug turned on in production!
# (Override via Heroku config var DJANGO_DEBUG=False)
DEBUG = os.environ.get('DJANGO_DEBUG', '') != 'False'

# Allow all hosts (you can tighten this via DJANGO_ALLOWED_HOSTS)
ALLOWED_HOSTS = os.environ.get('DJANGO_ALLOWED_HOSTS', '*').split(',')


# ------------------------------------------------------------------------------
# Application definition
# ------------------------------------------------------------------------------

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # your apps
    'users',
    'issues',
    'department',

    # third‑party
    'rest_framework',
    'corsheaders',
    'rest_framework_simplejwt',
]

MIDDLEWARE = [
    'whitenoise.middleware.WhiteNoiseMiddleware',           # serve static files
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # Ensure CORS middleware is listed
]

ROOT_URLCONF = 'AITS_backendproject.urls'

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

WSGI_APPLICATION = 'AITS_backendproject.wsgi.application'


# ------------------------------------------------------------------------------
# Database
# ------------------------------------------------------------------------------

# Use Heroku PostgreSQL or fallback to SQLite for local development
DATABASES = {
    'default': dj_database_url.config(
        default='sqlite:///' + str(BASE_DIR / 'db.sqlite3'),
        conn_max_age=600,
        ssl_require=True
    )
}


# ------------------------------------------------------------------------------
# Password validation
# ------------------------------------------------------------------------------

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# ------------------------------------------------------------------------------
# Internationalization
# ------------------------------------------------------------------------------

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# ------------------------------------------------------------------------------
# Static files (CSS, JavaScript, Images)
# ------------------------------------------------------------------------------

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Enable WhiteNoise to serve static files
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'


# ------------------------------------------------------------------------------
# Default primary key field type
# ------------------------------------------------------------------------------

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# ------------------------------------------------------------------------------
# Django REST Framework
# ------------------------------------------------------------------------------

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    )
}


# ------------------------------------------------------------------------------
# JWT Authentication
# ------------------------------------------------------------------------------

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}


# ------------------------------------------------------------------------------
# CORS settings
# ------------------------------------------------------------------------------

CORS_ALLOWED_ORIGINS = [
    "https://group-k-academic-issue-tracking-system-atis-i1751nod2.vercel.app",  # Allow Vercel frontend URL
]

# ------------------------------------------------------------------------------
# Activate Django-Heroku (must be at the bottom!)
# ------------------------------------------------------------------------------

django_heroku.settings(locals())

# ------------------------------------------------------------------------------
# Remove sslmode for SQLite (prevents sqlite3 adapter errors in local dev)
# ------------------------------------------------------------------------------

if DATABASES['default']['ENGINE'] == 'django.db.backends.sqlite3':
    DATABASES['default'].get('OPTIONS', {}).pop('sslmode', None)
