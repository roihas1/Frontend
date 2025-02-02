import { useEffect } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { useSuccessMessage } from "../components/successMassageProvider";
import { useUser } from "../components/userContext";
import { useError } from "../components/ErrorProvider";

const OAuthRedirectPage: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccessMessage } = useSuccessMessage();
  const { setRole } = useUser();
  const { showError } = useError();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    console.log(window.location.search, urlParams)
    const accessToken = urlParams.get("token");
    const expiresIn = urlParams.get("tokenExpiry");
    const userRole = urlParams.get("userRole");
    const username = urlParams.get("username");
    console.log(accessToken , expiresIn, userRole, username)

    console.log("Here after Google OAuth validation");

    if (accessToken && username && expiresIn && userRole) {
      // Store the token in cookies
      const days = parseInt(expiresIn.replace("d", ""));
      const expiresInSeconds = days * 24 * 60 * 60;
      Cookies.set("auth_token", accessToken, {
        expires: expiresInSeconds / (24 * 60 * 60),
      });
      localStorage.setItem("username", username);
      const expiryTime = Date.now() + expiresInSeconds * 1000;

      Cookies.set("tokenExpiry", expiryTime.toString(), {
        expires: expiresInSeconds / (24 * 60 * 60),
      });
      localStorage.setItem("role", userRole);
      setRole(userRole);
      showSuccessMessage("Logged in successfully!");
      // Redirect the user to the homepage or wherever you want
      navigate("/home"); // Or window.location.href = '/home'; if you don't use react-router
    } 
  }, [navigate]);

  return (
    <div>
      <h2>Redirecting...</h2>
      <CircularProgress />
    </div>
  );
};

export default OAuthRedirectPage;
