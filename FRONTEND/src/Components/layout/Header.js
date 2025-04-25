// src/components/Header.js
import { useState, useEffect } from "react";
import { FaBell, FaBars, FaTimes, FaSignOutAlt, FaUser } from "react-icons/fa";
import { FiSettings } from "react-icons/fi";
import { MdEmail } from "react-icons/md";
import axios from "axios";
import "../styles/header.css";
import MakLogo from "../assets/logo.png";

// ——————————————————————————————————————————————
// 1. Front-end hierarchy:  keys = college.code.toUpperCase()
// ——————————————————————————————————————————————
const hierarchy = {
  CAES: {
    "The School of Agricultural Sciences": [
      "Agricultural Production (AP)",
      "Agribusiness and Natural Resource Economics (Ag & NRE)",
      "Extension & Innovations (EI)",
    ],
    "The School of Forestry, Environmental and Geographical Sciences": [
      "The Department of Forestry, Bio-Diversity and Tourism (F, B & T)",
      "The Department of Environmental Management (EM)",
      "The Department of Geography, Geo Informatics and Climatic Sciences (GGCS)",
    ],
  },
  CEES: {
    "The School of Education (SoE)": [
      "Department of Social Sciences & Arts Education",
      "Department of Science, Technology & Vocational Education (DSTVE)",
      "Department of Foundations & Curriculum Studies (DFCS)",
    ],
    "The School of Distance and Lifelong Learning (SoDLL)": [
      "Department of Adult & Community Education (DACE)",
      "Institute of Open Distance and eLearning",
    ],
    "The East African School of Higher Education Studies and Development (EASHESD)":
      [],
  },
  CEDAT: {
    "School of Engineering": [
      "The Department of Civil and Environmental Engineering",
      "The Department of Electrical and Computer Engineering",
      "The Department of Mechanical Engineering",
    ],
    "School of the Built Environment": [
      "The Department of Architecture and Physical Planning",
      "The Department of Construction Economics and Management",
      "The Department of Geomatics and Land Management",
    ],
    "The Margaret Trowell School of Industrial and Fine Art": [
      "The Department of Fine Art",
      "The Department of Visual Communication Design and Multimedia",
      "The Department of Industrial Art and Applied Design",
    ],
  },
  CHS: {
    "The School of Medicine": [
      "Department of Internal Medicine",
      "Department of Surgery",
      "Department Obstetrics & Gynaecology",
      "Department of Psychiatry",
      "Department of Family Medicine",
      "Department of Anaesthesia",
      "Department of Ear Nose Throat",
      "Department of Ophthalmology",
      "Department of Orthopaedics",
      "Department of Radiology & Radio Therapy",
      "Medical Research Centre",
      "Reproductive Health Unit",
      "Department of Paediatrics & Child Health",
    ],
    "The School of Public Health": [
      "Department of Health Policy & Management",
      "Department of Epidemic & Biostatistics",
      "Department of Community Health & Behavioral Sciences",
      "Department of Disease Control & Environmental Health",
    ],
    "The School of Biomedical Sciences": [
      "Department of Human Anatomy",
      "Department of Biochemistry",
      "Department of Microbiology",
      "Department of Pathology",
      "Department of Physiology",
      "Department of Pharmacology & Therapeutics",
      "Department of Anatomy",
      "Department of Medical Illustration",
    ],
    "The School of Health Sciences": [
      "Department of Pharmacy",
      "Department of Dentistry",
      "Department of Nursing",
      "Department of Allied Health Sciences",
    ],
  },
  CHUSS: {
    "The School of Liberal and Performing Arts": [
      "The Department of Philosophy",
      "The Department of Development Studies",
      "The Department of Religion and Peace Studies",
      "The Department of Performing Arts & Film",
      "The Department of History, Archaeology & Organizational Studies",
    ],
    "The School of Women and Gender Studies": [],
    "The School of Languages, Literature and Communication": [
      "The Department of Literature",
      "The Department of Linguistics, English Language Studies & Communication Skills",
      "The Department of European and Oriental Languages",
      "The Department of African Languages",
      "The Department of Journalism and Communication",
      "The Department of Journalism and Communication - Student Projects",
      "Centres - Centre for Language and Communication Services",
      "Centres - Confucius Institute",
    ],
    "School of Psychology": [
      "The Department of Mental Health and Community Psychology",
      "The Department of Educational, Organizational and Social Psychology",
    ],
    "The School of Social Sciences": [
      "The Department of Sociology & Anthropology",
      "The Department of Social Work and Social Administration",
      "Projects - Child Trafficking Project",
      "The Department of Political Science and Public Administration",
    ],
    "Makerere Institute of Social Research (MISR)": [],
  },
  CONAS: {
    "The School of Physical Sciences": [
      "Department of Physics",
      "Department of Chemistry",
      "Department of Geology and Petroleum Studies",
      "Department of Mathematics",
    ],
    "The School of Biosciences": [
      "Department of Plant Sciences, Microbiology and Biotechnology",
      "Department of Biochemistry and Sports Science",
      "Department of Zoology, Entomology and Fisheries Sciences",
    ],
  },
  COBAMS: {
    "The School of Economics": [
      "The Department of Economic Theory and Analysis",
      "The Department of Policy and Development Economics",
    ],
    "School of Business": [
      "The Department of Marketing & Management",
      "The Department of Accounting and Finance",
    ],
    "School of Statistics and Planning": [
      "Department of Planning and Applied Statistics",
      "Department of Population Studies",
      "Department of Statistics and Actuarial Science",
    ],
  },
  COVAB: {
    "The School of Bio-security, Biotechnical and Laboratory Sciences": [],
    "The School of Veterinary and Animal Resources": [],
  },
  COCIS: {
    "School of Computing and Informatics Technology (CIT)": [
      "Computer Science",
      "Information Technology",
      "Department of Information Systems",
      "Department of Networks",
    ],
    "East African School of Library and Information Science (EASLIS)": [
      "The Department of Library and Information Sciences",
      "The Department of Records and Archives Management",
    ],
  },
};

const Header = ({
  toggleSidebar,
  isMobile,
  sidebarOpen,
  userRole,
  profile,
}) => {
  // ——————————
  // State
  // ——————————
  const [profileData, setProfileData] = useState({});
  const [colleges, setColleges] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [formData, setFormData] = useState({});

  // ——————————
  // 2. Fetch colleges from backend
  // ——————————
  useEffect(() => {
    axios
      .get(
        "https://aits-group-k-backend-7ede8a18ee73.herokuapp.com/department/colleges/"
      )
      .then(({ data }) => setColleges(data))
      .catch((err) => console.error("Error fetching colleges:", err));
  }, []);

  // ——————————
  // 3. Initialize profileData & formData from prop
  // ——————————
  useEffect(() => {
    const initial = profile
      ? Array.isArray(profile)
        ? profile[0]
        : profile
      : {};
    setProfileData(initial);

    // If your profile object has a college code field (e.g. initial.college_code),
    // map that; otherwise leave empty and let user pick.
    setFormData({
      ...initial,
      college: initial.college_code ? initial.college_code.toUpperCase() : "",
      school: initial.school || "",
      department: initial.department || "",
    });
  }, [profile]);

  // ——————————
  // Helpers for cascading options
  // ——————————
  const getInitials = (name) =>
    name
      ? name
          .trim()
          .split(" ")
          .slice(0, 2)
          .map((w) => w[0].toUpperCase())
          .join("")
      : "U";

  const schoolOptions = formData.college
    ? Object.keys(hierarchy[formData.college] || {})
    : [];
  const deptOptions =
    formData.college && formData.school
      ? hierarchy[formData.college][formData.school] || []
      : [];

  // ——————————
  // Handlers
  // ——————————
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const upd = { ...prev, [name]: value };
      if (name === "college") {
        upd.school = "";
        upd.department = "";
      } else if (name === "school") {
        upd.department = "";
      }
      return upd;
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("access_token");
      const { full_name, mak_email, user_role, student_no, ...payload } =
        formData;

      // Map college code back to its numeric ID
      const collegeObj = colleges.find(
        (c) => c.code.toUpperCase() === payload.college
      );

      await axios.put(
        `https://aits-group-k-backend-7ede8a18ee73.herokuapp.com/users/profile/update_me/`,
        {
          ...payload,
          college: collegeObj ? collegeObj.id : null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Profile updated!");
      setShowProfileForm(false);
    } catch (err) {
      console.error(err);
      alert("Update failed.");
    }
  };

  const handleLogout = () => {
    alert("Logout clicked");
    setProfileOpen(false);
  };
  const handleMyAccount = () => {
    setShowProfileForm(true);
    setProfileOpen(false);
  };
  const handleSettings = () => {
    alert("Settings clicked");
    setProfileOpen(false);
  };

  // ——————————
  // Render
  // ——————————
  return (
    <>
      <header className="header">
        <div className="header-left">
          {isMobile && (
            <button className="sidebar-toggle" onClick={toggleSidebar}>
              {sidebarOpen ? <FaTimes /> : <FaBars />}
            </button>
          )}
          <div className="logo">
            <img src={MakLogo} alt="MUK logo" />
            <h1>MAKERERE UNIVERSITY (AITS)</h1>
          </div>
        </div>
        <div className="header-right">
          <button className="icon-button">
            <MdEmail />
          </button>
          <div className="notification-container">
            <button
              className="icon-button"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
            >
              <FaBell />
              <span className="notification-badge">3</span>
            </button>
            {notificationsOpen && (
              <div className="dropdown-menu notification-menu">
                <div className="notification-item">
                  <p>New issue has been assigned</p>
                  <span className="notification-time">2 hours ago</span>
                </div>
                <div className="notification-item">
                  <p>Issue #5678 has been updated</p>
                  <span className="notification-time">Yesterday</span>
                </div>
                <div className="notification-item">
                  <p>Issue #9012 has been resolved</p>
                  <span className="notification-time">2 days ago</span>
                </div>
              </div>
            )}
          </div>
          <div className="profile-container">
            <button
              className="profile-button"
              onClick={() => setProfileOpen(!profileOpen)}
            >
              <div className="profile-initials">
                {getInitials(profileData.full_name)}
              </div>
            </button>
            {profileOpen && (
              <div className="dropdown-menu profile-menu">
                <div className="profile-options">
                  <h2 style={{ color: "black" }}>My Account</h2>
                  <button className="profile-option" onClick={handleMyAccount}>
                    <FaUser /> My profile
                  </button>
                  <button className="profile-option" onClick={handleSettings}>
                    <FiSettings /> Settings
                  </button>
                  <button
                    className="profile-option logout-option"
                    onClick={handleLogout}
                  >
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {showProfileForm && (
        <div className="profile-form-container">
          <form className="profile-form" onSubmit={handleFormSubmit}>
            <h2>Edit Profile</h2>

            {/* Read‑only */}
            <div className="readonly-field">
              <strong>Full Name:</strong> {formData.full_name}
            </div>
            <div className="readonly-field">
              <strong>Email:</strong> {formData.mak_email}
            </div>
            <div className="readonly-field">
              <strong>User Role:</strong> {formData.user_role}
            </div>
            <div className="readonly-field">
              <strong>Student No:</strong> {formData.student_no}
            </div>

            {/* College */}
            <label>
              College:
              <select
                name="college"
                value={formData.college || ""}
                onChange={handleInputChange}
              >
                <option value="">Select a college</option>
                {colleges.map((c) => (
                  <option key={c.id} value={c.code.toUpperCase()}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            {/* School */}
            <label>
              School:
              <select
                name="school"
                value={formData.school || ""}
                onChange={handleInputChange}
                disabled={!formData.college}
              >
                <option value="">Select a school</option>
                {schoolOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>

            {/* Department */}
            <label>
              Department:
              <select
                name="department"
                value={formData.department || ""}
                onChange={handleInputChange}
                disabled={!formData.school}
              >
                <option value="">Select a department</option>
                {deptOptions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </label>

            {/* Other fields */}
            <label>
              Gender:
              <select
                name="gender"
                value={formData.gender || ""}
                onChange={handleInputChange}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </label>
            <label>
              Office:
              <input
                type="text"
                name="office"
                value={formData.office || ""}
                onChange={handleInputChange}
              />
            </label>
            <label>
              Profile Picture URL:
              <input
                type="text"
                name="profile_pic"
                value={formData.profile_pic || ""}
                onChange={handleInputChange}
              />
            </label>
            {/* Notification Email */}
            <label>
              Notification Email:
              <input
                type="email"
                name="notification_email"
                value={formData.notification_email || ""}
                onChange={handleInputChange}
                placeholder="Enter notification email"
              />
            </label>

            <button type="submit">Save Changes</button>
            <button
              type="button"
              onClick={() => setShowProfileForm(false)}
              className="cancel-button"
            >
              Cancel
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Header;
