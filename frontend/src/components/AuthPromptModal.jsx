import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import "./AuthPromptModal.css";

const AuthPromptModal = () => {
  const { isAuthModalOpen, closeAuthModal, authModalMessage } = useAuth();
  const navigate = useNavigate();

  if (!isAuthModalOpen) return null;

  const handleLogin = () => {
    closeAuthModal();
    navigate("/login");
  };

  const handleRegister = () => {
    closeAuthModal();
    navigate("/register");
  };

  return (
    <div className="auth-modal-overlay" onClick={closeAuthModal}>
      <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
        <button
          className="auth-modal-close"
          onClick={closeAuthModal}
          aria-label="Close"
        >
          ✕
        </button>

        <div className="auth-modal-icon">🔒</div>

        <h3 className="auth-modal-title">Account Required</h3>

        <p className="auth-modal-text">
          {authModalMessage ||
            "Create an account or login to access your personalized career roadmap."}
        </p>

        <div className="auth-modal-actions">
          <button className="auth-modal-login-btn" onClick={handleLogin}>
            Login
          </button>
          <button className="auth-modal-register-btn" onClick={handleRegister}>
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPromptModal;
