import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import NBAlogo from "../assets/NBALogo.jpg"; // Update with your logo's actual path
import axiosInstance from "../api/axiosInstance";
import { useError } from "../components/ErrorProvider";
import PageBackground from "../components/Layout/PageBackground";
import AuthCard from "../components/Layout/AuthCard";
import FormInput from "../components/form/FormInput";
import SubmitButton from "../components/form/SubmitButton";
import { useSuccessMessage } from "../components/successMassageProvider";
import { useUser } from "../components/userContext";


const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const { showError } = useError();
  const navigate = useNavigate();
  const {showSuccessMessage} = useSuccessMessage()
  const {setRole} = useUser()
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axiosInstance.post("/auth/signin", {
        username,
        password,
      });
      const { accessToken } = response.data;
      const { expiresIn } = response.data;
      const { userRole } = response.data
      localStorage.setItem('username', username);
      localStorage.setItem("token", accessToken);
      // localStorage.setItem('expiresIn',  Date.now() + expiresIn * 1000);
      console.log(accessToken, expiresIn, userRole);
      localStorage.setItem("role", userRole);
      setRole(userRole);
      showSuccessMessage('Logged in successfully!')
    navigate('/home')
    } catch (err) {
      if (err.response) {
        console.log("Response error:", err.response.data);
        showError(
          "Failed to login: " + err.response.data.message || err.response.data
        );
      } else if (err.request) {
        console.log("Request error:", err.request);
        showError("Failed to login: check your credentials.");
      } else {
        console.log("Error", err.message);
        showError("Failed to login: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen  flex items-center justify-center">
      {/* NBA Logo in the background */}
      <PageBackground imageSrc={NBAlogo} />

      {/* Login Form */}
      <AuthCard title="NBA App Login">
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <SubmitButton loading={loading} text="Login" onClick={handleSubmit}/>
          </div>
        </form>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-colors-nba-blue hover:text-colors-nba-red"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </AuthCard>
    </div>
  );
};

export default LoginPage;
