import React, { useState } from "react";
import { TextField } from "@mui/material";
import SubmitButton from "../../common/SubmitButton";
import { UserProfile } from "../../../types";
import { PASSWORD_STRENGTH_REGEX } from "../../../pages/account/accountValidation";

interface SecuritySectionProps {
  profile: UserProfile;
  onChangePassword: (payload: {
    currentPassword?: string;
    newPassword: string;
  }) => Promise<void>;
  isSubmitting: boolean;
}

const SecuritySection: React.FC<SecuritySectionProps> = ({
  profile,
  onChangePassword,
  isSubmitting,
}) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [clientError, setClientError] = useState<string | null>(null);

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setClientError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setClientError(null);

    if (newPassword !== confirmPassword) {
      setClientError("New passwords do not match.");
      return;
    }
    if (!PASSWORD_STRENGTH_REGEX.test(newPassword)) {
      setClientError(
        "Password must be 8+ characters with upper, lower, and a number or symbol.",
      );
      return;
    }

    try {
      await onChangePassword({
        currentPassword: profile.hasPassword ? currentPassword : undefined,
        newPassword,
      });
      resetForm();
    } catch {
      // Errors surfaced by model mutation
    }
  };

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-colors-nba-blue mb-2">
        Security
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        {profile.hasPassword
          ? "Change your account password."
          : "Set a password so you can sign in without Google."}
      </p>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3 max-w-md">
        {profile.hasPassword && (
          <TextField
            label="Current password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            fullWidth
            required
            size="small"
            autoComplete="current-password"
          />
        )}
        <TextField
          label="New password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          fullWidth
          required
          size="small"
          autoComplete="new-password"
        />
        <TextField
          label="Confirm new password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          fullWidth
          required
          size="small"
          autoComplete="new-password"
        />
        {clientError && (
          <p className="text-sm text-red-600" role="alert">
            {clientError}
          </p>
        )}
        <SubmitButton
          loading={isSubmitting}
          text={profile.hasPassword ? "Update password" : "Set password"}
          className="w-full sm:w-auto min-w-[10rem]"
        />
      </form>
    </section>
  );
};

export default SecuritySection;
