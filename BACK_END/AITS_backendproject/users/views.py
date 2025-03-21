from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
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

<<<<<<< HEAD
# this  API enables users to regiser based on roles with the serializer verifying school webmail in the serialzer
=======
User = get_user_model()


# User Registration API
>>>>>>> 495e18720fc3e464cac6e2b2e0339a7f72197b96
class UserRegistrationViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.AllowAny]
    serializer_class = UserRegistrationSerializer
    http_method_names = ['post']

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print(serializer.errors)  # Debugging: Print errors to console
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

<<<<<<< HEAD
#fidel we need to work on this late cause its the only api still not functioning fully 
=======

# User Login API
>>>>>>> 495e18720fc3e464cac6e2b2e0339a7f72197b96
class UserLoginViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]

    def create(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if not serializer.is_valid():
            print(serializer.errors)  # Debugging: Print errors to console
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        mak_email = serializer.validated_data['mak_email'].lower()
        password = serializer.validated_data['password']

        # Authenticate user using mak_email
        user = authenticate(request, username=mak_email, password=password)  
        if not user:
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


<<<<<<< HEAD
=======
# User Profile API
>>>>>>> 495e18720fc3e464cac6e2b2e0339a7f72197b96
class UserProfileViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserProfileSerializer
    http_method_names = ['get', 'put']

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = UserUpdateSerializers(instance, data=request.data, partial=True)
        if not serializer.is_valid():
            print(serializer.errors)  # Debugging: Print errors to console
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response(serializer.data)


# Role-Based User Retrieval API
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.AllowAny]
<<<<<<< HEAD

=======
>>>>>>> 495e18720fc3e464cac6e2b2e0339a7f72197b96

    @action(detail=False, methods=['get'])
    def students(self, request):
        students = Student.objects.all()
        serializer = StudentSerializer(students, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def lecturers(self, request):
        lecturers = Lecturer.objects.all()
        serializer = LecturerSerializer(lecturers, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def registrars(self, request):
        registrars = CollegeRegister.objects.all()
        serializer = CollegeRegisterSerializer(registrars, many=True)
        return Response(serializer.data)
