import { useState, useEffect } from "react";
import { Send } from "lucide-react";
import "./App.css";

export default function ChatbotUI() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      text: "Hello! Welcome to the ATS Resume Builder. How can I assist you today?",
      sender: "bot",
    },
  ]);
  const [showFormButton, setShowFormButton] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [downloadLink, setDownloadLink] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(1);
  const [templates, setTemplates] = useState([]);
  const [workExperiences, setWorkExperiences] = useState([{ id: 1 }]);
  const [educations, setEducations] = useState([{ id: 1 }]);

  // Load templates
  useEffect(() => {
    setTemplates([
      { id: 1, name: "Modern Template", image: "template1.png" },
      { id: 2, name: "Classic Template", image: "template2.png" },
      { id: 3, name: "Minimalist Template", image: "template3.png" },
    ]);
  }, []);

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, sender: "user" }]);
      setInput("");
      setShowFormButton(true);
    }
  };

  const openForm = () => setShowForm(true);

  const handleTemplateSelect = (id) => {
    setSelectedTemplate(id);
    alert(`Selected template: Template ${id}`);
  };

  const addWorkExperience = () => {
    setWorkExperiences([
      ...workExperiences,
      { id: workExperiences.length + 1 },
    ]);
  };

  const addEducation = () => {
    setEducations([...educations, { id: educations.length + 1 }]);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const workExperienceData = workExperiences.map((_, index) => ({
      title: e.target[`jobTitle${index}`].value,
      company: e.target[`company${index}`].value,
      dates: e.target[`workDates${index}`].value,
      description: e.target[`workDescription${index}`].value,
    }));

    const educationData = educations.map((_, index) => ({
      degree: e.target[`degree${index}`].value,
      school: e.target[`school${index}`].value,
      dates: e.target[`eduDates${index}`].value,
      description: e.target[`eduDescription${index}`].value,
    }));

    const formData = {
      template: selectedTemplate,
      name: e.target.name.value,
      title: e.target.title.value,
      contactInfo: {
        email: e.target.email.value,
        phone: e.target.phone.value,
        address: e.target.address.value,
        linkedin: e.target.linkedin.value,
        github: e.target.github.value,
      },
      summary: e.target.summary.value,
      workExperience: workExperienceData,
      education: educationData,
      skills: e.target.skills.value.split(","),
      certifications: e.target.certifications.value.split(","),
      projects: [
        {
          name: e.target.projectName.value,
          description: e.target.projectDescription.value,
        },
      ],
      languages: e.target.languages.value,
      achievements: e.target.achievements.value,
    };

    try {
      const response = await fetch("http://localhost:5000/generate-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (
        result.message === "Resume generated successfully!" &&
        result.download_link
      ) {
        setDownloadLink(result.download_link);
        alert(
          "✅ Resume generated successfully! Click the download link below."
        );
        setShowForm(false);
      } else {
        alert("❌ Failed to generate resume.");
      }
    } catch (error) {
      alert("⚠️ Error submitting form: " + error);
      console.error(error);
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}

        {showFormButton && !showForm && (
          <button onClick={openForm} className="form-button">
            Fill Necessary Details
          </button>
        )}

        {showForm && (
          <>
            <h3>Select a Resume Template</h3>
            <div
              className="template-scroll"
              style={{ display: "flex", overflowX: "auto" }}
            >
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="template-item"
                  onClick={() => handleTemplateSelect(template.id)}
                  style={{
                    margin: "10px",
                    cursor: "pointer",
                    border:
                      selectedTemplate === template.id
                        ? "2px solid #007bff"
                        : "1px solid #ddd",
                    padding: "10px",
                    borderRadius: "8px",
                    textAlign: "center",
                  }}
                >
                  <img
                    src={template.image}
                    alt={template.name}
                    style={{
                      width: "150px",
                      height: "200px",
                      borderRadius: "8px",
                    }}
                  />
                  <p>{template.name}</p>
                </div>
              ))}
            </div>

            <form
              onSubmit={handleFormSubmit}
              className="details-form"
              style={{ marginTop: "20px" }}
            >
              <h3>Personal Information</h3>
              <input name="name" type="text" placeholder="Full Name" required />
              <input
                name="title"
                type="text"
                placeholder="Job Title"
                required
              />
              <input name="email" type="email" placeholder="Email" required />
              <input name="phone" type="tel" placeholder="Phone" required />
              <input
                name="address"
                type="text"
                placeholder="Address"
                required
              />
              <input
                name="linkedin"
                type="url"
                placeholder="LinkedIn Profile"
              />
              <input name="github" type="url" placeholder="GitHub Profile" />

              <h3>Professional Summary</h3>
              <textarea
                name="summary"
                defaultValue="Results-driven [Job Title] with [X years] of experience in [Industry]. Proven track record of delivering [key achievements]. Adept at [key skills], collaborating with cross-functional teams, and driving project success. Seeking to leverage expertise to contribute to [company or role-specific goal]."
                required
              ></textarea>

              <h3>Work Experience</h3>
              {workExperiences.map((work, index) => (
                <div key={work.id}>
                  <input
                    name={`jobTitle${index}`}
                    type="text"
                    placeholder="Job Title"
                    required
                  />
                  <input
                    name={`company${index}`}
                    type="text"
                    placeholder="Company Name"
                    required
                  />
                  <input
                    name={`workDates${index}`}
                    type="text"
                    placeholder="Employment Dates"
                    required
                  />
                  <textarea
                    name={`workDescription${index}`}
                    defaultValue="As a [Job Title] at [Company Name] ([Month, Year] - [Month, Year]), I executed [specific tasks/projects], improved productivity using [specific software/tools], and collaborated with teams. Key achievements include leading [specific project] and enhancing [specific metric] by [percentage or measurable outcome]. My skills include [relevant software/tools], strong analytical abilities, and effective communication."
                    required
                  ></textarea>
                </div>
              ))}
              <button
                type="button"
                onClick={addWorkExperience}
                className="form-button"
              >
                + Add Work Experience
              </button>

              <h3>Education</h3>
              {educations.map((edu, index) => (
                <div key={edu.id}>
                  <input
                    name={`degree${index}`}
                    type="text"
                    placeholder="Degree"
                    required
                  />
                  <input
                    name={`school${index}`}
                    type="text"
                    placeholder="School/University"
                    required
                  />
                  <input
                    name={`eduDates${index}`}
                    type="text"
                    placeholder="Education Dates"
                    required
                  />
                  <textarea
                    name={`eduDescription${index}`}
                    defaultValue="I earned a [Degree] in [Field of Study] from [University Name] in [Location] ([Month, Year] - [Month, Year]). I maintained a [GPA/Grade] of [specific number/percentage], completed coursework in [specific subjects], and participated in [clubs/organizations]. I conducted research on [specific topics] and gained hands-on experience through [internships/practical training]. I received [awards/scholarships] in recognition of my academic excellence."
                    required
                  ></textarea>
                </div>
              ))}
              <button
                type="button"
                onClick={addEducation}
                className="form-button"
              >
                + Add Education
              </button>

              <h3>Skills</h3>
              <input
                name="skills"
                type="text"
                placeholder="Comma-separated skills"
                required
              />

              <h3>Certifications</h3>
              <input
                name="certifications"
                type="text"
                placeholder="Comma-separated certifications"
              />

              <h3>Projects</h3>
              <input
                name="projectName"
                type="text"
                placeholder="Project Name"
              />
              <textarea
                name="projectDescription"
                placeholder="Project details and achievements..."
              ></textarea>

              <h3>Languages</h3>
              <input
                name="languages"
                type="text"
                placeholder="Languages spoken (e.g., English, Spanish)"
              />

              <h3>Achievements</h3>
              <textarea
                name="achievements"
                placeholder="Key achievements and awards..."
              ></textarea>

              <button
                type="submit"
                className="form-button"
                style={{ marginTop: "20px" }}
              >
                Submit
              </button>
            </form>
          </>
        )}

        {downloadLink && (
          <div className="download-section" style={{ marginTop: "20px" }}>
            <a
              href={downloadLink}
              className="download-button"
              download
              style={{
                padding: "10px 20px",
                backgroundColor: "#28a745",
                color: "#fff",
                textDecoration: "none",
                borderRadius: "5px",
              }}
            >
              📥 Download Your Resume
            </a>
          </div>
        )}
      </div>

      <div className="chat-input" style={{ marginTop: "20px" }}>
        <input
          type="text"
          className="input-field"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          style={{ width: "80%", padding: "10px", marginRight: "10px" }}
        />
        <button
          onClick={handleSend}
          className="send-button"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "50px",
            weight: "50px",
            padding: "10px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "50%",
          }}
        >
          <Send size={25} color="white" />
        </button>
      </div>
    </div>
  );
}
