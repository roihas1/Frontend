import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useError } from "../components/providers&context/ErrorProvider";
import axiosInstance from "../api/axiosInstance";
// import PageBackground from "../components/common/PageBackground";
import SubmitButton from "../components/common/SubmitButton";
import InputField from "../components/form/FormInput";
import { useSuccessMessage } from "../components/providers&context/successMassageProvider";
import Logo from "../assets/siteLogo/gray_trans.png";
import { AxiosError } from "axios";
import AuthCard from "../components/Layout/AuthCard";

const SignUpPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
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

  return (
    <div className="flex items-center justify-center  w-full bg-gray-100">
      {/* Left Side: Sign Up Form */}
      <div className="w-3/5 flex flex-col items-center justify-center ">
        <AuthCard title="Sign Up" description="Enter your details below to create your account and get started">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <InputField
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <InputField
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <div className="col-span-full flex justify-center">
              <SubmitButton loading={loading} text="Sign Up" />
            </div>
          </form>
        </AuthCard>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Already have an account or want to sign up with google?{" "}
            <Link to="/login" className="text-colors-nba-blue hover:text-colors-nba-red">
              Login
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side: Bigger Logo */}
      <div className="w-3/5 flex items-center justify-center">
        <img src={Logo} alt="NBA Logo" className="w-4/5 max-w-2xl" />
      </div>
    </div>
  );
};

export default SignUpPage;
