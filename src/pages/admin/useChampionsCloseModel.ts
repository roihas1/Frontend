import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getErrorMessage } from "../../api/getErrorMessage";
import { notify } from "../../components/common/notify";
import {
  useError,
  useSuccessMessage,
} from "../../components/providers&context/NotificationProvider";
import { useTournament } from "../../components/providers&context/TournamentContext";
import {
  adminQueryKeys,
  closeChampionsGuess,
  fetchAdminSeries,
} from "./adminApi";
import {
  conferenceFinalTeamIdsFromSeries,
  finalsTeamOptionsFromSeries,
} from "./adminNormalize";

export function useChampionsCloseModel() {
  const { showError } = useError();
  const { showSuccessMessage } = useSuccessMessage();
  const { selectedTournamentId } = useTournament();

  const [mvpPlayer, setMvpPlayer] = useState("");
  const [championTeam, setChampionTeam] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const seriesQuery = useQuery({
    queryKey: adminQueryKeys.series(selectedTournamentId),
    queryFn: fetchAdminSeries,
    enabled: Boolean(selectedTournamentId),
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const seriesList = useMemo(
    () => seriesQuery.data ?? [],
    [seriesQuery.data],
  );
  const finalsTeams = useMemo(
    () => finalsTeamOptionsFromSeries(seriesList),
    [seriesList],
  );

  const closeMutation = useMutation({
    mutationFn: async () => {
      if (!selectedTournamentId) {
        throw new Error("Select a tournament first.");
      }
      if (!mvpPlayer.trim()) {
        throw new Error("Enter the Finals MVP.");
      }
      if (!championTeam) {
        throw new Error("Select the champion team.");
      }

      const easternFinalsTeamIds = conferenceFinalTeamIdsFromSeries(
        seriesList,
        "East",
      );
      if (!easternFinalsTeamIds?.length) {
        throw new Error("East Conference Finals are missing team IDs.");
      }

      const westernFinalsTeamIds = conferenceFinalTeamIdsFromSeries(
        seriesList,
        "West",
      );
      if (!westernFinalsTeamIds?.length) {
        throw new Error("West Conference Finals are missing team IDs.");
      }

      const finalsTeamIds = finalsTeams.map((team) => team.id);
      if (finalsTeamIds.length < 2) {
        throw new Error("NBA Finals are missing team IDs.");
      }

      await closeChampionsGuess({
        tournamentId: selectedTournamentId,
        westernConferenceFinal: westernFinalsTeamIds,
        easternConferenceFinal: easternFinalsTeamIds,
        finals: finalsTeamIds,
        championTeamId: championTeam,
        mvp: mvpPlayer.trim(),
      });
    },
    onSuccess: () => {
      showSuccessMessage("Champions bets closed.");
      setChampionTeam("");
      setMvpPlayer("");
      setConfirmOpen(false);
    },
    onError: (error) => {
      const validationMessages = [
        "Select a tournament first.",
        "Enter the Finals MVP.",
        "Select the champion team.",
        "East Conference Finals are missing team IDs.",
        "West Conference Finals are missing team IDs.",
        "NBA Finals are missing team IDs.",
      ];
      if (error instanceof Error && validationMessages.includes(error.message)) {
        notify.warning(error.message);
        setConfirmOpen(false);
        return;
      }
      const message = getErrorMessage(
        error,
        "Couldn't close champions bets. Try again.",
      );
      if (message) showError(message);
    },
  });

  return {
    selectedTournamentId,
    mvpPlayer,
    championTeam,
    finalsTeams,
    isLoading: seriesQuery.isLoading,
    isMutating: closeMutation.isPending,
    confirmOpen,
    setMvpPlayer,
    setChampionTeam,
    setConfirmOpen,
    handleRequestClose: () => setConfirmOpen(true),
    handleConfirmClose: () => closeMutation.mutate(),
    handleCancelConfirm: () => {
      if (!closeMutation.isPending) setConfirmOpen(false);
    },
  };
}

export type ChampionsCloseModel = ReturnType<typeof useChampionsCloseModel>;
