from rest_framework import viewsets, mixins, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import Student, Lecturer, CollegeRegister
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserProfileSerializer,
    StudentSerializer,
    LecturerSerializer,
    CollegeRegisterSerializer,
)

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
