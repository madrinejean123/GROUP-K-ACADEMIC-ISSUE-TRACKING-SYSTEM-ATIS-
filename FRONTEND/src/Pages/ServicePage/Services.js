import React from "react";
import Footer from "../../Components/Footer/Footer";
import HomeHeader from "../../Components/HomeHeader/HomeHeader";
import "../ServicePage/Services.css";

const Services = () => {
  return (
    <>
      <HomeHeader />
      <div className="services-container">
        <div className="services-header">
          <h1>Our Services</h1>
          <p>Comprehensive solutions for academic issue management</p>
        </div>

        <div className="services-grid">
          <div className="service-card">
            <div className="service-icon">
              <i className="fas fa-clipboard-list"></i>
            </div>
            <h3>Issue Logging</h3>
            <p>
              Students can easily submit academic issues through our intuitive
              interface. The system captures all necessary details including
              course information, issue type, and supporting documentation to
              ensure proper handling.
            </p>
            <ul className="service-features">
              <li>User-friendly submission form</li>
              <li>File attachment capabilities</li>
              <li>Issue categorization</li>
              <li>Automatic confirmation message</li>
            </ul>
          </div>

          <div className="service-card">
            <div className="service-icon">
              <i className="fas fa-tasks"></i>
            </div>
            <h3>Issue Assignment</h3>
            <p>
              The college registrar reviews submitted issues and assigns them to
              the appropriate lecturers based on department, course, and
              expertise. Our system ensures that issues are directed to the
              right personnel for efficient resolution.
            </p>
            <ul className="service-features">
              <li>Smart assignment recommendations</li>
              <li>Workload balancing</li>
              <li>Easy search for urgent issues</li>
              <li>Quick Means of Issue Assignment</li>
            </ul>
          </div>

          <div className="service-card">
            <div className="service-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <h3>Issue Resolution</h3>
            <p>
              Lecturers can view, manage, and resolve assigned issues through a
              well designed dashboard. The system provides tools to resolution
              steps, addition of comments on resolution of issues, and mark
              issues as resolved.
            </p>
            <ul className="service-features">
              <li>Resolution tracking</li>
              <li>Internal comments and status Update</li>
              <li>Resolution options</li>
              <li>Updating other Users</li>
            </ul>
          </div>

          <div className="service-card">
            <div className="service-icon">
              <i className="fas fa-comment-dots"></i>
            </div>
            <h3>Feedback System</h3>
            <p>
              Our platform facilitates clear communication between lecturers and
              students. Lecturers can provide detailed feedback on resolved
              issues, and students can request clarification if needed.
            </p>
            <ul className="service-features">
              <li>Structured feedback forms</li>
              <li>Follow-up question capability</li>
              <li>Satisfaction rating system</li>
              <li>Feedback history</li>
            </ul>
          </div>

          <div className="service-card">
            <div className="service-icon">
              <i className="fas fa-bell"></i>
            </div>
            <h3>Notification System</h3>
            <p>
              Stay informed with our comprehensive notification system. All
              stakeholders receive timely updates about issue status changes,
              new assignments, feedback, and approaching deadlines.
            </p>
            <ul className="service-features">
              <li>Email notifications</li>
              <li>In-app alerts</li>
              <li>Customizable notification preferences</li>
            </ul>
          </div>

          <div className="service-card">
            <div className="service-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <h3>Analytics & Reporting</h3>
            <p>
              Gain insights into issue trends, resolution times, and performance
              metrics. Our reporting tools help administrators identify common
              issues and improve academic processes.
            </p>
            <ul className="service-features">
              <li>Custom report generation</li>
              <li>Visual data dashboards</li>
              <li>Trend analysis</li>
              <li>Exportable reports</li>
            </ul>
          </div>
        </div>

        <div className="service-process">
          <h2>How It Works</h2>
          <div className="process-steps">
            <div className="process-step">
              <div className="step-number">1</div>
              <h4>Student Submits Issue</h4>
              <p>
                Student logs into the system and submits their academic issue
                with relevant details.
              </p>
            </div>
            <div className="process-step">
              <div className="step-number">2</div>
              <h4>Registrar Reviews</h4>
              <p>
                College registrar reviews the issue and assigns it to the
                appropriate lecturer.
              </p>
            </div>
            <div className="process-step">
              <div className="step-number">3</div>
              <h4>Lecturer Resolves</h4>
              <p>
                Assigned lecturer addresses the issue and documents the
                resolution.
              </p>
            </div>
            <div className="process-step">
              <div className="step-number">4</div>
              <h4>Feedback Provided</h4>
              <p>
                Lecturer provides feedback to the student & Registrar about the
                resolution.
              </p>
            </div>
            <div className="process-step">
              <div className="step-number">5</div>
              <h4>Issue Closed</h4>
              <p>
                The issue is marked as resolved and archived for future
                reference.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Services;
