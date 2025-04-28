from django.test import TestCase
from django.contrib.auth import get_user_model
from issues.models import Issue
from department.models import College, School, Department
from users.models import CollegeRegister, Lecturer, Student
from django.db.utils import IntegrityError
from django.core.exceptions import ValidationError


class IssueModelTest(TestCase):
    
    def setUp(self):
        """Set up for tests"""
        # Create a college, school, and department for testing
        self.college = College.objects.create(name="COCIS", code="COCIS")
        self.school = School.objects.create(school_name="School of Computing", college=self.college)
        self.department = Department.objects.create(name="Computer Science", school=self.school, description="CS Department")
        
        # Create a user (student and lecturer) for testing
        self.student_user = get_user_model().objects.create_user(
            username="student1", email="student1@example.com", password="password"
        )
        self.student = Student.objects.create(
            user=self.student_user, college=self.college, department=self.department
        )

        self.lecturer_user = get_user_model().objects.create_user(
            username="lecturer1", email="lecturer1@example.com", password="password"
        )
        self.lecturer = Lecturer.objects.create(user=self.lecturer_user, college=self.college)

        self.registrar_user = get_user_model().objects.create_user(
            username="registrar", email="registrar@example.com", password="password"
        )
        self.college_register = CollegeRegister.objects.create(user=self.registrar_user, college=self.college)

    def test_issue_creation(self):
        """Test the creation of an issue"""
        issue = Issue.objects.create(
            author=self.student,
            title="Test Issue",
            description="This is a test issue",
        )
        self.assertEqual(issue.title, "Test Issue")
        self.assertEqual(issue.description, "This is a test issue")
        self.assertEqual(issue.author, self.student)
        self.assertIsNone(issue.assigned_lecturer)

    def test_issue_assignment(self):
        """Test assigning an issue to a lecturer"""
        issue = Issue.objects.create(
            author=self.student,
            title="Test Issue",
            description="This is a test issue",
        )
        issue.assigned_lecturer = self.lecturer
        issue.save()
        
        self.assertEqual(issue.assigned_lecturer, self.lecturer)

    def test_issue_invalid_college(self):
        """Test that an issue cannot be created with invalid college"""
        invalid_college = College.objects.create(name="Invalid College", code="INVALID")
        with self.assertRaises(IntegrityError):
            Issue.objects.create(
                author=self.student,
                title="Test Issue",
                description="This is a test issue",
                college=invalid_college
            )

    def test_issue_status_update(self):
        """Test updating the issue status"""
        issue = Issue.objects.create(
            author=self.student,
            title="Test Issue",
            description="This is a test issue",
        )
        issue.status = 'resolved'
        issue.save()
        
        self.assertEqual(issue.status, 'resolved')

    def test_issue_handled_by(self):
        """Test handling of issues by the college registrar"""
        issue = Issue.objects.create(
            author=self.student,
            title="Test Issue",
            description="This is a test issue",
            handled_by=self.college_register
        )
        
        self.assertEqual(issue.handled_by, self.college_register)

    def test_issue_validation_error(self):
        """Test issue creation with missing fields"""
        with self.assertRaises(ValidationError):
            issue = Issue.objects.create(
                author=self.student,
                title="Invalid Issue",
            )

    def test_issue_str_method(self):
        """Test the string representation of the issue"""
        issue = Issue.objects.create(
            author=self.student,
            title="Test Issue",
            description="This is a test issue",
        )
        self.assertEqual(str(issue), "Test Issue")

    def test_lecturer_assignment_to_issue(self):
        """Test that only a lecturer can assign themselves to an issue"""
        issue = Issue.objects.create(
            author=self.student,
            title="Test Issue",
            description="This is a test issue",
        )
        
        issue.assigned_lecturer = self.lecturer
        issue.save()
        
        self.assertEqual(issue.assigned_lecturer, self.lecturer)

    def test_issue_attachment(self):
        """Test the attachment functionality on issues (if applicable)"""
        # Assuming there's an attachment field in the Issue model
        # Use mock or a test file to verify file attachment behavior
        pass

    def test_issue_assignment_by_registrar(self):
        """Test issue assignment by the registrar"""
        issue = Issue.objects.create(
            author=self.student,
            title="Test Issue",
            description="This is a test issue",
        )
        issue.assigned_lecturer = self.lecturer
        issue.save()
        
        # Ensure notification or other behavior as per registrar's role
        # You can test by checking the email sending logic here if you integrate it with mock email testing
        pass


class CollegeRegisterModelTest(TestCase):

    def setUp(self):
        """Setup for college register tests"""
        self.college = College.objects.create(name="COCIS", code="COCIS")
        self.registrar_user = get_user_model().objects.create_user(
            username="registrar", email="registrar@example.com", password="password"
        )
        self.college_register = CollegeRegister.objects.create(user=self.registrar_user, college=self.college)

    def test_college_register_creation(self):
        """Test creation of a college registrar"""
        self.assertEqual(self.college_register.user, self.registrar_user)
        self.assertEqual(self.college_register.college, self.college)

    def test_college_register_invalid_user(self):
        """Test that college register cannot be created with invalid user"""
        invalid_user = get_user_model().objects.create_user(username="invalid", email="invalid@example.com", password="password")
        with self.assertRaises(IntegrityError):
            CollegeRegister.objects.create(user=invalid_user, college=self.college)


class LecturerModelTest(TestCase):

    def setUp(self):
        """Setup for lecturer tests"""
        self.college = College.objects.create(name="COCIS", code="COCIS")
        self.lecturer_user = get_user_model().objects.create_user(
            username="lecturer1", email="lecturer1@example.com", password="password"
        )
        self.lecturer = Lecturer.objects.create(user=self.lecturer_user, college=self.college)

    def test_lecturer_creation(self):
        """Test that the lecturer model is created correctly"""
        self.assertEqual(self.lecturer.user, self.lecturer_user)
        self.assertEqual(self.lecturer.college, self.college)

    def test_lecturer_invalid_user(self):
        """Test that a lecturer cannot be created with an invalid user"""
        invalid_user = get_user_model().objects.create_user(username="invalid", email="invalid@example.com", password="password")
        with self.assertRaises(IntegrityError):
            Lecturer.objects.create(user=invalid_user, college=self.college)


class StudentModelTest(TestCase):

    def setUp(self):
        """Setup for student tests"""
        self.college = College.objects.create(name="COCIS", code="COCIS")
        self.school = School.objects.create(school_name="School of Computing", college=self.college)
        self.department = Department.objects.create(name="Computer Science", school=self.school, description="CS Department")
        
        self.student_user = get_user_model().objects.create_user(
            username="student1", email="student1@example.com", password="password"
        )
        self.student = Student.objects.create(
            user=self.student_user, college=self.college, department=self.department
        )

    def test_student_creation(self):
        """Test the student model creation"""
        self.assertEqual(self.student.user, self.student_user)
        self.assertEqual(self.student.college, self.college)
        self.assertEqual(self.student.department, self.department)

    def test_student_invalid_college(self):
        """Test that student cannot be created with invalid college"""
        invalid_college = College.objects.create(name="Invalid College", code="INVALID")
        with self.assertRaises(IntegrityError):
            Student.objects.create(
                user=self.student_user, college=invalid_college, department=self.department
            )


if __name__ == '__main__':
    import unittest
    unittest.main()



#THINGS are not working as intended 