import React, { useEffect, useState } from "react";
import { TextField } from "@mui/material";
import axios from "axios";
import SubmitButton from "../../common/SubmitButton";
import { UpdateProfilePayload, UserProfile } from "../../../types";

const USERNAME_TAKEN_MESSAGE =
  "This username is already taken. Please choose another one.";

interface ProfileSectionProps {
  profile: UserProfile;
  onSave: (payload: UpdateProfilePayload) => Promise<void>;
  checkUsernameAvailable: (username: string) => Promise<boolean>;
  isSaving: boolean;
}

function signInMethodLabel(profile: UserProfile): string {
  if (profile.hasPassword && profile.hasGoogle) {
    return "Password & Google";
  }
  if (profile.hasGoogle) {
    return "Google";
  }
  return "Password";
}

function initials(profile: UserProfile): string {
  const a = profile.firstName?.trim().charAt(0) ?? "";
  const b = profile.lastName?.trim().charAt(0) ?? "";
  return (a + b).toUpperCase() || profile.username.charAt(0).toUpperCase();
}

const ProfileSection: React.FC<ProfileSectionProps> = ({
  profile,
  onSave,
  checkUsernameAvailable,
  isSaving,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [username, setUsername] = useState(profile.username);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  useEffect(() => {
    setFirstName(profile.firstName);
    setLastName(profile.lastName);
    setUsername(profile.username);
  }, [profile]);

  const handleCancel = () => {
    setFirstName(profile.firstName);
    setLastName(profile.lastName);
    setUsername(profile.username);
    setUsernameError(null);
    setIsEditing(false);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setUsernameError(null);

    const trimmedUsername = username.trim();
    const payload: UpdateProfilePayload = {};
    if (firstName.trim() !== profile.firstName) {
      payload.firstName = firstName.trim();
    }
    if (lastName.trim() !== profile.lastName) {
      payload.lastName = lastName.trim();
    }
    const usernameChanged = trimmedUsername !== profile.username;
    if (usernameChanged) {
      if (trimmedUsername.length < 4 || trimmedUsername.length > 12) {
        setUsernameError("Username must be between 4 and 12 characters.");
        return;
      }
      setIsCheckingUsername(true);
      try {
        const available = await checkUsernameAvailable(trimmedUsername);
        if (!available) {
          setUsernameError(USERNAME_TAKEN_MESSAGE);
          return;
        }
      } catch {
        setUsernameError("Could not verify username. Try again.");
        return;
      } finally {
        setIsCheckingUsername(false);
      }
      payload.username = trimmedUsername;
    }
    if (Object.keys(payload).length === 0) {
      setIsEditing(false);
      return;
    }
    try {
      await onSave(payload);
      setIsEditing(false);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        setUsernameError(USERNAME_TAKEN_MESSAGE);
      }
    }
  };

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-colors-nba-blue mb-4">Profile</h2>
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-4">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-colors-nba-blue text-xl font-semibold text-white"
          aria-hidden
        >
          {initials(profile)}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-lg font-medium text-gray-900">
            {profile.firstName} {profile.lastName}
          </p>
          <p className="text-sm text-gray-600">@{profile.username}</p>
          <span className="inline-block rounded-full bg-gray-100 px-3 py-0.5 text-xs font-medium text-gray-700">
            Sign-in: {signInMethodLabel(profile)}
          </span>
        </div>
        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="shrink-0 rounded-lg border border-colors-nba-blue px-4 py-2 text-sm font-medium text-colors-nba-blue hover:bg-colors-nba-blue/5"
          >
            Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3">
          <TextField
            label="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            fullWidth
            required
            size="small"
          />
          <TextField
            label="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            fullWidth
            required
            size="small"
          />
          <TextField
            label="Username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (usernameError) {
                setUsernameError(null);
              }
            }}
            fullWidth
            required
            size="small"
            error={!!usernameError}
            helperText={
              usernameError ?? "4–12 characters. Must be unique."
            }
            inputProps={{ minLength: 4, maxLength: 12 }}
          />
          <TextField
            label="Email"
            value={profile.email}
            fullWidth
            size="small"
            disabled
            helperText="Email cannot be changed here."
          />
          <div className="flex flex-wrap gap-3 pt-2">
            <SubmitButton
              loading={isSaving || isCheckingUsername}
              text="Save"
              disabled={isSaving || isCheckingUsername}
              className="w-auto min-w-[7rem]"
            />
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-gray-500">Email</dt>
            <dd className="font-medium text-gray-900 break-all">{profile.email}</dd>
          </div>
        </dl>
      )}
    </section>
  );
};

export default ProfileSection;
