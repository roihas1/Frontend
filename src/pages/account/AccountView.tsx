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
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-colors-nba-blue">Account</h1>
        <p className="text-sm text-gray-500 mt-1">
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
