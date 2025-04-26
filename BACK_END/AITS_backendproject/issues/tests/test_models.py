from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.exceptions import ValidationError
from users.models import User, Student, Lecturer, CollegeRegister
from department.models import College, School, Department
from issues.models import Issue
import os

class IssueModelTest(TestCase):
    def setUp(self):
        # Create test data
        self.college = College.objects.create(name="Test College")
        self.school = School.objects.create(school_name="Test School", college=self.college)
        self.department = Department.objects.create(name="Test Department", school=self.school)
        
        # Create users
        self.student_user = User.objects.create_user(
            username="student", 
            password="testpass123",
            user_role="student"
        )
        self.lecturer_user = User.objects.create_user(
            username="lecturer", 
            password="testpass123",
            user_role="lecturer"
        )
        self.registrar_user = User.objects.create_user(
            username="registrar", 
            password="testpass123",
            user_role="registrar"
        )
        
        self.student = Student.objects.create(
            user=self.student_user,
            college=self.college,
            school=self.school,
            department=self.department
        )
        self.lecturer = Lecturer.objects.create(user=self.lecturer_user)
        self.registrar = CollegeRegister.objects.create(user=self.registrar_user, college=self.college)
        
        # Sample valid file
        self.valid_file = SimpleUploadedFile(
            "test.pdf",
            b"file_content",
            content_type="application/pdf"
        )

    def test_create_issue_with_minimal_fields(self):
        """Test successful issue creation with required fields only"""
        issue = Issue.objects.create(
            title="Missing Marks",
            description="My marks are missing",
            author=self.student
        )
        self.assertEqual(issue.status, "open")
        self.assertIsNone(issue.attachment)
        
    def test_course_code_validation(self):
        """Test valid and invalid course codes"""
        # Valid code
        issue = Issue(
            title="Test",
            description="Test",
            author=self.student,
            course_code="MATH2200"
        )
        issue.full_clean()  # Should not raise
        
        # Invalid code (space)
        issue.course_code = "MATH 2200"
        with self.assertRaises(ValidationError):
            issue.full_clean()
            
        # Invalid code (lowercase)
        issue.course_code = "math2200"
        with self.assertRaises(ValidationError):
            issue.full_clean()

    def test_attachment_validation(self):
        """Test file size and type validation"""
        # Valid file
        issue = Issue(
            title="Test",
            description="Test",
            author=self.student,
            attachment=self.valid_file
        )
        issue.full_clean()  # Should pass
        
        # Invalid file type
        invalid_file = SimpleUploadedFile(
            "test.exe",
            b"file_content",
            content_type="application/exe"
        )
        issue.attachment = invalid_file
        with self.assertRaises(ValidationError):
            issue.full_clean()
        
        # File too large
        large_file = SimpleUploadedFile(
            "large.pdf",
            b"x" * (5 * 1024 * 1024 + 1),  # 5MB + 1 byte
            content_type="application/pdf"
        )
        issue.attachment = large_file
        with self.assertRaises(ValidationError):
            issue.full_clean()

    def test_status_transitions(self):
        """Test valid and invalid status changes"""
        issue = Issue.objects.create(
            title="Test",
            description="Test",
            author=self.student,
            status="open"
        )
        
        # Valid: open → in_progress
        issue.status = "in_progress"
        issue.full_clean()
        
        # Valid: in_progress → resolved (with notes)
        issue.status = "resolved"
        issue.resolution_notes = "Fixed"
        issue.full_clean()
        
        # Invalid: resolved → open (without proper workflow)
        issue.status = "open"
        with self.assertRaises(ValidationError):
            issue.full_clean()

    def test_resolution_notes_required(self):
        """Test resolution notes are required when resolving"""
        issue = Issue(
            title="Test",
            description="Test",
            author=self.student,
            status="resolved",
            resolution_notes=""  # Empty
        )
        with self.assertRaises(ValidationError):
            issue.full_clean()

    def test_auto_timestamps(self):
        """Test created_at/updated_at auto-population"""
        issue = Issue.objects.create(
            title="Test",
            description="Test",
            author=self.student
        )
        self.assertIsNotNone(issue.created_at)
        self.assertIsNotNone(issue.updated_at)
        self.assertIsNotNone(issue.status_changed_at)

    def test_str_representation(self):
        """Test the __str__ method"""
        issue = Issue.objects.create(
            title="Missing Marks",
            description="Test",
            author=self.student
        )
        self.assertEqual(
            str(issue),
            f"Issue #{issue.id}: Missing Marks (Open)"
        )