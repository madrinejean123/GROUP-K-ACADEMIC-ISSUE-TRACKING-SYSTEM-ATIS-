import Footer from "../../Components/Footer/Footer";
import HomeHeader from "../../Components/HomeHeader/HomeHeader";
import "../AboutPage/About.css";

const About = () => {
  return (
    <>
      <HomeHeader />
      <div className="about-container">
        <div className="about-header">
          <h1>About Makerere University(AITS)</h1>
          <div className="about-header-underline"></div>
        </div>

        <div className="about-content">
          <div className="about-section">
            <h2>Our Mission</h2>
            <p>
              Academic Issue Tracking System is designed to streamline the process of
              addressing academic concerns within our institution. We believe
              that every student deserves prompt attention to their academic
              issues, and every staff member should have the tools to
              efficiently manage and resolve these concerns.
            </p>
          </div>

          <div className="about-section">
            <h2>Who We Are</h2>
            <p>
              Developed by a team of dedicated Computer Science students,
              our system bridges the gap between students and
              academic staff. We understand the challenges faced in academic
              administration and have created a solution that benefits all
              stakeholders in the educational ecosystem.
            </p>
          </div>

          <div className="about-cards">
            <div className="about-card">
              <div className="card-icon">
                <i className="fas fa-users"></i>
              </div>
              <h3>For Students</h3>
              <p>
                A simple platform to log academic issues, track their progress,
                and receive timely feedback from relevant lecturers.
              </p>
            </div>

            <div className="about-card">
              <div className="card-icon">
                <i className="fas fa-university"></i>
              </div>
              <h3>For Registrars</h3>
              <p>
                Efficient tools to manage incoming student issues, assign them to
                appropriate lecturers, and monitor resolution progress.
              </p>
            </div>

            <div className="about-card">
              <div className="card-icon">
                <i className="fas fa-chalkboard-teacher"></i>
              </div>
              <h3>For Lecturers</h3>
              <p>
                A centralized system to view assigned issues, provide
                resolutions, and communicate feedback to College registrar &students.
              </p>
            </div>
          </div>

          <div className="about-section">
            <h2>Our Approach</h2>
            <p>
              We've designed our system with simplicity and efficiency in mind.
              By digitizing the issue tracking process, we eliminate paperwork,
              reduce response times, and create accountability at every step.
              Our notification system ensures that all parties stay informed
              about issue status changes, creating a transparent environment for
              academic issue resolution.
            </p>
          </div>
        </div>

        <div className="about-stats">
          <div className="stat-item">
            <h3>98%</h3>
            <p>Issue Resolution Rate</p>
          </div>
          <div className="stat-item">
            <h3>24h</h3>
            <p>Average Response Time</p>
          </div>
          <div className="stat-item">
            <h3>5000+</h3>
            <p>Issues Resolved</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default About;
