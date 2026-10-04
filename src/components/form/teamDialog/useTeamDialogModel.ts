import { useEffect, useState, type ChangeEvent } from "react";
import axiosInstance from "../../../api/axiosInstance";
import { getErrorMessage } from "../../../api/getErrorMessage";
import {
  useError,
  useSuccessMessage,
} from "../../providers&context/NotificationProvider";
import { useMissingBets } from "../../providers&context/MissingBetsContext";
import { useTournament } from "../../providers&context/TournamentContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Series } from "../../../pages/HomePage";

export interface TeamDialogProps {
  isOpen: boolean;
  series: Series;
  closeDialog: () => void;
  userPoints: number;
  intialSelectedTab?: number;
  intialGamesTab?: number;
  fetchData?: () => void;
}

export interface GuessPercentage {
  teamWin: { 1: number; 2: number };
  playerMatchup: { [key: string]: { 1: number; 2: number } };
  spontaneousMacthups: { [key: string]: { 1: number; 2: number } };
}

const toBetGuessEntries = (
  value: unknown
): Array<{ betId: string; guess: number }> => {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is { betId: string; guess: number } => {
    if (typeof item !== "object" || item === null) return false;
    const typed = item as { betId?: unknown; guess?: unknown };
    return typeof typed.betId === "string" && typeof typed.guess === "number";
  });
};

const seriesStartAt = (series: Series) => {
  const start = new Date(series.dateOfStart);
  const [hours, minutes] = series.timeOfStart.split(":");
  start.setHours(parseInt(hours, 10));
  start.setMinutes(parseInt(minutes, 10));
  return start;
};

export const useTeamDialogModel = ({
  isOpen,
  series,
  closeDialog,
  userPoints,
  intialSelectedTab,
  intialGamesTab,
}: TeamDialogProps) => {
  const [selectedTeam, setSelectedTeam] = useState<number>(-1);
  const [selectedPlayerForBet, setSelectedPlayerForBet] = useState<{
    [key: string]: number;
  }>({});
  const [selectedPlayerForBetSpontaneous, setSelectedPlayerForBetSpontaneous] =
    useState<{
      [key: string]: number;
    }>({});
  const [selectedNumberOfGames, setSelectedNumberOfGames] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { showError } = useError();
  const { showSuccessMessage } = useSuccessMessage();
  const [hasGuesses, setHasGuesses] = useState<boolean>(false);
  const [guessPercentage, setGuessPercentage] = useState<GuessPercentage>({
    teamWin: { 1: 0, 2: 0 },
    playerMatchup: {},
    spontaneousMacthups: {},
  });
  const { triggerRefresh } = useMissingBets();
  const queryClient = useQueryClient();
  const { selectedTournamentId } = useTournament();

  const seriesStart = seriesStartAt(series);
  const isStartDatePassed = new Date() > seriesStart;
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [numOfSpontaneousBets, setNumOfSpontaneousBets] = useState<number>(0);

  const createDateExpiration = () => {
    const dateExpiration: { [key: string]: boolean } = {};
    const spontaneousBets = series.spontaneousBets;

    spontaneousBets?.forEach((bet) => {
      if (bet.startTime) {
        dateExpiration[bet.id] = new Date(bet.startTime) < new Date();
      } else {
        dateExpiration[bet.id] = false;
      }
    });

    return dateExpiration;
  };

  const spontaneousExpiration: { [key: string]: boolean } =
    createDateExpiration();

  const intialTabCheck = (expirations: { [key: string]: boolean }) => {
    for (const key of Object.keys(expirations)) {
      if (!expirations[key]) {
        const game = series?.spontaneousBets?.filter((bet) => bet.id === key);
        return game ? game[0].gameNumber : 1;
      }
    }
  };

  const [gamesTab, setGamesTab] = useState<number>(
    intialTabCheck(spontaneousExpiration) ?? 1
  );

  const handleTeamSelection = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedTeam(parseInt(event.target.value));
  };

  useEffect(() => {
    if (validationError) {
      const timer = setTimeout(() => {
        setValidationError(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [validationError]);

  const handlePlayerSelectionForSeries = (id: string, player: number) => {
    setSelectedPlayerForBet((prevState) => ({ ...prevState, [id]: player }));
  };

  const handlePlayerSelectionForSpontaneous = (id: string, player: number) => {
    setSelectedPlayerForBetSpontaneous((prevState) => ({
      ...prevState,
      [id]: player,
    }));
  };

  const handleNumberOfGamesSelection = (
    event: ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedNumberOfGames(parseInt(event.target.value));
  };

  const formValidation = () => {
    if (selectedTeam === -1 || selectedNumberOfGames === 0) {
      setValidationError(
        "For update bets, first fill games selection and winner team"
      );
      return false;
    }
    return true;
  };

  const spontaneousValidation = () => {
    if (Object.keys(selectedPlayerForBetSpontaneous).length === 0) {
      setValidationError("Select at least one spontaneous bet.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setValidationError(null);
    const isSeriesBetSubmit = selectedTab === 0;
    if (hasGuesses) {
      return;
    }
    if (isSeriesBetSubmit && !formValidation()) {
      return;
    }
    if (!isSeriesBetSubmit && !spontaneousValidation()) {
      return;
    }

    setIsSubmitting(true);
    setLoading(true);
    try {
      if (selectedTab === 0) {
        await axiosInstance.post(`/series/${series.id}/createGuesses`, {
          teamWinGuess: selectedTeam,
          bestOf7Guess: selectedNumberOfGames,
          playermatchupGuess: selectedPlayerForBet,
        });
      } else {
        await axiosInstance.post(`spontaneous-guess/update`, {
          spontaneousGuesses: selectedPlayerForBetSpontaneous,
          seriesId: series.id,
        });
      }

      await queryClient.invalidateQueries({
        queryKey: ["seriesFullData", series?.id, selectedTournamentId],
      });

      showSuccessMessage("Picks locked in.", "Good luck!");
      setSelectedTeam(-1);
      setSelectedPlayerForBet({});
      setSelectedPlayerForBetSpontaneous({});
      setSelectedNumberOfGames(0);
      setHasGuesses(false);
      closeDialog();
      triggerRefresh();
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Couldn't save your picks. Try again."
      );
      if (message) showError(message);
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const { data: fullData, isLoading: isLoadingGuesses } = useQuery({
    queryKey: ["seriesFullData", series?.id, selectedTournamentId],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `/series/${series.id}/full-data`
      );
      return response.data;
    },
    enabled: !!isOpen && !!series?.id && !!selectedTournamentId,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 3,
    gcTime: 1000 * 60 * 4,
    meta: { errorMessage: "Couldn't load picks for this series. Try again." },
  });

  useEffect(() => {
    const fetchAllGuessesAndStats = async () => {
      if (!isOpen || !series || !fullData) return;

      setLoading(true);
      try {
        const {
          guesses: userGuesses,
          spontaneousGuesses,
          percentages,
        } = fullData;

        const seriesMatchupGuesses = toBetGuessEntries(
          userGuesses["playerMatchupGuess"]
        );
        const spontaneousGuessesList = toBetGuessEntries(
          spontaneousGuesses ??
            userGuesses?.["spontanouesGuess"] ??
            userGuesses?.["spontaneousGuess"]
        );
        if (userGuesses["teamWinGuess"]) {
          setSelectedTeam(userGuesses["teamWinGuess"]["guess"]);
        } else {
          setSelectedTeam(-1);
        }
        if (seriesMatchupGuesses.length > 0) {
          seriesMatchupGuesses.forEach((element) => {
            setSelectedPlayerForBet((prevState) => ({
              ...prevState,
              [element.betId]: element.guess,
            }));
          });
        } else {
          setSelectedPlayerForBet({});
        }
        if (userGuesses["bestOf7Guess"]) {
          setSelectedNumberOfGames(userGuesses["bestOf7Guess"]["guess"]);
        } else {
          setSelectedNumberOfGames(0);
        }

        if (spontaneousGuessesList.length > 0) {
          spontaneousGuessesList.forEach((element) => {
            setSelectedPlayerForBetSpontaneous((prevState) => ({
              ...prevState,
              [element.betId]: element.guess,
            }));
          });
        }

        if (percentages) {
          setGuessPercentage(percentages);
        }

        let maxGame = 0;
        series.spontaneousBets?.forEach((bet) => {
          if (bet.gameNumber && bet.gameNumber > maxGame) {
            maxGame = bet.gameNumber ?? 0;
          }
        });
        setNumOfSpontaneousBets(maxGame);
      } catch (error) {
        const message = getErrorMessage(
          error,
          "Couldn't load picks for this series. Try again."
        );
        if (message) showError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllGuessesAndStats();
  }, [isOpen, series, fullData, showError]);

  useEffect(() => {
    if (isOpen) {
      setGamesTab(intialGamesTab ?? 1);
      setSelectedTab(intialSelectedTab ?? 0);
    }
  }, [isOpen, intialGamesTab, intialSelectedTab]);

  const handleRemoveGuessFromBet = (id: string, idx: number) => {
    if (selectedTab === 0) {
      if (selectedPlayerForBet[id] === idx) {
        const updatedState = { ...selectedPlayerForBet };
        delete updatedState[id];
        setSelectedPlayerForBet(updatedState);
      }
    } else {
      if (selectedPlayerForBetSpontaneous[id] === idx) {
        const updatedState = { ...selectedPlayerForBetSpontaneous };
        delete updatedState[id];
        setSelectedPlayerForBetSpontaneous(updatedState);
      }
    }
  };

  const currentSpontaneousBet =
    series.spontaneousBets?.filter((bet) => bet.gameNumber === gamesTab)[0] ??
    null;
  const validGamesTab =
    gamesTab > 0 && gamesTab <= numOfSpontaneousBets ? gamesTab - 1 : 0;

  return {
    isOpen,
    series,
    closeDialog,
    userPoints,
    selectedTeam,
    setSelectedTeam,
    selectedPlayerForBet,
    selectedPlayerForBetSpontaneous,
    selectedNumberOfGames,
    setSelectedNumberOfGames,
    loading,
    isLoadingGuesses,
    isSubmitting,
    guessPercentage,
    selectedTab,
    setSelectedTab,
    validationError,
    numOfSpontaneousBets,
    gamesTab,
    setGamesTab,
    seriesStart,
    isStartDatePassed,
    spontaneousExpiration,
    currentSpontaneousBet,
    validGamesTab,
    handleTeamSelection,
    handlePlayerSelectionForSeries,
    handlePlayerSelectionForSpontaneous,
    handleNumberOfGamesSelection,
    handleSubmit,
    handleRemoveGuessFromBet,
  };
};

export type TeamDialogModel = ReturnType<typeof useTeamDialogModel>;
