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
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { TrophyIcon } from "@heroicons/react/24/outline";
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
    <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white/80 shadow-sm supports-[backdrop-filter]:bg-white/70 supports-[backdrop-filter]:backdrop-blur-xl">
      <div className="border-b border-gray-100 px-4 py-3">
        <h2 className="text-base font-semibold text-colors-nba-blue">
          My leagues
        </h2>
      </div>

      <div className="px-2 py-2">
        {loading ? (
          <div className="space-y-2 px-2 py-1">
            <Skeleton variant="rounded" height={52} />
            <Skeleton variant="rounded" height={52} />
          </div>
        ) : leagues.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-colors-nba-blue/10 text-colors-nba-blue">
              <TrophyIcon className="h-5 w-5" aria-hidden />
            </span>
            <p className="text-sm font-medium text-gray-900">No leagues yet</p>
            <p className="text-xs text-gray-500">
              You are not in any private leagues for this tournament.
            </p>
          </div>
        ) : (
          <ul className="space-y-0.5">
            {leagues.map((league) => {
              const isAdmin = league.admin?.id === profile.id;
              const memberCount = league.users?.length ?? 0;
              return (
                <li key={league.id}>
                  <div className="flex min-h-12 items-center gap-3 rounded-xl px-3 py-2.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                      <TrophyIcon className="h-5 w-5" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {league.name}
                      </p>
                      <p className="truncate text-[11px] font-medium uppercase tracking-wide text-gray-400">
                        {memberCount} member{memberCount === 1 ? "" : "s"}
                        {isAdmin ? " · Admin" : ""}
                      </p>
                    </div>
                    {isAdmin ? (
                      <button
                        type="button"
                        onClick={() => onManage(league)}
                        className="inline-flex items-center gap-1 rounded-full bg-colors-nba-blue/10 px-2.5 py-1 text-[11px] font-semibold text-colors-nba-blue active:bg-colors-nba-blue/15"
                      >
                        Manage
                        <ChevronRightIcon className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setLeaveTarget(league)}
                        disabled={isLeaving}
                        className="rounded-full border border-red-200 px-2.5 py-1 text-[11px] font-semibold text-red-600 active:bg-red-50 disabled:opacity-50"
                      >
                        Leave
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

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
