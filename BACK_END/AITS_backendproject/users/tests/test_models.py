'''
from django.test import TestCase
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from department.models import College, Department, School
from users.models import Student, Lecturer, CollegeRegister

User = get_user_model()

class UserModelTests(TestCase):
    def setUp(self):
        self.college = College.objects.create(name="College of Computing")
        self.school = School.objects.create(name="School of IT", college=self.college)
        self.department = Department.objects.create(name="Computer Science", school=self.school)

    def test_create_student_user_valid_email(self):
        user = User.objects.create_user(
            username="johnstudent",
            email="john.doe@gmail.com",
            password="pass1234",
            user_role="student",
            mak_email="john.doe@students.mak.ac.ug"
        )
        user.college = self.college
        user.save()
        self.assertEqual(user.user_role, "student")
        self.assertEqual(user.mak_email, "john.doe@students.mak.ac.ug")

    def test_create_user_invalid_student_email(self):
        with self.assertRaises(ValidationError):
            user = User(
                username="badstudent",
                email="bad.student@gmail.com",
                user_role="student",
                mak_email="bad.student@mak.ac.ug"
            )
            user.full_clean()

    def test_create_registrar_without_college(self):
        with self.assertRaises(ValidationError):
            user = User(
                username="nocollegeregistrar",
                email="registrar@example.com",
                user_role="registrar",
                mak_email="registrar.one@mak.ac.ug"
            )
            user.full_clean()

    def test_create_student_profile_and_sync_college(self):
        user = User.objects.create_user(
            username="studentuser",
            email="student.user@gmail.com",
            password="pass1234",
            user_role="student",
            mak_email="student.user@students.mak.ac.ug",
            college=self.college
        )
        student = Student.objects.create(
            user=user,
            student_no="2023-12345",
            college=self.college,
            department=self.department,
            school=self.school
        )
        self.assertEqual(student.college, user.college)

    def test_create_lecturer(self):
        user = User.objects.create_user(
            username="lecturer1",
            email="lecturer1@gmail.com",
            password="pass1234",
            user_role="lecturer",
            mak_email="lecturer.one@mak.ac.ug",
            college=self.college
        )
        lecturer = Lecturer.objects.create(
            user=user,
            department=self.department,
            college=self.college
        )
        self.assertTrue(lecturer.is_lecturer)
        self.assertEqual(lecturer.college, self.college)

    def test_create_college_registrar(self):
        user = User.objects.create_user(
            username="registraruser",
            email="registrar@gmail.com",
            password="pass1234",
            user_role="registrar",
            mak_email="registrar.one@mak.ac.ug",
            college=self.college
        )
        registrar = CollegeRegister.objects.create(
            user=user,
            college=self.college
        )
        self.assertEqual(registrar.college, user.college)

    def test_student_signal_syncs_college(self):
        user = User.objects.create_user(
            username="signalsyncstudent",
            email="sync.student@gmail.com",
            password="pass1234",
            user_role="student",
            mak_email="sync.student@students.mak.ac.ug"
        )
        student = Student.objects.create(
            user=user,
            student_no="2023-54321",
            college=self.college
        )
        self.assertEqual(user.college, self.college)

    def test_user_signal_syncs_college_to_student(self):
        user = User.objects.create_user(
            username="usersync",
            email="usersync@gmail.com",
            password="pass1234",
            user_role="student",
            mak_email="usersync@students.mak.ac.ug"
        )
        student = Student.objects.create(
            user=user,
            student_no="2023-67890"
        )
        user.college = self.college
        user.save()
        student.refresh_from_db()
        self.assertEqual(student.college, self.college)
'''