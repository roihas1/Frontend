import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useError } from "../components/providers&context/ErrorProvider";
// import PageBackground from "../components/common/PageBackground";
import AuthCard from "../components/Layout/AuthCard";
import FormInput from "../components/form/FormInput";
import SubmitButton from "../components/common/SubmitButton";
import { useSuccessMessage } from "../components/providers&context/successMassageProvider";
import { useUser } from "../components/providers&context/userContext";
import Cookies from "js-cookie";
import Logo from "../assets/siteLogo/gray_trans.png";
import { Divider } from "@mui/material";
import googleLogo from "../assets/logos/search.png";
import { useAuth } from "../components/providers&context/AuthContext";

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const { showError } = useError();
  const navigate = useNavigate();
  const { showSuccessMessage } = useSuccessMessage();
  const { setRole } = useUser();
  const { setIsLoggedIn, checkAuthStatus } = useAuth();

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axiosInstance.post("/auth/signin", {
        username,
        password,
      });
      const { accessToken, expiresIn, userRole } = response.data;
      const days = parseInt(expiresIn.replace("d", ""));
      const expiresInSeconds = days * 24 * 60 * 60;

      Cookies.set("auth_token", accessToken, { expires: expiresInSeconds / (24 * 60 * 60) });
      localStorage.setItem("username", username);
      localStorage.setItem("role", userRole);
      setRole(userRole);
      setIsLoggedIn(true);
      checkAuthStatus();
      showSuccessMessage("Logged in successfully!");
      navigate("/home");
    } catch (err) {
      if (err instanceof Error) {
        console.log("Error:", err.message);
        showError("Failed to login: " + err.message);
      } else {
        console.log("Unknown error:", err);
        showError("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      window.location.href = `http://localhost:3000/auth/google/login`;
    } catch  {
      showError(`Failed to login with Google. Try again later.`);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center  w-full bg-gray-100">
      {/* Left Side: Login Content */}
      <div className="w-3/5 flex flex-col items-center justify-center ">
        <AuthCard title="Login" description="Welcome back! Please log in.">
          <form onSubmit={handleSubmit} className="space-y-4 mb-4">
            <FormInput
              id="username"
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <FormInput
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="col-span-full flex justify-center">
              <SubmitButton loading={loading} text="Login" onClick={() => {}} />
            </div>
          </form>

          <div className="my-4 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link to="/signup" className="text-colors-nba-blue hover:text-colors-nba-red">
                Sign Up
              </Link>
            </p>
          </div>
          <Divider className="text-gray-400 text-xs">or continue with</Divider>
          <div className="flex justify-center mt-4">
            <img
              src={googleLogo}
              className="w-10 h-10 border border-gray-300 rounded-xl p-1 cursor-pointer hover:opacity-80"
              onClick={handleGoogleLogin}
            />
          </div>
        </AuthCard>
      </div>

      {/* Right Side: Logo */}
      <div className="w-3/5 flex items-center justify-center">
        <img src={Logo} alt="app logo" className="w-4/5 max-w-2xl" />
      </div>
    </div>
  );
};

export default LoginPage;
