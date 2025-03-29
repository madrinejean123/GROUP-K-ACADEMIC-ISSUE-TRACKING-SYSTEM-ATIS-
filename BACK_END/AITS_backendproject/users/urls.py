from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserRegistrationViewSet,
    UserLoginViewSet,
    UserProfileViewSet,
    UserViewSet,
    ForgotPasswordView,
    ResetPasswordView,
)

router = DefaultRouter()
router.register(r'register', UserRegistrationViewSet, basename='register')
router.register(r'login', UserLoginViewSet, basename='login')
router.register(r'profile', UserProfileViewSet, basename='profile')  # This creates /profile/
router.register(r'users', UserViewSet, basename='users')

urlpatterns = [
    path('', include(router.urls)), 
    path('forgot-password/', ForgotPasswordView.as_view()),
    path('reset-password/', ResetPasswordView.as_view()),
]

