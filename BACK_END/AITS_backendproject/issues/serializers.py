from rest_framework import serializers
from .models import Issues
from users.serializers import StudentSerializer, LecturerSerializer, CollegeRegisterSerializer
from users.models import Lecturer,CollegeRegister


# 1️⃣ Serializer for Creating Issues (Student Submits)
class IssueCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Issues
        fields = ['title', 'description', 'attachment']  # Student only provides these fields
    def create(self, validated_data):  
        student = self.context['request'].user.student  
        if not student:  
            raise serializers.ValidationError({"error": "Only students can create issues."})  

        # Debug: Print student's college  
        print(f"Student College: {student.college}")  

        college_register = CollegeRegister.objects.filter(college=student.college).first()  
        if not college_register:  
            raise serializers.ValidationError({"error": "No registrar found for your college."})  

        # Debug: Print registrar  
        print(f"Registrar: {college_register}")  

        # Force-save the issue  
        issue = Issues.objects.create(  
            author=student,  
            register=college_register,  
            college=student.college,  
            school=student.school,  
            department=student.department,  
            **validated_data  
        )  
        print(f"Issue created (ID: {issue.id})")  # Debug  
        return issue  
    

# 2️⃣ Serializer for College Register Assigning Lecturer
class IssueAssignSerializer(serializers.ModelSerializer):
    assigned_lecturer = serializers.PrimaryKeyRelatedField(queryset=Lecturer.objects.all())

    class Meta:
        model = Issues
        fields = ['assigned_lecturer']

    def update(self, instance, validated_data):
        """
        Only College Register can assign an issue to a lecturer.
        """
        request = self.context['request']
        if not hasattr(request.user, 'collegeregister'):
            raise serializers.ValidationError("Only College Registers can assign lecturers.")

        instance.assigned_lecturer = validated_data['assigned_lecturer']
        instance.save()
        return instance

# 3️⃣ Serializer for Lecturer Updating Issue Status
class IssueStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Issues
        fields = ['status']

    def validate_status(self, value):
        """
        Only lecturers can update the issue status.
        """
        request = self.context['request']
        if not hasattr(request.user, 'lecturer'):
            raise serializers.ValidationError("Only lecturers can update issue status.")

        if value not in ['resolved', 'rejected', 'in_progress']:
            raise serializers.ValidationError("Invalid status update.")

        return value

# 4️⃣ Serializer for Listing & Viewing Issues
class IssueDetailSerializer(serializers.ModelSerializer):
    author = StudentSerializer(read_only=True)
    assigned_lecturer = LecturerSerializer(read_only=True)
    register = CollegeRegisterSerializer(read_only=True)

    class Meta:
        model = Issues
        fields = '__all__'
        read_only_fields = ['author', 'college', 'school', 'department', 'register', 'created_at']  # Auto-set fields

    def validate_status(self, value):
        """
        Ensure only lecturers can set 'resolved' or 'rejected'.
        """
        request = self.context.get('request')
        if value in ['resolved', 'rejected'] and not hasattr(request.user, 'lecturer'):
            raise serializers.ValidationError("Only lecturers can resolve/reject issues.")
        return value

