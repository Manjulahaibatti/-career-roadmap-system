import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AuthPromptModal from "./components/AuthPromptModal";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/useAuth";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Careers from "./pages/Careers";
import Roadmap from "./pages/Roadmap";
import Resources from "./pages/Resources";
import About from "./pages/About";
import Profile from "./pages/Profile";

const AuthGatedInteractions = ({ children }) => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const location = useLocation();
  const isAuthPage = ["/login", "/register", "/reset-password"].includes(location.pathname);

  const requireAccountForClick = (event) => {
    if (isAuthenticated || isAuthPage || event.target.closest(".auth-modal-overlay")) return;

    const authLink = event.target.closest('a[href^="/login"], a[href^="/register"]');
    if (authLink) return;

    event.preventDefault();
    event.stopPropagation();
    openAuthModal("Create an account or log in to interact with career resources and tools.");
  };

  const requireAccountForSubmit = (event) => {
    if (isAuthenticated || isAuthPage) return;
    event.preventDefault();
    event.stopPropagation();
    openAuthModal("Create an account or log in to use this feature.");
  };

  return (
    <div onClickCapture={requireAccountForClick} onSubmitCapture={requireAccountForSubmit}>
      {children}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Global modal prompt when unauthenticated user triggers protected actions */}
        <AuthPromptModal />

        <AuthGatedInteractions>
        <Routes>
          {/* Public entry and account routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/register" element={<Register />} />

          {/* Content remains visible; interactions prompt signed-out visitors to authenticate. */}
          <Route path="/careers" element={<Careers />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/roadmap/:careerSlug" element={<Roadmap />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/about" element={<About />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </AuthGatedInteractions>
      </Router>
    </AuthProvider>
  );
}

export default App;