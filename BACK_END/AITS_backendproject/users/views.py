from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from rest_framework.permissions import AllowAny
from .models import Student, Lecturer, CollegeRegister
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserProfileSerializer,
    UserUpdateSerializers,
    StudentSerializer,
    LecturerSerializer,
    CollegeRegisterSerializer,   
)


User = get_user_model()


# User Registration API
class UserRegistrationViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.AllowAny]
    serializer_class = UserRegistrationSerializer
    http_method_names = ['post']

    def create(self, request):
        print("Received data for registration:", request.data)  # Debugging: Print incoming data
        serializer = self.get_serializer(data=request.data)
        
        if not serializer.is_valid():
            print("Serializer errors:", serializer.errors)  # Debugging: Print errors to console
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.save()

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        tokens = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }

        return Response(
            {
                'user': UserProfileSerializer(user).data,  # Send user profile after registration
                'tokens': tokens,
            },
            status=status.HTTP_201_CREATED,
        )


# User Login API
class UserLoginViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]

    def create(self, request):
        print("Received data for login:", request.data)  # Debugging: Print incoming data
        serializer = UserLoginSerializer(data=request.data)
        
        if not serializer.is_valid():
            print("Serializer errors:", serializer.errors)  # Debugging: Print errors to console
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        mak_email = serializer.validated_data['mak_email'].lower()
        password = serializer.validated_data['password']

        # Check if the user exists using mak_email
        try:
            user = User.objects.get(mak_email=mak_email)
            print("User found:", user)  # Debugging: Print user details
        except User.DoesNotExist:
            print("User does not exist for mak_email:", mak_email)  # Debugging: Print user not found
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # Authenticate user using mak_email
        user = authenticate(request, username=mak_email, password=password)
        
        if not user:
            print("Authentication failed for mak_email:", mak_email)  # Debugging: Print failed login attempt
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        tokens = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }

        return Response(
            {
                'user': UserProfileSerializer(user).data,
                'tokens': tokens,
            },
            status=status.HTTP_200_OK,
        )


# User Profile API
class UserProfileViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        """GET /users/profile/ - Retrieve current user profile without requiring a pk"""
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        """GET /users/profile/ - Retrieve current user profile"""
        if pk is None:  # Ensure no pk is required
            serializer = UserProfileSerializer(request.user)
            return Response(serializer.data)
        return Response({"error": "This endpoint does not support pk-based retrieval."}, status=400)

    @action(detail=False, methods=['GET'])
    def me(self, request):
        """GET /users/profile/me/ - Alternate endpoint to view current user profile"""
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['PUT', 'PATCH'])
    def update_me(self, request):
        """PUT/PATCH /users/profile/update_me/ - Update current user profile"""
        is_partial = request.method == 'PATCH'
        serializer = UserUpdateSerializers(
            request.user,
            data=request.data,
            partial=is_partial,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


# User ViewSet
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['get'])
    def students(self, request):
        students = Student.objects.all()
        serializer = StudentSerializer(students, many=True)
        print("Returning students data:", serializer.data)  # Debugging: Print students data
        return Response(serializer.data)

    @action(detail=False, methods=['get'],url_path="lecturers", url_name="lecturers")
    def lecturers(self, request):
        lecturers = Lecturer.objects.all()
        serializer = LecturerSerializer(lecturers, many=True)
        print("Returning lecturers data:", serializer.data)  # Debugging: Print lecturers data
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def registrars(self, request):
        registrars = CollegeRegister.objects.all()
        serializer = CollegeRegisterSerializer(registrars, many=True)
        print("Returning registrars data:", serializer.data)  # Debugging: Print registrars data
        return Response(serializer.data)



