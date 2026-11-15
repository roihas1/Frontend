import React from "react";
import ProfileSection from "../../components/forPages/account/ProfileSection";
import SecuritySection from "../../components/forPages/account/SecuritySection";
import LeaguesSection from "../../components/forPages/account/LeaguesSection";
import { AccountPageModel } from "./useAccountPageModel";

const AccountView: React.FC<AccountPageModel> = (model) => {
  const { profile } = model;
  if (!profile) {
    return null;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-2 py-4 sm:px-4 sm:py-6 sm:space-y-6">
      <div className="px-2 sm:px-0">
        <h1 className="text-2xl font-semibold text-colors-nba-blue sm:text-3xl">
          Account
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your profile, security, and league memberships.
        </p>
      </div>

      <ProfileSection
        profile={profile}
        onSave={async (payload) => {
          await model.updateProfile(payload);
        }}
        checkUsernameAvailable={model.checkUsernameAvailable}
        isSaving={model.isUpdatingProfile}
      />
      <SecuritySection
        profile={profile}
        onChangePassword={model.changePassword}
        isSubmitting={model.isChangingPassword}
      />
      <LeaguesSection
        profile={profile}
        leagues={model.leagues}
        loading={model.leaguesLoading}
        onManage={model.handleManageLeague}
        onLeave={model.leaveLeague}
        isLeaving={model.isLeavingLeague}
      />
    </div>
  );
};

export default AccountView;
