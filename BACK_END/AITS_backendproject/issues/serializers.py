from rest_framework import serializers
from .models import Issues
from users.serializers import StudentSerializer, LecturerSerializer, CollegeRegisterSerializer
from users.models import Lecturer,CollegeRegister


# 1️⃣ Serializer for Creating Issues (Student Submits)
class IssueCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Issues
        fields = ['title', 'description', 'attachment']
        extra_kwargs = {
            'attachment': {
                'required': False,
                'help_text': 'Upload image (JPG/PNG) or PDF file'
            }
        }
    
    def create(self, validated_data):
        request = self.context['request']
        student = request.user.student
        
        if not student:
            raise serializers.ValidationError(
                {"error": "Only students can create issues"},
                code='student_required'
            )

        # Debug prints - remove in production
        print(f"Creating issue for student: {student}")
        print(f"Student college: {student.college}")
        
        try:
            college_register = CollegeRegister.objects.get(college=student.college)
        except CollegeRegister.DoesNotExist:
            raise serializers.ValidationError(
                {"error": "No registrar available for your college"},
                code='no_registrar'
            )

        # Build issue data dict
        issue_data = {
            'author': student,
            'register': college_register,
            'college': student.college,
            'school': student.school,
            'department': student.department,
            **validated_data
        }
        
        # Debug print issue data
        print(f"Issue data: {issue_data}")
        
        # Create and save issue
        try:
            issue = Issues(**issue_data)
            issue.full_clean()  # Validate model fields
            issue.save()
            return issue
        except Exception as e:
            print(f"Error creating issue: {str(e)}")
            raise serializers.ValidationError(
                {"error": f"Failed to create issue: {str(e)}"},
                code='creation_failed'
            )

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
    from users.models import User


# 4️⃣ Serializer for Listing & Viewing Issues
class IssueDetailSerializer(serializers.ModelSerializer):
    author = StudentSerializer(read_only=True)
    assigned_lecturer = LecturerSerializer(read_only=True)
    register = CollegeRegisterSerializer(read_only=True)
    attachment_url = serializers.SerializerMethodField()

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
    #this is such that when i user click the url of an attached file it can fetch it from backend to front end so bascially for users to view the attached files
    def get_attachment_url(self, obj):
        if obj.attachment:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.attachment.url)
        return None

