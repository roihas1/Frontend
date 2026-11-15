import React, { useCallback, useState } from "react";
import { SwipeableDrawer, TextField } from "@mui/material";
import {
  ChevronRightIcon,
  Cog6ToothIcon,
  TrophyIcon,
  UserGroupIcon,
  ArrowRightOnRectangleIcon,
  PlusCircleIcon,
  KeyIcon,
} from "@heroicons/react/24/outline";
import axiosInstance from "../api/axiosInstance";
import {
  buildCreatePrivateLeagueRequest,
  buildJoinLeagueRequest,
} from "../api/privateLeagueRequests";
import {
  useError,
  useSuccessMessage,
} from "../components/providers&context/NotificationProvider";
import { User } from "../types";
import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "../api/getErrorMessage";
import { notify } from "../components/common/notify";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTournament } from "../components/providers&context/TournamentContext";
import {
  glassSheetHandleClassName,
  glassSheetPaperSx,
} from "../components/common/glassSheet";
import PullToRefreshIndicator from "../components/common/PullToRefreshIndicator";
import { usePullToRefresh } from "../hooks/usePullToRefresh";

export interface League {
  id?: string;
  name: string;
  code?: string;
  admin?: User;
  users?: User[];
}

const LeaguesSelectionPage: React.FC = () => {
  const { showError } = useError();
  const { showSuccessMessage } = useSuccessMessage();
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [showCreateNewLeague, setShowCreateNewLeague] =
    useState<boolean>(false);
  const [showJoinLeague, setShowJoinLeague] = useState<boolean>(false);
  const [leagueCode, setLeagueCode] = useState<string>("");
  const [leagueName, setLeagueName] = useState<string>("");
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { selectedTournamentId } = useTournament();

  const handleOpenOptions = (league: League) => {
    setSelectedLeague(league);
    setOptionsOpen(true);
  };

  const handleLeagueClick = (league: League) => {
    navigate(`/league`, { state: { league: league } });
  };

  const handleManageLeague = (league: League) => {
    navigate(`/manageLeague`, { state: { league: league } });
  };

  const handleCloseOptions = () => {
    setOptionsOpen(false);
    setSelectedLeague(null);
  };

  const { data: privateLeagues } = useQuery({
    queryKey: ["private-leagues", selectedTournamentId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/private-league`);
      return response.data;
    },
    enabled: !!selectedTournamentId,
    staleTime: 3 * 60 * 1000,
    gcTime: 3 * 60 * 1000,
    meta: { errorMessage: "Couldn't load leagues. Try again." },
  });

  const { data: overallUsers } = useQuery({
    queryKey: ["overall-league", selectedTournamentId],
    queryFn: async () => {
      const response = await axiosInstance.get("/auth/standings");
      return response.data;
    },
    enabled: !!selectedTournamentId,
    staleTime: 3 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    meta: { errorMessage: "Couldn't load the overall league. Try again." },
  });

  const overallLeague: League | null = overallUsers
    ? { name: "Overall", users: overallUsers }
    : null;

  const handleCreateNewLeague = () => setShowCreateNewLeague(true);
  const handleShowJoinLeague = () => setShowJoinLeague(true);

  const joinLeagueMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await axiosInstance.post(
        `/private-league/joinLeague`,
        buildJoinLeagueRequest(code, selectedTournamentId),
      );
      return response.data;
    },
    onSuccess: () => {
      showSuccessMessage("Joined the league!");
      queryClient.invalidateQueries({
        queryKey: ["private-leagues", selectedTournamentId],
      });
      setShowJoinLeague(false);
      setLeagueCode("");
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(
        error,
        "Couldn't join that league. Check the code and try again.",
      );
      if (message) showError(message);
    },
  });

  const handleJoinLeague = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leagueCode) {
      notify.warning("Enter a league code.");
      return;
    }
    joinLeagueMutation.mutate(leagueCode);
  };

  const { data: currentUser } = useQuery<User>({
    queryKey: ["current-user", selectedTournamentId],
    queryFn: async () => {
      const response = await axiosInstance.get("/auth/user");
      return response.data;
    },
    enabled: !!selectedTournamentId,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    meta: { errorMessage: "Couldn't load your info. Try again." },
  });

  const handleSubmitNewLeague = async () => {
    if (!leagueName) return notify.warning("Enter a league name.");
    try {
      await axiosInstance.post(
        `/private-league`,
        buildCreatePrivateLeagueRequest(leagueName, selectedTournamentId),
      );
      showSuccessMessage(
        `${leagueName} created.`,
        "Share the code with friends.",
      );
      setShowCreateNewLeague(false);

      await queryClient.invalidateQueries({
        queryKey: ["private-leagues", selectedTournamentId],
      });
      await queryClient.refetchQueries({
        queryKey: ["private-leagues", selectedTournamentId],
      });
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Couldn't create the league. Try again.",
      );
      if (message) showError(message);
    }
  };

  const handleLeaveLeague = async (league: League) => {
    try {
      await axiosInstance.patch(`/private-league/${league?.id}/leaveLeague`);
      showSuccessMessage("You left the league.");
      handleCloseOptions();
      await queryClient.invalidateQueries({
        queryKey: ["private-leagues", selectedTournamentId],
      });
      await queryClient.refetchQueries({
        queryKey: ["private-leagues", selectedTournamentId],
      });
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Couldn't leave the league. Try again.",
      );
      if (message) showError(message);
    }
  };

  const handleRefreshLeagues = useCallback(async () => {
    await Promise.all([
      queryClient.refetchQueries({
        queryKey: ["private-leagues", selectedTournamentId],
      }),
      queryClient.refetchQueries({
        queryKey: ["overall-league", selectedTournamentId],
      }),
    ]);
  }, [queryClient, selectedTournamentId]);

  const { pullDistance, progress, isRefreshing } = usePullToRefresh({
    onRefresh: handleRefreshLeagues,
    enabled: !!selectedTournamentId && !optionsOpen,
  });

  const isAdminOfSelected =
    !!selectedLeague?.admin?.id &&
    selectedLeague.admin.id === currentUser?.id;
  const canLeaveSelected =
    !!selectedLeague &&
    selectedLeague.name !== "Overall" &&
    selectedLeague.admin?.id !== currentUser?.id;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-1 py-2 sm:px-4">
      <PullToRefreshIndicator
        pullDistance={pullDistance}
        progress={progress}
        isRefreshing={isRefreshing}
      />

      {!showCreateNewLeague && !showJoinLeague && (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleCreateNewLeague}
            className="flex flex-col items-center gap-2 rounded-2xl border border-gray-200/80 bg-white/80 px-3 py-4 text-center shadow-sm transition-colors active:bg-black/5 supports-[backdrop-filter]:bg-white/70 supports-[backdrop-filter]:backdrop-blur-xl"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-colors-nba-blue/10 text-colors-nba-blue">
              <PlusCircleIcon className="h-5 w-5" aria-hidden />
            </span>
            <span className="text-sm font-semibold text-gray-900">
              Create league
            </span>
            <span className="text-xs leading-snug text-gray-500">
              Start a private league
            </span>
          </button>
          <button
            type="button"
            onClick={handleShowJoinLeague}
            className="flex flex-col items-center gap-2 rounded-2xl border border-gray-200/80 bg-white/80 px-3 py-4 text-center shadow-sm transition-colors active:bg-black/5 supports-[backdrop-filter]:bg-white/70 supports-[backdrop-filter]:backdrop-blur-xl"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
              <KeyIcon className="h-5 w-5" aria-hidden />
            </span>
            <span className="text-sm font-semibold text-gray-900">
              Join league
            </span>
            <span className="text-xs leading-snug text-gray-500">
              Enter an invite code
            </span>
          </button>
        </div>
      )}

      {showJoinLeague && (
        <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white/80 shadow-sm supports-[backdrop-filter]:bg-white/70 supports-[backdrop-filter]:backdrop-blur-xl">
          <div className="border-b border-gray-100 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                <KeyIcon className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-semibold text-colors-nba-blue">
                  Join league
                </h3>
                <p className="text-xs text-gray-500">
                  Paste the invite code from a friend
                </p>
              </div>
            </div>
          </div>
          <form
            className="space-y-3 px-4 py-4"
            onSubmit={(e) => {
              e.preventDefault();
              void handleJoinLeague(e);
            }}
          >
            <TextField
              label="League code"
              name="leagueCode"
              value={leagueCode}
              onChange={(e) => setLeagueCode(e.target.value)}
              fullWidth
              required
              size="small"
              autoComplete="off"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "1rem" } }}
            />
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="submit"
                disabled={!leagueCode.trim() || joinLeagueMutation.isPending}
                className="rounded-full bg-colors-nba-blue px-4 py-2.5 text-sm font-semibold text-white shadow-sm active:opacity-90 disabled:opacity-50"
              >
                {joinLeagueMutation.isPending ? "Joining…" : "Join league"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setLeagueCode("");
                  setShowJoinLeague(false);
                }}
                className="rounded-full border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 active:bg-black/5"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {showCreateNewLeague && (
        <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white/80 shadow-sm supports-[backdrop-filter]:bg-white/70 supports-[backdrop-filter]:backdrop-blur-xl">
          <div className="border-b border-gray-100 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-colors-nba-blue/10 text-colors-nba-blue">
                <PlusCircleIcon className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-semibold text-colors-nba-blue">
                  Create league
                </h3>
                <p className="text-xs text-gray-500">
                  Pick a name, then share the invite code
                </p>
              </div>
            </div>
          </div>
          <form
            className="space-y-3 px-4 py-4"
            onSubmit={(e) => {
              e.preventDefault();
              void handleSubmitNewLeague();
            }}
          >
            <TextField
              label="League name"
              name="leagueName"
              value={leagueName}
              onChange={(e) => setLeagueName(e.target.value)}
              fullWidth
              required
              size="small"
              autoComplete="off"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "1rem" } }}
            />
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="submit"
                disabled={!leagueName.trim()}
                className="rounded-full bg-colors-nba-blue px-4 py-2.5 text-sm font-semibold text-white shadow-sm active:opacity-90 disabled:opacity-50"
              >
                Create league
              </button>
              <button
                type="button"
                onClick={() => {
                  setLeagueName("");
                  setShowCreateNewLeague(false);
                }}
                className="rounded-full border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 active:bg-black/5"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <div className="space-y-3">
        <LeagueSection
          title="Private leagues"
          leagues={privateLeagues ?? []}
          onOpenOptions={handleOpenOptions}
          onOpenLeague={handleLeagueClick}
        />
        <LeagueSection
          title="Global leagues"
          leagues={overallLeague ? [overallLeague] : []}
          onOpenOptions={handleOpenOptions}
          onOpenLeague={handleLeagueClick}
        />
      </div>

      <SwipeableDrawer
        anchor="bottom"
        open={optionsOpen}
        onOpen={() => setOptionsOpen(true)}
        onClose={handleCloseOptions}
        disableSwipeToOpen
        PaperProps={{
          id: "league-options-sheet",
          role: "dialog",
          "aria-modal": true,
          "aria-labelledby": "league-options-title",
          sx: glassSheetPaperSx,
        }}
      >
        <div className="flex max-h-[80dvh] flex-col">
          <div className="shrink-0 px-4 pb-2 pt-2">
            <div aria-hidden className={glassSheetHandleClassName} />
            <h2
              id="league-options-title"
              className="text-base font-semibold text-colors-nba-blue"
            >
              {selectedLeague?.name || "League options"}
            </h2>
            <p className="mt-0.5 text-xs text-gray-500">Choose an action</p>
          </div>

          <div className="space-y-1 px-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {selectedLeague && (
              <button
                type="button"
                onClick={() => {
                  handleCloseOptions();
                  handleLeagueClick(selectedLeague);
                }}
                className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-gray-900 active:bg-black/5"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-colors-nba-blue/10 text-colors-nba-blue">
                  <TrophyIcon className="h-5 w-5" aria-hidden />
                </span>
                <span className="flex-1 text-sm font-medium">Standings</span>
                <ChevronRightIcon className="h-4 w-4 text-gray-300" aria-hidden />
              </button>
            )}

            {isAdminOfSelected && selectedLeague && (
              <button
                type="button"
                onClick={() => {
                  handleCloseOptions();
                  handleManageLeague(selectedLeague);
                }}
                className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-gray-900 active:bg-black/5"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                  <UserGroupIcon className="h-5 w-5" aria-hidden />
                </span>
                <span className="flex-1 text-sm font-medium">Manage league</span>
                <ChevronRightIcon className="h-4 w-4 text-gray-300" aria-hidden />
              </button>
            )}

            {canLeaveSelected && selectedLeague && (
              <button
                type="button"
                onClick={() => void handleLeaveLeague(selectedLeague)}
                className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-red-600 active:bg-red-50"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600">
                  <ArrowRightOnRectangleIcon className="h-5 w-5" aria-hidden />
                </span>
                <span className="flex-1 text-sm font-medium">Leave league</span>
              </button>
            )}
          </div>
        </div>
      </SwipeableDrawer>
    </div>
  );
};

const LeagueSection: React.FC<{
  title: string;
  leagues: League[];
  onOpenOptions: (league: League) => void;
  onOpenLeague: (league: League) => void;
}> = ({ title, leagues, onOpenOptions, onOpenLeague }) => {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white/80 shadow-sm supports-[backdrop-filter]:bg-white/70 supports-[backdrop-filter]:backdrop-blur-xl">
      <div className="border-b border-gray-100 px-4 py-3">
        <h2 className="text-base font-semibold text-colors-nba-blue">{title}</h2>
      </div>

      {leagues.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-gray-500">
          No leagues available.
        </p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {leagues.map((league) => (
            <li
              key={league.id ?? league.name}
              className="flex items-center gap-2 px-2 py-1.5"
            >
              <button
                type="button"
                onClick={() => onOpenLeague(league)}
                className="flex min-h-12 min-w-0 flex-1 items-center gap-3 rounded-xl px-2 py-2 text-left active:bg-black/5"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                  <TrophyIcon className="h-5 w-5" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-gray-900">
                    {league.name}
                  </span>
                  <span className="block text-[11px] font-medium uppercase tracking-wide text-gray-400">
                    {league.users?.length
                      ? `${league.users.length} member${league.users.length === 1 ? "" : "s"}`
                      : "Open standings"}
                  </span>
                </span>
                <ChevronRightIcon
                  className="h-4 w-4 shrink-0 text-gray-300"
                  aria-hidden
                />
              </button>
              <button
                type="button"
                aria-label={`Options for ${league.name}`}
                onClick={() => onOpenOptions(league)}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-colors-nba-blue active:bg-colors-nba-blue/10"
              >
                <Cog6ToothIcon className="h-5 w-5" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default LeaguesSelectionPage;
