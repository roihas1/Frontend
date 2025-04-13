import { useEffect } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { useSuccessMessage } from "../components/providers&context/successMassageProvider";
import { useUser } from "../components/providers&context/userContext";
// import { useError } from "../components/providers&context/ErrorProvider";

const OAuthRedirectPage: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccessMessage } = useSuccessMessage();
  const { setRole } = useUser();
  // const { showError } = useError();

  useEffect(() => {
    const handleOAuth = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const accessToken = urlParams.get("token");
      const expiresIn = urlParams.get("tokenExpiry");
      const userRole = urlParams.get("userRole");
      const username = urlParams.get("username");

      if (accessToken && username && expiresIn && userRole) {
        const days = parseInt(expiresIn.replace("d", ""));
        const expiresInSeconds = days * 24 * 60 * 60;
        const expiryTime = Date.now() + expiresInSeconds * 1000;

        Cookies.set("auth_token", accessToken, {
          expires: expiresInSeconds / (24 * 60 * 60),
        });
        Cookies.set("tokenExpiry", expiryTime.toString(), {
          expires: expiresInSeconds / (24 * 60 * 60),
        });
        localStorage.setItem("username", username);
        localStorage.setItem("role", userRole);
        setRole(userRole);

        showSuccessMessage("Logged in successfully!");
        navigate("/home");
      }
    };

    handleOAuth();
  }, [navigate, setRole, showSuccessMessage]);

  return (
    <div>
      <h2>Redirecting...</h2>
      <CircularProgress />
    </div>
  );
};

export default OAuthRedirectPage;
