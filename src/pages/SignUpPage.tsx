import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useError } from "../components/providers&context/ErrorProvider";
import axiosInstance from "../api/axiosInstance";
import SubmitButton from "../components/common/SubmitButton";
import InputField from "../components/form/FormInput";
import { useSuccessMessage } from "../components/providers&context/successMassageProvider";
import Logo from "../assets/siteLogo/gray_trans.png";
import { AxiosError } from "axios";
import AuthCard from "../components/Layout/AuthCard";
import { Divider } from "@mui/material";
import googleLogo from "../assets/logos/search.png";

const SignUpPage: React.FC = () => {
  // Adding TypeScript types to state variables
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const { showError } = useError();
  const navigate = useNavigate();
  const { showSuccessMessage } = useSuccessMessage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      showError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await axiosInstance.post("/auth/signup/", {
        username,
        password,
        firstName,
        lastName,
        email,
      });

      setUsername("");
      setPassword("");
      setFirstName("");
      setLastName("");
      setEmail("");
      setConfirmPassword("");
      navigate("/login"); // Redirect to login page after successful sign-up
      showSuccessMessage("You are signed up! Let's log in.");
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      if (error.response) {
        showError(
          "Failed to sign up: " +
            (error.response.data.message || JSON.stringify(error.response.data))
        );
      } else if (error.request) {
        showError("Failed to sign up: No response from server.");
      } else {
        showError("Failed to sign up: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const baseUrl = window?.RUNTIME_CONFIG?.VITE_BASE_URL
        ? window.RUNTIME_CONFIG.VITE_BASE_URL
        : import.meta.env.VITE_BASE_URL;
      window.location.href = `${baseUrl}auth/google/login`;
    } catch {
      showError(`Failed to login with Google. Try again later.`);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center  w-full bg-gray-100 p-4 sm:p-8">
      {/* Left Side: Sign Up Form */}
      <div className="w-full md:w-3/5 flex flex-col items-center justify-center">
        <AuthCard
          title="Sign Up"
          description="Enter your details below to create your account and get started"
        >
          <div className="flex flex-col  space-y-4 sm:hidden mb-4">
            <Divider className="text-gray-400 text-xs mb-4">
              Sign Up with
            </Divider>
            <div className="flex justify-center">
              <button
                onClick={handleGoogleLogin}
                className="w-12 h-12 flex items-center justify-center border border-gray-300 rounded-xl p-2 hover:opacity-80"
              >
                <img src={googleLogo} alt="Google Login" className="w-8 h-8" />
              </button>
            </div>
            <Divider className="text-gray-400 text-xs mt-4">
              or use email
            </Divider>
          </div>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full"
          >
            <InputField
              id="username"
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <InputField
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <InputField
              id="firstName"
              label="First Name"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <InputField
              id="lastName"
              label="Last Name"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
            <div className="relative">
              <InputField
                id="password-signup"
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              
            </div>

            <InputField
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <div className="col-span-full flex justify-center">
              <SubmitButton
                loading={loading}
                text="Sign Up"
                className="w-full sm:w-auto"
              />
            </div>
          </form>
          <div className="my-4 text-center">
            <p className="text-sm text-gray-600">
              Already have an account ?{" "}
              <Link
                to="/login"
                className="text-colors-nba-blue hover:text-colors-nba-red"
              >
                Login
              </Link>
            </p>
          </div>
          <div className="hidden sm:flex flex-col space-y-2 mt-4">
            <Divider className="text-gray-400 text-xs mb-2">
              or continue with
            </Divider>
            <div className="flex justify-center">
              <button
                onClick={handleGoogleLogin}
                className="w-12 h-12 flex items-center justify-center border border-gray-300 rounded-xl p-2 hover:opacity-80"
              >
                <img src={googleLogo} alt="Google Login" className="w-8 h-8" />
              </button>
            </div>
          </div>
        </AuthCard>
      </div>

      {/* Right Side: Logo (Hidden on Mobile) */}
      <div className="hidden sm:flex w-3/5 items-center justify-center">
        <img
          src={Logo}
          alt="NBA Logo"
          className="w-4/5 max-w-xs md:max-w-2xl"
        />
      </div>
    </div>
  );
};

export default SignUpPage;
