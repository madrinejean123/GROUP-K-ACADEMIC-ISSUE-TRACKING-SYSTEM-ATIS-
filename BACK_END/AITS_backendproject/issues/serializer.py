from rest_framework import serializers
from .models import Issues
from users.serializers import StudentSerializer, LecturerSerializer, CollegeRegisterSerializer

class IssueSerializers(serializers.ModelSerializer):
    author = StudentSerializer(read_only=True)
    assigned_lecturer = LecturerSerializer(read_only=True)
    register = CollegeRegisterSerializer(read_only=True)

    class Meta:
        model = Issues
        fields = '__all__'
        read_only_fields = ['author', 'college', 'register', 'created_at']  # Auto-set fields

    def validate_status(self, value):
        """Ensure only lecturers can set 'resolved' or 'rejected'."""
        if value in ['resolved', 'rejected'] and not self.context['request'].user.is_lecturer:
            raise serializers.ValidationError("Only lecturers can resolve/reject issues.")
        return value
        