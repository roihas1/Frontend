import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useError } from "../components/ErrorProvider";
import NBAlogo from "../assets/NBALogo.jpg";
import axiosInstance from "../api/axiosInstance";
import PageBackground from "../components/Layout/PageBackground";
import SubmitButton from "../components/form/SubmitButton";
import InputField from "../components/form/FormInput";

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
      navigate("/"); // Redirect to login page after successful sign-up
    } catch (err) {
      if (err.response) {
        console.log("Response error:", err.response.data);
        showError(
          "Failed to sign up: " + err.response.data.message || err.response.data
        );
      } else if (err.request) {
        console.log("Request error:", err.request);
        showError("Failed to sign up: No response from server.");
      } else {
        console.log("Error", err.message);
        showError("Failed to sign up: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-100">
      <PageBackground imageSrc={NBAlogo} />
      <div className="relative bg-gray-100 p-6 rounded-lg shadow-2xl w-full max-w-4xl z-10">
        <h2 className="text-2xl font-bold text-center text-black mb-4">Sign Up</h2>
        <p className="text-sm text-gray-700 mb-6 text-center">
          Enter your details below to create your account and get started
        </p>

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
    <SubmitButton loading={loading} text="Sign Up"  />
  </div>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/" className="text-colors-nba-blue hover:text-colors-nba-red">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;