import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#9b42ff",
          fontSize: "18px",
        }}
      >
        <div className="spinner"></div>
        <span style={{ marginLeft: "12px" }}>Loading Career Roadmap System...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{
          from: location.pathname,
          message: "Create an account or login to access your personalized career roadmap.",
        }}
        replace
      />
    );
  }

  return children;
};

export default ProtectedRoute;
