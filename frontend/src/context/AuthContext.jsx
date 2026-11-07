import { useState, useEffect } from "react";
import { AuthContext } from "./auth-context";
import { authAPI, progressAPI } from "../services/api";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("crs_token") || null);
  const [isLoading, setIsLoading] = useState(true);
  const [dataSyncNotice, setDataSyncNotice] = useState("");

  // Auth prompt modal state for protected actions
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMessage, setAuthModalMessage] = useState(
    "Create an account or login to access your personalized career roadmap."
  );

  const syncBrowserProgress = async (accessToken) => {
    try {
      const result = await progressAPI.migrateLocalProgress(accessToken);
      if (result.errors.length) {
        setDataSyncNotice(
          `Some saved progress could not be synced and remains in this browser. ${result.errors[0]}`
        );
      } else if (result.migratedCareers) {
        setDataSyncNotice(
          `Saved progress for ${result.migratedCareers} career roadmap${result.migratedCareers === 1 ? "" : "s"} synced to your account.`
        );
      }
    } catch (error) {
      console.error("Unable to sync browser progress:", error);
      setDataSyncNotice("Saved browser progress could not be synced. It remains in this browser; please try signing in again.");
    }
  };

  // On mount, if token exists, verify with backend /auth/me
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("crs_token");
      if (storedToken) {
        try {
          const res = await authAPI.getMe(storedToken);
          setUser(res.user);
          setToken(storedToken);
          await syncBrowserProgress(storedToken);
        } catch (err) {
          console.warn("Session expired or invalid token:", err.message);
          localStorage.removeItem("crs_token");
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    localStorage.setItem("crs_token", res.token);
    setToken(res.token);
    setUser(res.user);
    await syncBrowserProgress(res.token);
    return res;
  };

  const register = async (userData) => {
    const res = await authAPI.register(userData);
    localStorage.setItem("crs_token", res.token);
    setToken(res.token);
    setUser(res.user);
    await syncBrowserProgress(res.token);
    return res;
  };

  const logout = () => {
    localStorage.removeItem("crs_token");
    setToken(null);
    setUser(null);
    setDataSyncNotice("");
  };

  const updateUserCareer = async (careerSlug) => {
    if (!token) return;
    try {
      const res = await authAPI.updateCareerGoal(token, careerSlug);
      setUser((prev) => ({
        ...prev,
        currentCareer: res.currentCareer,
        savedCareers: res.savedCareers,
      }));
    } catch (err) {
      console.error("Failed to update career goal:", err);
      throw err;
    }
  };

  const updateUserProfile = async (profileData) => {
    if (!token) return;
    const res = await authAPI.updateProfile(token, profileData);
    if (res?.user) {
      setUser(res.user);
    }
    return res;
  };

  const openAuthModal = (message) => {
    if (message) {
      setAuthModalMessage(message);
    } else {
      setAuthModalMessage("Create an account or login to access your personalized career roadmap.");
    }
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const value = {
    user,
    token,
    dataSyncNotice,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    register,
    logout,
    updateUserCareer,
    updateUserProfile,
    isAuthModalOpen,
    authModalMessage,
    openAuthModal,
    closeAuthModal,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
