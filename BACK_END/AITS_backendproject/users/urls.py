
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserRegistrationViewSet,
    UserLoginViewSet,
    UserProfileViewSet,
    UserViewSet,
    UserLogoutViewSet,
    PasswordResetViewSet
)

router = DefaultRouter()



router.register(r'register', UserRegistrationViewSet, basename='register')
router.register(r'login', UserLoginViewSet, basename='login')
router.register(r'logout', UserLogoutViewSet, basename='user-logout')
router.register(r'profile', UserProfileViewSet, basename='user-profile')
router.register(r'users', UserViewSet, basename='users')
router.register(r'password-reset', PasswordResetViewSet, basename='password-reset')


urlpatterns = [
    path('', include(router.urls)),
    #path('api/users/', include(router.urls)),
]
