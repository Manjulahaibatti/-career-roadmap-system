import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { careersAPI, progressAPI } from "../services/api";
import { cuteProfileAvatars } from "../../../shared/profileAvatars.js";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./Profile.css";

const Profile = () => {
  const { user, token, updateUserProfile, logout, dataSyncNotice } = useAuth();
  const navigate = useNavigate();

  const [allCareers, setAllCareers] = useState([]);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [userProgressList, setUserProgressList] = useState([]);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    currentCareer: user?.currentCareer || "software-developer",
    targetRole: user?.targetRole || "Software Developer",
    experienceLevel: user?.experienceLevel || "Beginner / Student",
    bio: user?.bio || "",
    githubUrl: user?.githubUrl || "",
    linkedinUrl: user?.linkedinUrl || "",
    profileImage: user?.profileImage || "",
    profileAvatar: user?.profileAvatar || "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  // Fetch careers and overall progress count
  useEffect(() => {
    careersAPI
      .getAll()
      .then((data) => setAllCareers(data))
      .catch((err) => console.error(err));

    if (token) {
      progressAPI
        .getAll(token)
        .then((data) => {
          setUserProgressList(data);
          const total = data.reduce(
            (acc, curr) => acc + (curr.completedMilestones?.length || 0),
            0
          );
          setTotalCompleted(total);
        })
        .catch((err) => console.error(err));
    }
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (feedback.message) setFeedback({ type: "", message: "" });
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      setFeedback({ type: "error", message: "Choose a JPEG, PNG, WebP, or GIF image." });
      return;
    }
    if (file.size > 1024 * 1024) {
      setFeedback({ type: "error", message: "Profile images must be 1 MB or smaller." });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setFeedback({ type: "error", message: "Unable to read the selected image." });
        return;
      }
      setFormData((current) => ({ ...current, profileImage: reader.result, profileAvatar: "" }));
      setFeedback({ type: "", message: "" });
    };
    reader.onerror = () => {
      setFeedback({ type: "error", message: "Unable to read the selected image." });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFeedback({ type: "error", message: "Full name cannot be empty." });
      return;
    }

    setIsSaving(true);
    setFeedback({ type: "", message: "" });

    try {
      await updateUserProfile({
        name: formData.name.trim(),
        currentCareer: formData.currentCareer,
        targetRole: formData.targetRole,
        experienceLevel: formData.experienceLevel,
        bio: formData.bio,
        githubUrl: formData.githubUrl,
        linkedinUrl: formData.linkedinUrl,
        profileImage: formData.profileImage,
        profileAvatar: formData.profileAvatar,
      });

      setFeedback({
        type: "success",
        message: "Profile changes saved successfully to MongoDB!",
      });
      setTimeout(() => setFeedback({ type: "", message: "" }), 3000);
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.message || "Failed to update profile.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const currentCareerObj = allCareers.find(
    (c) => c.slug === formData.currentCareer
  );

  return (
    <div className="profile-page">
      <Navbar />

      <main className="profile-container">
        {/* HEADER HERO */}
        <section className="profile-hero-card">
          <div className="profile-hero-main">
            <div className="profile-avatar-group">
              <div className="profile-avatar-box">
                {formData.profileImage ? (
                  <img src={formData.profileImage} alt={`${formData.name || "User"} profile`} />
                ) : formData.profileAvatar ? (
                  <span className="profile-avatar-emoji">
                    {cuteProfileAvatars.find((avatar) => avatar.id === formData.profileAvatar)?.emoji || "🙂"}
                  </span>
                ) : (
                  <span className="profile-avatar-letter">
                    {formData.name ? formData.name.charAt(0).toUpperCase() : "U"}
                  </span>
                )}
              </div>
              <label className="profile-photo-button" htmlFor="profileImage">
                Change photo
              </label>
              <input
                id="profileImage"
                className="profile-photo-input"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleProfileImageChange}
              />
              {formData.profileImage && (
                <button
                  type="button"
                  className="profile-photo-remove"
                  onClick={() => setFormData((current) => ({ ...current, profileImage: "" }))}
                >
                  Remove
                </button>
              )}
            </div>

            <div className="profile-hero-info">
              <div className="profile-title-row">
                <h1>{formData.name || "User Profile"}</h1>
                <span className="profile-badge">Active Member</span>
              </div>
              <p className="profile-email-meta">✉️ {formData.email}</p>
              <p className="profile-subtext">
                Target Role: <strong>{formData.targetRole || "Tech Professional"}</strong> •{" "}
                {formData.experienceLevel}
              </p>
            </div>
          </div>

          <div className="profile-hero-actions">
            <Link to="/dashboard" className="prof-btn secondary">
              Dashboard →
            </Link>
            <button className="prof-btn logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </section>

        {dataSyncNotice && (
          <div className="data-sync-notice" role="status">
            {dataSyncNotice}
          </div>
        )}

        {/* STATS OVERVIEW */}
        <section className="profile-stats-row">
          <div className="p-card">
            <span className="p-num">{totalCompleted}</span>
            <span className="p-sub">Total Milestones Completed</span>
          </div>

          <div className="p-card">
            <span className="p-num">
              {currentCareerObj?.name || "Software Developer"}
            </span>
            <span className="p-sub">Primary Learning Focus</span>
          </div>

          <div className="p-card">
            <span className="p-num">{userProgressList.length || 1}</span>
            <span className="p-sub">Active Career Roadmaps</span>
          </div>

          <div className="p-card">
            <span className="p-num">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })
                : "—"}
            </span>
            <span className="p-sub">Member Since</span>
          </div>
        </section>

        {/* EDIT PROFILE FORM */}
        <section className="profile-form-card">
          <div className="form-card-header">
            <div>
              <h2>Edit Profile Information</h2>
              <p>Customize your personal profile and career aspirations</p>
            </div>
          </div>

          {feedback.message && (
            <div className={`feedback-alert ${feedback.type}`}>
              {feedback.type === "success" ? "✅" : "⚠️"} {feedback.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="profile-form">
            <fieldset className="avatar-picker">
              <legend>Choose a cute avatar</legend>
              <div className="avatar-picker-options">
                {cuteProfileAvatars.map((avatar) => (
                  <button
                    key={avatar.id}
                    type="button"
                    className={`avatar-option ${formData.profileAvatar === avatar.id ? "selected" : ""}`}
                    aria-label={avatar.label}
                    aria-pressed={formData.profileAvatar === avatar.id}
                    title={avatar.label}
                    onClick={() => setFormData((current) => ({
                      ...current,
                      profileAvatar: avatar.id,
                      profileImage: "",
                    }))}
                  >
                    <span aria-hidden="true">{avatar.emoji}</span>
                  </button>
                ))}
                <button
                  type="button"
                  className={`avatar-option avatar-initial-option ${
                    !formData.profileAvatar && !formData.profileImage ? "selected" : ""
                  }`}
                  aria-label="Use name initial"
                  aria-pressed={!formData.profileAvatar && !formData.profileImage}
                  title="Use name initial"
                  onClick={() => setFormData((current) => ({
                    ...current,
                    profileAvatar: "",
                    profileImage: "",
                  }))}
                >
                  {formData.name ? formData.name.charAt(0).toUpperCase() : "U"}
                </button>
              </div>
            </fieldset>
            <div className="form-grid-2">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address (Read-only)</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  readOnly
                  className="read-only-input"
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label htmlFor="currentCareer">Primary Career Focus</label>
                <select
                  id="currentCareer"
                  name="currentCareer"
                  value={formData.currentCareer}
                  onChange={handleChange}
                  className="profile-select"
                >
                  {allCareers.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="targetRole">Target Role / Job Title</label>
                <input
                  id="targetRole"
                  type="text"
                  name="targetRole"
                  value={formData.targetRole}
                  onChange={handleChange}
                  placeholder="e.g. Senior Frontend Engineer"
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label htmlFor="experienceLevel">Experience Level</label>
                <select
                  id="experienceLevel"
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleChange}
                  className="profile-select"
                >
                  <option value="Beginner / Student">Beginner / Student</option>
                  <option value="Junior (0-2 yrs)">Junior (0-2 yrs)</option>
                  <option value="Mid-level (2-5 yrs)">Mid-level (2-5 yrs)</option>
                  <option value="Senior (5+ yrs)">Senior (5+ yrs)</option>
                  <option value="Career Switcher">Career Switcher</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="githubUrl">GitHub / Portfolio Profile</label>
                <input
                  id="githubUrl"
                  type="url"
                  name="githubUrl"
                  value={formData.githubUrl}
                  onChange={handleChange}
                  placeholder="https://github.com/username"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="linkedinUrl">LinkedIn Profile</label>
              <input
                id="linkedinUrl"
                type="url"
                name="linkedinUrl"
                value={formData.linkedinUrl}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="bio">
                Bio / Summary ({formData.bio?.length || 0}/300 characters)
              </label>
              <textarea
                id="bio"
                name="bio"
                rows="3"
                value={formData.bio}
                onChange={handleChange}
                maxLength="300"
                placeholder="Share your learning focus, technical goals, or background..."
              ></textarea>
            </div>

            <div className="form-submit-row">
              <button
                type="submit"
                className="save-profile-btn"
                disabled={isSaving}
              >
                {isSaving ? "Saving to MongoDB..." : "Save Changes"}
              </button>

              <Link
                to={`/roadmap/${formData.currentCareer}`}
                className="view-roadmap-link"
              >
                Open Current Roadmap →
              </Link>
            </div>
          </form>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
