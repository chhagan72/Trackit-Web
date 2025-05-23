"""
Django settings for trackit project.

Generated by 'django-admin startproject' using Django 4.1.13.

For more information on this file, see
https://docs.djangoproject.com/en/4.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/4.1/ref/settings/
"""

from pathlib import Path
import os
import firebase_admin
from firebase_admin import credentials, auth, firestore

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-xob8b5vzp1uw_8g*7)(+*e^$w&sb1*m#xc*_#cawf=c&22rp)u'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['*']


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'tracker',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'trackit.urls'

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

WSGI_APPLICATION = 'trackit.wsgi.application'


# Database
# https://docs.djangoproject.com/en/4.1/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Path to your service account key
cred = credentials.Certificate(r"C:\Users\ramch\OneDrive\Desktop\trackit\trackits-ea795-firebase-adminsdk-fbsvc-acf8274cd0.json")
firebase_admin.initialize_app(cred)
# db = firestore.client()

# Firebase API Base URL
FIREBASE_API_URL = "https://trackits-ea795-default-rtdb.firebaseio.com/"

# Session Configuration
SESSION_ENGINE = 'django.contrib.sessions.backends.db'


# BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# BASE_DIR = Path(__file__).resolve().parent.parent

# FIREBASE_CREDENTIALS_PATH = os.path.join(BASE_DIR, "trackits-ea795-firebase-adminsdk-fbsvc-acf8274cd0.json")

# try:
#     with open(FIREBASE_CREDENTIALS_PATH) as f:
#         firebase_credentials = json.load(f)

#     FIREBASE_API_KEY = firebase_credentials.get("AIzaSyDpbVFgPlPgcGXQttylQK_HQfhD6b0VElc")  # ✅ Correct way
#     FIREBASE_AUTH_USER = firebase_credentials.get("firebase-adminsdk-fbsvc@trackits-ea795.iam.gserviceaccount.com")  # ✅ Correct way

# except FileNotFoundError:
#     print(f"Error: Firebase credentials file not found at {FIREBASE_CREDENTIALS_PATH}")

# except KeyError as e:
#     print(f"Error: Missing key {e} in Firebase credentials JSON file.")


# Password validation
# https://docs.djangoproject.com/en/4.1/ref/settings/#auth-password-validators

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


# Internationalization
# https://docs.djangoproject.com/en/4.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.1/howto/static-files/

STATICFILES_DIRS=[
    BASE_DIR, "static"
]
STATIC_URL = 'static/'
# STATICFILES_DIRS = [
#     BASE_DIR / 'tracker/static',
# ]

# Default primary key field type
# https://docs.djangoproject.com/en/4.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
