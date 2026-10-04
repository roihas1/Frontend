import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Skeleton,
} from "@mui/material";
import { League } from "../../../pages/LeagueSelectionPage";
import { UserProfile } from "../../../types";

interface LeaguesSectionProps {
  profile: UserProfile;
  leagues: League[];
  loading: boolean;
  onManage: (league: League) => void;
  onLeave: (leagueId: string) => Promise<void>;
  isLeaving: boolean;
}

const LeaguesSection: React.FC<LeaguesSectionProps> = ({
  profile,
  leagues,
  loading,
  onManage,
  onLeave,
  isLeaving,
}) => {
  const [leaveTarget, setLeaveTarget] = useState<League | null>(null);

  const handleConfirmLeave = async () => {
    if (!leaveTarget?.id) {
      return;
    }
    await onLeave(leaveTarget.id);
    setLeaveTarget(null);
  };

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-colors-nba-blue mb-4">
        My leagues
      </h2>

      {loading ? (
        <div className="space-y-2">
          <Skeleton variant="rounded" height={56} />
          <Skeleton variant="rounded" height={56} />
        </div>
      ) : leagues.length === 0 ? (
        <p className="text-sm text-gray-600">
          You are not in any private leagues for this tournament yet.
        </p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {leagues.map((league) => {
            const isAdmin = league.admin?.id === profile.id;
            const memberCount = league.users?.length ?? 0;
            return (
              <li
                key={league.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {league.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {memberCount} member{memberCount === 1 ? "" : "s"}
                    {isAdmin ? " · You manage this league" : ""}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {isAdmin ? (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => onManage(league)}
                    >
                      Manage
                    </Button>
                  ) : (
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => setLeaveTarget(league)}
                      disabled={isLeaving}
                    >
                      Leave
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={!!leaveTarget} onClose={() => setLeaveTarget(null)}>
        <DialogTitle>Leave league?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Leave &quot;{leaveTarget?.name}&quot;? You can rejoin with an invite
            code later.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLeaveTarget(null)} disabled={isLeaving}>
            Cancel
          </Button>
          <Button
            color="error"
            onClick={() => void handleConfirmLeave()}
            disabled={isLeaving}
          >
            {isLeaving ? "Leaving…" : "Leave"}
          </Button>
        </DialogActions>
      </Dialog>
    </section>
  );
};

export default LeaguesSection;
