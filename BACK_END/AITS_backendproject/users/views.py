from rest_framework import viewsets, mixins, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from django.contrib.auth import authenticate, get_user_model
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.exceptions import TokenError,InvalidToken
from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache

from .models import Student, Lecturer, CollegeRegister
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserProfileSerializer,
    StudentSerializer,
    LecturerSerializer,
    CollegeRegisterSerializer,
    UserLogoutSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
)

from django.core.mail import send_mail
from django.urls import reverse
from django.conf import settings
from .models import User
import logging

User = get_user_model()


class UserRegistrationViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    """
    POST /users/register/  → create() handles registration
    """
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Build tokens dict
        refresh = RefreshToken.for_user(user)
        tokens = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }

        return Response({
            'user': UserProfileSerializer(user).data,
            'tokens': tokens,
        }, status=status.HTTP_201_CREATED)


class UserLoginViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    """
    POST /users/login/  → create() handles login
    """
    serializer_class = UserLoginSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['mak_email'].lower()
        password = serializer.validated_data['password']

        user = authenticate(username=email, password=password)
        if not user:
            return Response(
                {'detail': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Build tokens dict
        refresh = RefreshToken.for_user(user)
        tokens = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }

        return Response({
            'user': UserProfileSerializer(user).data,
            'tokens': tokens,
        }, status=status.HTTP_200_OK)


class UserProfileViewSet(viewsets.ViewSet):
    """
    GET    /users/profile/          → list()
    PUT    /users/profile/update_me/ → update_me()
    PATCH  /users/profile/update_me/
    """
    permission_classes = [IsAuthenticated]

    def list(self, request):           
        """
        Retrieve the profile of the authenticated user.
        (This is now wired to GET /users/profile/)
        """
        return Response(UserProfileSerializer(request.user).data)

    @action(detail=False, methods=['put', 'patch'], url_path='update_me')
    def update_me(self, request):
        """
        Update the authenticated user's profile.
        """
        partial = request.method.lower() == 'patch'
        serializer = UserProfileSerializer(
            request.user, data=request.data, partial=partial
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /users/users/             → list
    GET /users/users/{pk}/        → retrieve
    GET /users/users/students/    → students()
    GET /users/users/lecturers/   → lecturers()
    GET /users/users/registrars/  → registrars()
    """
    queryset = User.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [AllowAny]

    @action(detail=False, methods=['get'], url_path='students')
    def students(self, request):
        qs = Student.objects.select_related('user').all()
        return Response(StudentSerializer(qs, many=True).data)

    @action(detail=False, methods=['get'], url_path='lecturers')
    def lecturers(self, request):
        qs = Lecturer.objects.select_related('user').all()
        return Response(LecturerSerializer(qs, many=True).data)

    @action(detail=False, methods=['get'], url_path='registrars')
    def registrars(self, request):
        qs = CollegeRegister.objects.select_related('user').all()
        return Response(CollegeRegisterSerializer(qs, many=True).data)



class UserLogoutViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    """
    POST /users/logout/ → create() handles logout
    """
    serializer_class = UserLogoutSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            refresh_token = RefreshToken(serializer.validated_data['refresh'])
            refresh_token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except TokenError:
            return Response(
                {'detail': 'Invalid or expired token.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        


logger = logging.getLogger(__name__)

@method_decorator(never_cache, name='dispatch')
class PasswordResetViewSet(viewsets.GenericViewSet):
    """
    Handles:
    POST /password-reset/forgot-password/
    POST /password-reset/reset-password/
    """
    permission_classes = [AllowAny]
    serializer_classes = {
        'forgot_password': PasswordResetRequestSerializer,
        'reset_password': PasswordResetConfirmSerializer,
    }

    def get_serializer_class(self):
        return self.serializer_classes.get(self.action)

    @action(detail=False, methods=['post'], url_path='forgot-password')
    def forgot_password(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            user = User.objects.get(
                notification_email=serializer.validated_data['email']
            )
            token = str(RefreshToken.for_user(user).access_token)
            
            reset_link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
            
            send_mail(
                subject="Your Password Reset Request",
                message=(
                    f"Click the link to reset your password:\n{reset_link}\n\n"
                    "This link will expire in 1 hour.\n"
                    "If you didn't request this, please ignore this email."
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.notification_email],
                fail_silently=False,
            )
            
            logger.info(f"Password reset email sent to {user.notification_email}")
            
            return Response(
                {"detail": "Password reset link sent to your notification email."},
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            logger.error(f"Password reset error: {str(e)}")
            return Response(
                {"detail": "Failed to process reset request."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'], url_path='reset-password')
    def reset_password(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            # Secure token verification
            access_token = AccessToken(serializer.validated_data['token'])
            access_token.verify()
            
            user = User.objects.get(id=access_token['user_id'])
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            # Blacklist all refresh tokens for the user
            for token in user.refreshtoken_set.all():
                token.blacklist()
            
            logger.info(f"Password reset successful for user {user.id}")
            
            return Response(
                {"detail": "Password updated successfully."},
                status=status.HTTP_200_OK
            )
            
        except (TokenError, InvalidToken, User.DoesNotExist) as e:
            logger.warning(f"Invalid password reset attempt: {str(e)}")
            return Response(
                {"detail": "Invalid or expired token."},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Password reset error: {str(e)}")
            return Response(
                {"detail": "Failed to reset password."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
