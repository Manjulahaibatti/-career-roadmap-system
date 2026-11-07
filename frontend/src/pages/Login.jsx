import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { authAPI } from "../services/api";
import "./Login.css";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryMessage, setRecoveryMessage] = useState("");
  const [recoverySubmitted, setRecoverySubmitted] = useState(false);
  const [resetLink, setResetLink] = useState("");

  // If redirected from a protected page, show the passed message
  const stateMessage = location.state?.message || "";

  const validate = () => {
    const errs = {};
    if (!formData.email.trim()) {
      errs.email = "Email is required";
    } else if (
      !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/.test(formData.email.trim())
    ) {
      errs.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      errs.password = "Password is required";
    } else if (formData.password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
    setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setServerError("");

    try {
      await login(formData.email, formData.password);
      const destination = location.state?.from || "/dashboard";
      navigate(destination, { replace: true });
    } catch (err) {
      setServerError(
        err.message || "Failed to log in. Please verify your credentials."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecoverySubmit = async (e) => {
    e.preventDefault();
    const email = recoveryEmail.trim();

    if (!email) {
      setRecoveryMessage("Enter your email address to continue.");
      return;
    }

    if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/.test(email)) {
      setRecoveryMessage("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    setRecoveryMessage("");

    try {
      const response = await authAPI.forgotPassword(email);
      setRecoveryMessage(response.message);
      setResetLink(response.resetUrl || "");
      setRecoverySubmitted(true);
    } catch (error) {
      setRecoveryMessage(error.message || "Unable to request a password reset.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <Navbar />

      <main className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo-icon" aria-hidden="true">🚀</div>
            <h2>Welcome Back</h2>
            <p>Log in to access your personal career roadmap and track progress</p>
          </div>

          {stateMessage && (
            <div className="auth-info-banner">
              <span>ℹ️</span> {stateMessage}
            </div>
          )}

          {serverError && (
            <div className="auth-error-banner">
              <span>⚠️</span> {serverError}
            </div>
          )}

          {showForgotPassword ? (
            <form className="auth-form" onSubmit={handleRecoverySubmit} noValidate>
              <div className="auth-recovery-heading">
                <h3>Reset your password</h3>
                <p>Enter the email connected to your Career Roadmap account.</p>
              </div>

              {recoverySubmitted ? (
                <>
                  <div className="auth-info-banner">
                    <span>✓</span> {recoveryMessage}
                  </div>
                  {resetLink && (
                    <a className="dev-reset-link" href={resetLink}>
                      Open development reset link
                    </a>
                  )}
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label htmlFor="recovery-email">Email Address</label>
                    <input
                      id="recovery-email"
                      type="email"
                      placeholder="name@example.com"
                      value={recoveryEmail}
                      onChange={(e) => {
                        setRecoveryEmail(e.target.value);
                        setRecoveryMessage("");
                      }}
                      autoComplete="email"
                    />
                  </div>

                  {recoveryMessage && (
                    <div className="auth-info-banner">
                      <span>ℹ️</span> {recoveryMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="auth-submit-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Requesting..." : "Request Password Reset"}
                  </button>
                </>
              )}

              <button
                type="button"
                className="auth-back-btn"
                onClick={() => {
                  setShowForgotPassword(false);
                  setRecoveryMessage("");
                  setResetLink("");
                  setRecoverySubmitted(false);
                }}
              >
                Back to login
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? "input-error" : ""}
                  autoComplete="email"
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? "input-error" : ""}
                  autoComplete="current-password"
                />
                {errors.password && (
                  <span className="error-text">{errors.password}</span>
                )}
              </div>

              <button
                type="button"
                className="forgot-password-link"
                onClick={() => {
                  setShowForgotPassword(true);
                  setRecoveryEmail(formData.email);
                  setRecoverySubmitted(false);
                  setRecoveryMessage("");
                  setResetLink("");
                  setServerError("");
                }}
              >
                Forgot password?
              </button>

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="btn-loading">
                    <span className="mini-spinner"></span> Logging In...
                  </span>
                ) : (
                  "Login"
                )}
              </button>
            </form>
          )}

          <div className="auth-switch">
            <span>Don't have an account yet?</span>
            <Link to="/register" className="auth-switch-link">
              Create Account
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;
