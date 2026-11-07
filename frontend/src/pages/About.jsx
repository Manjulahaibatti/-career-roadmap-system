import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./About.css";

const About = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;
    setSubmitted(true);
    setTimeout(() => {
      setContactForm({ name: "", email: "", message: "" });
      setSubmitted(false);
    }, 4000);
  };

  const steps = [
    {
      num: "01",
      title: "Discover Your Trajectory",
      desc: "Explore 16+ high-growth technical and non-technical career paths with transparent salary, skill demands, and daily scope.",
    },
    {
      num: "02",
      title: "Follow Ordered Milestones",
      desc: "Step through curated learning milestones — from foundational programming or marketing basics to production deployment.",
    },
    {
      num: "03",
      title: "Access Vetted Resources",
      desc: "Learn through top-tier courses (CS50, Google, Harvard, HubSpot), architectural guides, video breakdowns, and books.",
    },
    {
      num: "04",
      title: "Track Progress & Land the Job",
      desc: "Check off milestones, persist your progress directly to MongoDB, build capstone portfolio projects, and ace interviews.",
    },
  ];

  const values = [
    {
      icon: "🧭",
      title: "Discover Career Options",
      description:
        "Explore hundreds of tech trajectories with transparent details on salary expectations, skill demands, and day-to-day responsibilities.",
    },
    {
      icon: "🧩",
      title: "Understand Required Skills",
      description:
        "Cut through industry noise with curated core technical stacks, frameworks, and foundational concepts needed to succeed.",
    },
    {
      icon: "🗺️",
      title: "Build Personalized Roadmaps",
      description:
        "Step-by-step ordered learning milestones from absolute fundamentals to production deployment and technical interviews.",
    },
    {
      icon: "📚",
      title: "Find Curated Resources",
      description:
        "Hand-tested tutorials, books, video courses, and real-world projects vetted by senior engineers, designers, and managers.",
    },
    {
      icon: "📈",
      title: "Track Your Progress",
      description:
        "Keep yourself accountable with interactive milestone tracking saved directly to your profile and visualized on your dashboard.",
    },
    {
      icon: "🎯",
      title: "Achieve Career Mastery",
      description:
        "Transition from passive learner to job-ready professional equipped with portfolio capstone projects and interview readiness.",
    },
  ];

  const faqs = [
    {
      q: "Is Career Roadmap System free to use?",
      a: "Yes! All roadmaps, career previews, and curated resource links are 100% free and open for all learners.",
    },
    {
      q: "How are the career roadmaps designed and curated?",
      a: "Our roadmaps are synthesized from top industry engineering rubrics, university curricula (Harvard CS50, University of Helsinki), and real-world tech hiring frameworks.",
    },
    {
      q: "Do you offer both Technical and Non-Technical career roadmaps?",
      a: "Yes! We support software engineering, cloud, cybersecurity, data science, AI/ML alongside Product Management, UI/UX Design, Business Analysis, Digital Marketing, and Technical Writing.",
    },
    {
      q: "How is my progress saved?",
      a: "When you create an account and log in, every milestone checkbox you click on any career roadmap is synchronized with your MongoDB account profile.",
    },
  ];

  return (
    <div className="about-page">
      <Navbar />

      <main className="about-container">
        {/* HERO */}
        <section className="about-hero">
          <div className="about-pill">✦ Our Mission</div>
          <h1>
            Empowering the Next Generation of <span>Tech Leaders</span>
          </h1>
          <p className="about-lead">
            <strong>Career Roadmap System</strong> is an open career navigation
            platform designed to demystify technical growth. We bridge the gap between
            aimless tutorial consumption and deliberate career progress.
          </p>
        </section>

        {/* HOW IT WORKS 4-STEP FLOW */}
        <section className="how-it-works-section">
          <div className="section-title">
            <div></div>
            <h2>
              How It <span>Works</span>
            </h2>
            <div></div>
          </div>

          <div className="steps-flow-grid">
            {steps.map((s, idx) => (
              <div key={idx} className="step-card">
                <div className="step-num-badge">{s.num}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CORE PILLARS SECTION */}
        <section className="pillars-section">
          <div className="section-title">
            <div></div>
            <h2>
              How Career Roadmap System <span>Helps You Win</span>
            </h2>
            <div></div>
          </div>

          <div className="pillars-grid">
            {values.map((v, i) => (
              <div key={i} className="pillar-card">
                <div className="pillar-icon">{v.icon}</div>
                <h3>{v.title}</h3>
                <p>{v.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* COMPARISON TABLE */}
        <section className="comparison-section">
          <div className="section-title">
            <div></div>
            <h2>
              Random Tutorial Hopping vs <span>Career Roadmap System</span>
            </h2>
            <div></div>
          </div>

          <div className="comparison-table-wrapper">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Random Tutorial Hopping</th>
                  <th>Career Roadmap System</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Learning Structure</td>
                  <td className="bad">❌ Disorganized, duplicate videos</td>
                  <td className="good">✅ Step-by-step ordered milestones</td>
                </tr>
                <tr>
                  <td>Milestone Tracking</td>
                  <td className="bad">❌ No progress persistence</td>
                  <td className="good">✅ MongoDB-backed live progress tracking</td>
                </tr>
                <tr>
                  <td>Resource Quality</td>
                  <td className="bad">❌ Random outdated clickbait</td>
                  <td className="good">✅ Vetted courses (Harvard, Google, Coursera)</td>
                </tr>
                <tr>
                  <td>Career Coverage</td>
                  <td className="bad">❌ Only basic coding tutorials</td>
                  <td className="good">✅ 16+ Technical & Non-Technical paths</td>
                </tr>
                <tr>
                  <td>Job Readiness</td>
                  <td className="bad">❌ Tutorial paralysis</td>
                  <td className="good">✅ Capstone projects + interview tips</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ ACCORDION */}
        <section className="faq-section">
          <div className="section-title">
            <div></div>
            <h2>
              Frequently Asked <span>Questions</span>
            </h2>
            <div></div>
          </div>

          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`faq-item ${openFaq === index ? "open" : ""}`}
                onClick={() => toggleFaq(index)}
              >
                <div className="faq-question">
                  <span>{faq.q}</span>
                  <span className="faq-icon">{openFaq === index ? "−" : "+"}</span>
                </div>
                {openFaq === index && (
                  <div className="faq-answer">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* CONTACT / FEEDBACK FORM */}
        <section className="contact-feedback-section">
          <div className="contact-card">
            <h2>Have Questions or Suggestions?</h2>
            <p>We are continuously adding new career paths and curated resources.</p>

            {submitted ? (
              <div className="contact-success-msg">
                ✅ Thank you! Your message has been received. Our team will review your feedback.
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="contact-form">
                <div className="form-row-2">
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={contactForm.name}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, name: e.target.value })
                    }
                    required
                  />
                  <input
                    type="email"
                    placeholder="Your Email"
                    value={contactForm.email}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, email: e.target.value })
                    }
                    required
                  />
                </div>
                <textarea
                  rows="3"
                  placeholder="Suggest a new career roadmap, resource, or general feedback..."
                  value={contactForm.message}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, message: e.target.value })
                  }
                  required
                ></textarea>
                <button type="submit" className="contact-btn">
                  Send Feedback →
                </button>
              </form>
            )}
          </div>
        </section>

        {/* CTA BANNER */}
        <section className="about-cta">
          <div className="cta-content">
            <h2>Ready to plan your future?</h2>
            <p>
              Join thousands of aspiring developers, designers, and engineers
              charting their roadmap today.
            </p>
            <div className="cta-buttons">
              <Link to="/register" className="cta-primary-btn">
                Get Started Free →
              </Link>
              <Link to="/careers" className="cta-secondary-btn">
                Browse Careers
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
