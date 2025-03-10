import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useError } from "../components/providers&context/ErrorProvider";
import AuthCard from "../components/Layout/AuthCard";
import FormInput from "../components/form/FormInput";
import SubmitButton from "../components/common/SubmitButton";
import { useSuccessMessage } from "../components/providers&context/successMassageProvider";
import { useUser } from "../components/providers&context/userContext";
import Cookies from "js-cookie";
import Logo from "../assets/siteLogo/gray_trans.png"; // ✅ Logo added back
import { Divider } from "@mui/material";
import googleLogo from "../assets/logos/search.png";
import { useAuth } from "../components/providers&context/AuthContext";

const LoginPage: React.FC = () => {
  // Typed state variables
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
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
      const days = parseInt(expiresIn.replace("d", ""), 10);
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
        showError("Failed to login: " + err.message);
      } else {
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
    } catch {
      showError(`Failed to login with Google. Try again later.`);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center  w-full bg-gray-100 p-4 sm:p-8">
      {/* Left Side: Login Form */}
      <div className="w-full md:w-3/5 flex flex-col items-center justify-center">
        <AuthCard title="Login" description="Welcome back! Please log in.">
          <form onSubmit={handleSubmit} className="space-y-4 mb-4 w-full">
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
            <div className="flex justify-center">
              <SubmitButton loading={loading} text="Login" onClick={() => {}} className="w-full sm:w-auto" />
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
            <button onClick={handleGoogleLogin} className="w-12 h-12 flex items-center justify-center border border-gray-300 rounded-xl p-2 hover:opacity-80">
              <img src={googleLogo} alt="Google Login" className="w-8 h-8" />
            </button>
          </div>
        </AuthCard>
      </div>

      {/* Right Side: Logo (Hidden on Mobile) */}
      <div className="hidden sm:flex w-3/5 items-center justify-center">
        <img src={Logo} alt="app logo" className="w-4/5 max-w-xs md:max-w-2xl" />
      </div>
    </div>
  );
};

export default LoginPage;
