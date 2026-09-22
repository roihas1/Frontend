import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { useSuccessMessage } from "../components/providers&context/successMassageProvider";
import { useUser } from "../components/providers&context/userContext";
import { useAuth } from "../components/providers&context/AuthContext";
import { completeLoginSession } from "../auth/completeLoginSession";

const OAuthRedirectPage: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccessMessage } = useSuccessMessage();
  const { setRole } = useUser();
  const { setIsLoggedIn, checkAuthStatus } = useAuth();

  useEffect(() => {
    const handleOAuth = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const accessToken = urlParams.get("token");
      const expiresIn = urlParams.get("tokenExpiry");
      const userRole = urlParams.get("userRole");
      const username = urlParams.get("username");

      if (accessToken && username && expiresIn && userRole) {
        completeLoginSession({
          accessToken,
          expiresIn,
          username,
          userRole,
        });
        setRole(userRole);
        setIsLoggedIn(true);
        checkAuthStatus();
        showSuccessMessage("Logged in successfully!");
        navigate("/home");
      }
    };

    handleOAuth();
  }, [checkAuthStatus, navigate, setIsLoggedIn, setRole, showSuccessMessage]);

  return (
    <div>
      <h2>Redirecting...</h2>
      <CircularProgress />
    </div>
  );
};

export default OAuthRedirectPage;
