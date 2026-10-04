import React from "react";
import { Skeleton } from "@mui/material";
import AccountView from "./account/AccountView";
import { useAccountPageModel } from "./account/useAccountPageModel";

const AccountPage: React.FC = () => {
  const model = useAccountPageModel();

  if (model.loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <Skeleton variant="rounded" height={48} />
        <Skeleton variant="rounded" height={220} />
        <Skeleton variant="rounded" height={200} />
        <Skeleton variant="rounded" height={160} />
      </div>
    );
  }

  return <AccountView {...model} />;
};

export default AccountPage;
