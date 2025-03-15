import React, { useState } from "react";
import "./IssueForm.css";
import PageHeader from "../../Components/UserHeader/UserHeader";
import Footer from "../../Components/Footer/Footer";

const colleges = {
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
    "The East African School of Higher Education Studies and Development (EASHESD)": [],
  },
  SEDAT: {
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
  CoNAS: {
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
  CoVAB: {
    "The School of Bio-security, Biotechnical and Laboratory Sciences": [],
    "The School of Veterinary and Animal Resources": [],
  },
  CoBAMS: {
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
  CoCIS: {
    "School of Computing and Informatics Technology (CIT)": [
      "The Department of Computer Science",
      "The Department of Information Technology",
      "The Department of Information Systems",
      "The Department of Networks",
    ],
    "East African School of Library and Information Science (EASLIS)": [
      "The Department of Library and Information Sciences",
      "The Department of Records and Archives Management",
    ],
  },
};

const IssueForm = () => {
  const [selectedCollege, setSelectedCollege] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedAssessment, setSelectedAssessment] = useState(""); // New state for assessment type
  const [selectedComplaintCategory, setSelectedComplaintCategory] = useState(""); // New state for complaint category
  const [description, setDescription] = useState(""); // Description state
  const [attachment, setAttachment] = useState(null); // File attachment state
  const [schools, setSchools] = useState([]);
  const [departments, setDepartments] = useState([]);
  const years = [
    "2027/2028",
    "2026/2027",
    "2025/2026",
    "2024/2025",
    "2023/2024",
    "2022/2023",
    "2021/2022",
    "2020/2021",
    "2019/2020",
    "2018/2019",
  ];
  const semesters = ["Semester 1", "Semester 2"];
  const assessmentTypes = ["Test", "Coursework", "Final Exam"]; // Assessment options
  const complaintCategories = [
    "Missing Marks",
    "Appeal for Regrading",
    "Incorrect Marks",
  ]; // Complaint categories

  const updateSchools = (e) => {
    const college = e.target.value;
    setSelectedCollege(college);
    setSelectedSchool("");
    setSelectedDepartment("");
    setSelectedYear("");
    setSelectedSemester("");
    setSelectedAssessment(""); // Reset assessment when college is changed
    setSelectedComplaintCategory(""); // Reset complaint category when college is changed
    setSchools(college ? Object.keys(colleges[college]) : []);
    setDepartments([]);
  };

  const updateDepartments = (e) => {
    const school = e.target.value;
    setSelectedSchool(school);
    setSelectedDepartment("");
    setDepartments(selectedCollege ? colleges[selectedCollege][school] : []);
  };

  const handleFileChange = (e) => {
    setAttachment(e.target.files[0]);
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission, including file attachment
    if (attachment) {
      console.log("File selected: ", attachment.name);
    }
    console.log("Form submitted with description: ", description);
  };

  return (
    <>
      <PageHeader />
      <div className="IssueForm">
        <h2>ISSUE SUBMISSION FORM</h2>

        <form onSubmit={handleSubmit}>
          <label>Select College:</label>
          <select value={selectedCollege} onChange={updateSchools}>
            <option value="">--College--</option>
            {Object.keys(colleges).map((college) => (
              <option key={college} value={college}>
                {college}
              </option>
            ))}
          </select>

          <br />

          <label>Select School:</label>
          <select value={selectedSchool} onChange={updateDepartments} disabled={!selectedCollege}>
            <option value="">-- School--</option>
            {schools.map((school) => (
              <option key={school} value={school}>
                {school}
              </option>
            ))}
          </select>

          <br />

          <label>Select Department:</label>
          <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} disabled={!selectedSchool}>
            <option value="">-- Department--</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          <br />

          <label>Select Year:</label>
          <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
            <option value="">--Year--</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          <br />

          <label>Select Semester:</label>
          <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}>
            <option value="">-- Semester--</option>
            {semesters.map((semester) => (
              <option key={semester} value={semester}>
                {semester}
              </option>
            ))}
          </select>

          <br />

          <label>Select Assessment Type:</label>
          <select value={selectedAssessment} onChange={(e) => setSelectedAssessment(e.target.value)}>
            <option value="">-- Assessment Type--</option>
            {assessmentTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <br />

          <label>Select Complaint Category:</label>
          <select value={selectedComplaintCategory} onChange={(e) => setSelectedComplaintCategory(e.target.value)}>
            <option value="">--Complaint Category--</option>
            {complaintCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <br />

          <label>Description:</label>
          <textarea
            value={description}
            onChange={handleDescriptionChange}
            placeholder="Describe more here..."
          />
          <br />

          <label>Attach File (Optional):</label>
          <input type="file" onChange={handleFileChange} />

          <br />
          {attachment && <p>Selected file: {attachment.name}</p>} 

          <button type="submit">Submit</button>    <button type="cancel">Cancel</button>
         
        </form>
      </div>
      <Footer />
    </>
  );
};

export default IssueForm;
