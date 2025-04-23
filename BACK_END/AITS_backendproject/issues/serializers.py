from rest_framework import serializers
from .models import Issue
from users.serializers import StudentSerializer, LecturerSerializer, CollegeRegisterSerializer
from users.models import Lecturer, CollegeRegister
import logging

logger = logging.getLogger(__name__)

class IssueCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Issue
        fields = ['title', 'description', 'category', 'course_code', 'attachment']
        extra_kwargs = {
            'attachment': {
                'required': False,
                'help_text': 'Upload file (JPG/PNG/PDF/DOC) up to 5MB'
            },
            'course_code': {
                'help_text': 'Format: 3-4 capital letters + 4 digits (e.g., CSC1200)'
            }
        }
    
    def validate_category(self, value):
        """Ensure category matches frontend choices exactly"""
        valid_categories = ['missing_marks', 'appeals', 'correction']
        if value not in valid_categories:
            raise serializers.ValidationError(
                f"Invalid category. Must be one of: {', '.join(valid_categories)}"
            )
        return value

    def create(self, validated_data):
        request = self.context['request']
        student = request.user.student
        
        if not student:
            raise serializers.ValidationError(
                {"error": "Only students can create issues"},
                code='student_required'
            )

        validated_data.update({
            'author': student,
            'college': student.college,
            'school': student.school,
            'department': student.department,
            'status': 'open'  # Frontend expects this default
        })

        try:
            college_register = CollegeRegister.objects.get(college=student.college)
            validated_data['handled_by'] = college_register
        except CollegeRegister.DoesNotExist:
            logger.warning(f"No registrar found for college {student.college}")

        try:
            issue = Issue.objects.create(**validated_data)
            return issue
        except Exception as e:
            logger.error(f"Issue creation failed: {str(e)}")
            raise serializers.ValidationError(
                {"error": "Failed to create issue. Please try again."},
                code='creation_failed'
            )

class IssueAssignSerializer(serializers.ModelSerializer):
    assigned_lecturer = LecturerSerializer(read_only=True)
    lecturer_id = serializers.PrimaryKeyRelatedField(
        queryset=Lecturer.objects.all(),
        source='assigned_lecturer',
        write_only=True,
        help_text="ID of lecturer to assign"
    )

    class Meta:
        model = Issue
        fields = ['assigned_lecturer', 'lecturer_id', 'status']
        read_only_fields = ['assigned_lecturer', 'status']
    
    def update(self, instance, validated_data):
        request = self.context['request']
        if not hasattr(request.user, 'collegeregister'):
            raise serializers.ValidationError(
                {"error": "Only College Registers can assign lecturers."},
                code='registrar_required'
            )

        instance.assigned_lecturer = validated_data['assigned_lecturer']
        instance.status = 'in_progress'
        instance.save()
        return instance

class IssueStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Issue
        fields = ['status', 'resolution_notes']
        extra_kwargs = {
            'resolution_notes': {
                'required': False,
                'allow_blank': True
            }
        }

    def validate(self, data):
        if data.get('status') == 'resolved' and not data.get('resolution_notes'):
            raise serializers.ValidationError(
                {"error": "Resolution notes are required when resolving an issue"},
                code='resolution_notes_required'
            )
        return data

    def update(self, instance, validated_data):
        request = self.context['request']
        if not hasattr(request.user, 'lecturer'):
            raise serializers.ValidationError(
                {"error": "Only lecturers can update issue status."},
                code='lecturer_required'
            )

        instance.status = validated_data['status']
        instance.resolution_notes = validated_data.get('resolution_notes', '')
        instance.save()
        return instance

class IssueDetailSerializer(serializers.ModelSerializer):
    author = StudentSerializer(read_only=True)
    assigned_lecturer = LecturerSerializer(read_only=True)
    handled_by = CollegeRegisterSerializer(read_only=True)
    attachment_url = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Issue
        fields = '__all__'
        read_only_fields = [
            'id', 'author', 'college', 'school', 'department',
            'handled_by', 'created_at', 'updated_at', 'status_changed_at'
        ]

    def get_attachment_url(self, obj):
        if obj.attachment:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.attachment.url)
        return None

    def to_representation(self, instance):
        """Frontend-friendly formatting"""
        data = super().to_representation(instance)
        # Convert status to match frontend display logic
        data['status'] = instance.status.replace('_', ' ').title()  
        return data
    
