import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { authAPI } from "../services/api";
import "./ResetPassword.css";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!token || !email) {
      setMessage("This password reset link is incomplete.");
      return;
    }
    if (password.length < 6) {
      setMessage("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      await authAPI.resetPassword({ email, token, password });
      setIsSuccess(true);
    } catch (error) {
      setMessage(error.message || "Unable to reset your password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <Navbar />
      <main className="auth-container">
        <div className="auth-card reset-password-card">
          <div className="auth-header">
            <div className="auth-logo-icon" aria-hidden="true">🚀</div>
            <h2>{isSuccess ? "Password Updated" : "Create New Password"}</h2>
            <p>
              {isSuccess
                ? "Your password has been reset successfully."
                : "Choose a new password for your Career Roadmap account."}
            </p>
          </div>

          {message && (
            <div className="auth-error-banner">
              <span>⚠️</span> {message}
            </div>
          )}

          {isSuccess ? (
            <button
              type="button"
              className="auth-submit-btn"
              onClick={() => navigate("/login", { replace: true })}
            >
              Continue to Login
            </button>
          ) : (
            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="new-password">New Password</label>
                <input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirm-password">Confirm Password</label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                  placeholder="Repeat your new password"
                />
              </div>

              <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Password"}
              </button>
            </form>
          )}

          {!isSuccess && (
            <div className="auth-switch">
              <span>Remembered your password?</span>
              <Link to="/login" className="auth-switch-link">
                Back to login
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ResetPassword;
