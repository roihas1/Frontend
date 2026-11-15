import {
  Autocomplete,
  Checkbox,
  FormControl,
  Input,
  TextField,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ArrowLeftIcon,
  ClipboardDocumentIcon,
  ShareIcon,
  TrashIcon,
  UserMinusIcon,
} from "@heroicons/react/24/outline";
import { User } from "../types";
import axiosInstance from "../api/axiosInstance";
import { buildRemoveUsersRequest } from "../api/privateLeagueRequests";
import {
  useError,
  useSuccessMessage,
} from "../components/providers&context/NotificationProvider";
import { getErrorMessage } from "../api/getErrorMessage";
import { League } from "./LeagueSelectionPage";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTournament } from "../components/providers&context/TournamentContext";

const ManageLeague: React.FC = () => {
  const location = useLocation();
  const { showError } = useError();
  const navigate = useNavigate();
  const { showSuccessMessage } = useSuccessMessage();
  const tempLeague = location.state?.league as League | undefined;
  const [leagueName, setLeagueName] = useState<string>("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [league, setLeague] = useState<League>();
  const { selectedTournamentId } = useTournament();

  useEffect(() => {
    const settingLeague = () => {
      setLeague(tempLeague);
    };
    const fetchLeagueUsers = async () => {
      try {
        const response = await axiosInstance.get(
          `/private-league/${league?.id}/users`,
        );
        setUsers(response.data);
      } catch (error) {
        const message = getErrorMessage(
          error,
          "Couldn't load league members. Try again.",
        );
        if (message) showError(message);
      }
    };

    settingLeague();
    if (league) {
      fetchLeagueUsers();
    }
  }, [league, selectedTournamentId, showError, tempLeague]);

  const handleUpdateLeagueName = async () => {
    try {
      await axiosInstance.patch(
        `/private-league/${league?.id}/${leagueName}/updateName`,
      );
      if (league) league.name = leagueName;
      setLeagueName("");
      showSuccessMessage("League renamed.", `It's now ${leagueName}.`);
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Couldn't rename the league. Try again.",
      );
      if (message) showError(message);
    }
  };

  const handleDeleteLeague = async () => {
    try {
      if (!league?.id) return;
      deleteLeagueMutation.mutate(league.id);
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Couldn't delete the league. Try again.",
      );
      if (message) showError(message);
    }
  };
  const queryClient = useQueryClient();

  const deleteLeagueMutation = useMutation({
    mutationFn: async (leagueId: string) => {
      return axiosInstance.delete(`/private-league/${leagueId}`);
    },
    onSuccess: () => {
      showSuccessMessage("League deleted.");
      queryClient.invalidateQueries({
        queryKey: ["private-leagues", selectedTournamentId],
      });
      navigate("/leagues");
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(
        error,
        "Couldn't delete the league. Try again.",
      );
      if (message) showError(message);
    },
  });

  const handleRemoveUsers = async () => {
    try {
      await axiosInstance.patch(
        `/private-league/${league?.id}/removeUsers`,
        buildRemoveUsersRequest(
          selectedUsers.map((user) => user.id),
          selectedTournamentId,
        ),
      );

      setSelectedUsers([]);
      showSuccessMessage(
        "Players removed.",
        league?.name ? `They're out of ${league.name}.` : undefined,
      );
      if (league?.id) {
        const response = await axiosInstance.get(
          `/private-league/${league.id}/users`,
        );
        setUsers(response.data);
      }
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Couldn't remove those players. Try again.",
      );
      if (message) showError(message);
    }
  };

  const inviteShareText = league?.code
    ? `Join my Beyond the Bracket league${league.name ? ` "${league.name}"` : ""}!\n\nUse code: ${league.code}`
    : "";

  const handleCopyCode = async () => {
    if (!league?.code) {
      return;
    }
    try {
      await navigator.clipboard.writeText(league.code);
      showSuccessMessage("Code copied.", "Share it with your friends.");
    } catch {
      showError("Couldn't copy the code.", "Copy it manually.");
    }
  };

  const handleNativeShare = async () => {
    if (!league?.code || !inviteShareText) {
      return;
    }
    if (typeof navigator.share !== "function") {
      await handleCopyCode();
      return;
    }
    try {
      await navigator.share({
        title: league.name
          ? `Join ${league.name} on Beyond the Bracket`
          : "Join my Beyond the Bracket league",
        text: inviteShareText,
      });
    } catch (error) {
      // User dismissed the sheet — not an error.
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      await handleCopyCode();
    }
  };

  const handleShareWhatsApp = () => {
    if (!inviteShareText) {
      return;
    }
    const url = `https://wa.me/?text=${encodeURIComponent(inviteShareText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const canShareNative =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-1 py-2 sm:px-4 sm:py-4">
      <div className="flex items-center gap-2 px-1">
        <button
          type="button"
          onClick={() => navigate("/leagues")}
          className="inline-flex size-10 items-center justify-center rounded-full text-colors-nba-blue active:bg-colors-nba-blue/10"
          aria-label="Back to leagues"
        >
          <ArrowLeftIcon className="h-5 w-5" aria-hidden />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-semibold text-colors-nba-blue sm:text-2xl">
            {league?.name || "League"}
          </h1>
          <p className="text-xs text-gray-500 sm:text-sm">League admin</p>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white/80 shadow-sm supports-[backdrop-filter]:bg-white/70 supports-[backdrop-filter]:backdrop-blur-xl">
        <div className="border-b border-gray-100 px-4 py-3">
          <h2 className="text-base font-semibold text-colors-nba-blue">
            Invite code
          </h2>
          <p className="mt-0.5 text-xs text-gray-500">
            Share this code so friends can join your league.
          </p>
        </div>
        <div className="space-y-3 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                League code
              </p>
              <p className="truncate text-lg font-semibold tracking-wide text-gray-900">
                {league?.code || "—"}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {canShareNative && (
              <button
                type="button"
                onClick={() => void handleNativeShare()}
                disabled={!league?.code}
                className="inline-flex items-center gap-1.5 rounded-full bg-colors-nba-blue px-3.5 py-2 text-sm font-semibold text-white shadow-sm active:opacity-90 disabled:opacity-50"
              >
                <ShareIcon className="h-4 w-4" aria-hidden />
                Share
              </button>
            )}
            <button
              type="button"
              onClick={handleShareWhatsApp}
              disabled={!league?.code}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-3.5 py-2 text-sm font-semibold text-white shadow-sm active:opacity-90 disabled:opacity-50"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 fill-current"
                aria-hidden
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </button>
            <button
              type="button"
              onClick={() => void handleCopyCode()}
              disabled={!league?.code}
              className="inline-flex items-center gap-1.5 rounded-full bg-colors-nba-blue/10 px-3.5 py-2 text-sm font-semibold text-colors-nba-blue active:bg-colors-nba-blue/15 disabled:opacity-50"
            >
              <ClipboardDocumentIcon className="h-4 w-4" aria-hidden />
              Copy
            </button>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white/80 shadow-sm supports-[backdrop-filter]:bg-white/70 supports-[backdrop-filter]:backdrop-blur-xl">
        <div className="border-b border-gray-100 px-4 py-3">
          <h2 className="text-base font-semibold text-colors-nba-blue">
            Change league name
          </h2>
        </div>
        <div className="space-y-3 px-4 py-4">
          <FormControl fullWidth required>
            <Input
              type="text"
              name="leagueName"
              placeholder="Enter new league name"
              value={leagueName}
              onChange={(e) => setLeagueName(e.target.value)}
              className="w-full rounded-2xl border border-gray-300 bg-white p-3"
            />
          </FormControl>
          <button
            type="button"
            onClick={() => void handleUpdateLeagueName()}
            disabled={!leagueName.trim()}
            className="w-full rounded-full bg-colors-nba-blue px-4 py-2.5 text-sm font-semibold text-white shadow-sm active:opacity-90 disabled:opacity-50 sm:w-auto sm:min-w-[10rem]"
          >
            Save name
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white/80 shadow-sm supports-[backdrop-filter]:bg-white/70 supports-[backdrop-filter]:backdrop-blur-xl">
        <div className="border-b border-gray-100 px-4 py-3">
          <h2 className="text-base font-semibold text-colors-nba-blue">
            Remove players
          </h2>
          <p className="mt-0.5 text-xs text-gray-500">
            Search and select players to remove from this league.
          </p>
        </div>
        <div className="space-y-3 px-4 py-4">
          <Autocomplete
            multiple
            options={users.filter((user) => user.id !== league?.admin?.id)}
            disableCloseOnSelect
            getOptionLabel={(option) =>
              `${option.firstName} ${option.lastName}`
            }
            value={selectedUsers}
            onChange={(event, newValues) => {
              event.preventDefault();
              setSelectedUsers(newValues);
            }}
            renderOption={(props, option, { selected }) => (
              <li {...props} key={option.id}>
                <Checkbox checked={selected} />
                {`${option.firstName} ${option.lastName}`}
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                margin="normal"
                sx={{
                  mt: 0,
                  "& .MuiOutlinedInput-root": { borderRadius: "1rem" },
                }}
                label="Search users"
              />
            )}
          />
          <button
            type="button"
            onClick={() => void handleRemoveUsers()}
            disabled={selectedUsers.length === 0}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-colors-nba-blue/20 bg-white px-4 py-2.5 text-sm font-semibold text-colors-nba-blue shadow-sm active:bg-colors-nba-blue/5 disabled:opacity-50 sm:w-auto"
          >
            <UserMinusIcon className="h-4 w-4" aria-hidden />
            Remove selected
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-red-200/80 bg-white/80 shadow-sm supports-[backdrop-filter]:bg-white/70 supports-[backdrop-filter]:backdrop-blur-xl">
        <div className="border-b border-red-100 px-4 py-3">
          <h2 className="text-base font-semibold text-colors-nba-red">
            Delete league
          </h2>
          <p className="mt-0.5 text-xs text-gray-500">
            Players stay in the system and can join other leagues.
          </p>
        </div>
        <div className="px-4 py-4">
          <button
            type="button"
            onClick={() => void handleDeleteLeague()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-colors-nba-red px-4 py-2.5 text-sm font-semibold text-white shadow-sm active:opacity-90 sm:w-auto"
          >
            <TrashIcon className="h-4 w-4" aria-hidden />
            Delete league
          </button>
        </div>
      </section>
    </div>
  );
};

export default ManageLeague;
