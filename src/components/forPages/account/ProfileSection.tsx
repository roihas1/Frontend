import React, { useEffect, useState } from "react";
import { TextField } from "@mui/material";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import SubmitButton from "../../common/SubmitButton";
import { UpdateProfilePayload, UserProfile } from "../../../types";
import axios from "axios";

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
    <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white/80 shadow-sm supports-[backdrop-filter]:bg-white/70 supports-[backdrop-filter]:backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
        <h2 className="text-base font-semibold text-colors-nba-blue">Profile</h2>
        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="hidden rounded-full px-3 py-1.5 text-sm font-medium text-colors-nba-blue active:bg-colors-nba-blue/5 sm:inline-flex"
          >
            Edit
          </button>
        )}
      </div>

      <div className="px-2 py-2">
        <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-colors-nba-blue text-sm font-semibold text-white"
            aria-hidden
          >
            {initials(profile)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-900">
              {profile.firstName} {profile.lastName}
            </p>
            <p className="truncate text-xs text-gray-500">@{profile.username}</p>
          </div>
          <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600">
            {signInMethodLabel(profile)}
          </span>
        </div>

        {!isEditing && (
          <div className="flex min-h-12 items-center gap-3 rounded-xl px-3 py-2.5">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                Email
              </p>
              <p className="truncate text-sm text-gray-900">{profile.email}</p>
            </div>
          </div>
        )}
      </div>

      {isEditing && (
        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="space-y-3 border-t border-gray-100 px-4 py-4"
        >
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
            helperText={usernameError ?? "4–12 characters. Must be unique."}
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
          <div className="flex flex-wrap gap-3 pt-1">
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
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 active:bg-black/5 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {!isEditing && (
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="flex min-h-12 w-full items-center gap-2 border-t border-gray-100 px-4 py-3 text-left text-sm font-medium text-colors-nba-blue active:bg-black/5 sm:hidden"
        >
          <span className="flex-1">Edit profile</span>
          <ChevronRightIcon className="h-4 w-4 text-gray-300" aria-hidden />
        </button>
      )}
    </section>
  );
};

export default ProfileSection;
