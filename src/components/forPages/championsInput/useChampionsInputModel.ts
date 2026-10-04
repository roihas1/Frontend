import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../../api/axiosInstance";
import { getErrorMessage } from "../../../api/getErrorMessage";
import { notify } from "../../common/notify";
import {
  useError,
  useSuccessMessage,
} from "../../providers&context/NotificationProvider";
import { useTournament } from "../../providers&context/TournamentContext";
import { Series } from "../../../pages/HomePage";
import {
  nbaTeamsNicknames,
  nbaTeamsNicknamesReversed,
} from "./championsInputTeams";

export interface ChampionsInputProps {
  west: Series[];
  east: Series[];
  startDate: Date;
  stage: string;
  setShowInput: (arg0: string) => void;
}

interface UserGuessesResponse {
  conferenceFinalGuesses: {
    team1?: string;
    team2?: string;
    team1Relation?: { name: string } | null;
    team2Relation?: { name: string } | null;
    conference: string;
    stage?: {
      startDate?: string;
      timeOfStart?: string;
    };
  }[];
  championTeamGuesses: {
    team?: string;
    teamRelation?: { name: string } | null;
    stage?: {
      startDate?: string;
      timeOfStart?: string;
    };
  }[];
  mvpGuesses: {
    player: string;
    stage?: {
      startDate?: string;
      timeOfStart?: string;
    };
  }[];
}

export type ChampPickField =
  | "easternTeam1"
  | "easternTeam2"
  | "westernTeam1"
  | "westernTeam2"
  | "finalsTeam1"
  | "finalsTeam2"
  | "mvp"
  | "champion";

export type FieldErrors = Partial<Record<ChampPickField, string>>;

export const CHAMP_PICK_FIELDS_BEFORE_PLAYOFFS: ChampPickField[] = [
  "easternTeam1",
  "easternTeam2",
  "westernTeam1",
  "westernTeam2",
  "finalsTeam1",
  "finalsTeam2",
  "mvp",
  "champion",
];

export const CHAMP_PICK_FIELDS_LATER_ROUND: ChampPickField[] = [
  "mvp",
  "champion",
];

const MVP_OPTIONS = [
  "Aaron Gordon",
  "Alperen Sengun",
  "Amen Thompson",
  "Anthony Edwards",
  "Austin Reaves",
  "Bam Adebayo",
  "Brandon Ingram",
  "Brandon Miller",
  "Cade Cunningham",
  "Chet Holmgren",
  "Darius Garland",
  "Deni Avdija",
  "Derrick White",
  "Desmond Bane",
  "Devin Booker",
  "Devin Vassell",
  "Dillon Brooks",
  "Donovan Mitchell",
  "Evan Mobley",
  "Franz Wagner",
  "Jalen Brunson",
  "Jalen Duren",
  "Jalen Green",
  "Jalen Johnson",
  "Jalen Williams",
  "James Harden",
  "Jamal Murray",
  "Jayson Tatum",
  "Jaylen Brown",
  "Joel Embiid",
  "Karl-Anthony Towns",
  "Kawhi Leonard",
  "Kevin Durant",
  "LaMelo Ball",
  "LeBron James",
  "Luka Doncic",
  "Nickeil Alexander-Walker",
  "Nikola Jokic",
  "OG Anunoby",
  "Paolo Banchero",
  "Paul George",
  "RJ Barrett",
  "Scottie Barnes",
  "Shai Gilgeous-Alexander",
  "Stephen Curry",
  "Stephon Castle",
  "Tyrese Maxey",
  "Victor Wembanyama",
].sort((a, b) => a.localeCompare(b));

const getGuessTimestamp = (stageInfo?: {
  startDate?: string;
  timeOfStart?: string;
}): number => {
  if (!stageInfo?.startDate) {
    return 0;
  }
  const datePart = stageInfo.startDate;
  const timePart = stageInfo.timeOfStart ?? "00:00:00";
  const parsed = Date.parse(`${datePart}T${timePart}`);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const getConferenceTeamName = (
  guess: UserGuessesResponse["conferenceFinalGuesses"][number],
  side: "team1" | "team2"
): string | undefined => {
  if (side === "team1") {
    return guess.team1Relation?.name ?? guess.team1;
  }
  return guess.team2Relation?.name ?? guess.team2;
};

const uniqDefined = (items: (string | undefined)[]) =>
  [...new Set(items.filter((team): team is string => Boolean(team)))];

export const useChampionsInputModel = ({
  west,
  east,
  startDate,
  stage,
  setShowInput,
}: ChampionsInputProps) => {
  const [selectedEasternTeam1, setSelectedEasternTeam1] = useState<string>("");
  const [selectedEasternTeam2, setSelectedEasternTeam2] = useState<string>("");
  const [selectedWesternTeam1, setSelectedWesternTeam1] = useState<string>("");
  const [selectedWesternTeam2, setSelectedWesternTeam2] = useState<string>("");
  const [selectedFinalsTeam1, setSelectedFinalsTeam1] = useState<string>("");
  const [selectedFinalsTeam2, setSelectedFinalsTeam2] = useState<string>("");
  const [selectedMvp, setSelectedMvp] = useState<string>("");
  const [selectedChampion, setSelectedChampion] = useState<string>("");
  const [guessesFilled, setGuessesFilled] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [scrollTarget, setScrollTarget] = useState<ChampPickField | null>(null);
  const [scrollNonce, setScrollNonce] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { selectedTournamentId } = useTournament();

  const { showSuccessMessage } = useSuccessMessage();
  const { showError } = useError();

  const getFullTeamName = (team: string): string => {
    return nbaTeamsNicknames[team] ?? team;
  };

  const clearFieldError = (field: ChampPickField) => {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const getTeamsForRound = (round: "east" | "west" | "finals"): string[] => {
    switch (round) {
      case "east":
        return uniqDefined(east.flatMap((series) => [series.team1, series.team2]));
      case "west":
        return uniqDefined(west.flatMap((series) => [series.team1, series.team2]));
      case "finals":
        return uniqDefined([
          ...west.flatMap((series) => [series.team1, series.team2]),
          ...east.flatMap((series) => [series.team1, series.team2]),
        ]);
      default:
        return [];
    }
  };

  const hasEmptyRequiredFields = () => {
    return (
      !selectedEasternTeam1 ||
      !selectedEasternTeam2 ||
      !selectedWesternTeam1 ||
      !selectedWesternTeam2 ||
      !selectedFinalsTeam1 ||
      !selectedFinalsTeam2 ||
      !selectedMvp ||
      !selectedChampion
    );
  };

  useEffect(() => {
    if (validationError) {
      const timer = setTimeout(() => {
        setValidationError(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [validationError]);

  const handleEastFinalsTeamSelection = (team: string, numTeam: number) => {
    if (
      (team === selectedEasternTeam2 && numTeam === 1) ||
      (team === selectedEasternTeam1 && numTeam === 2)
    ) {
      setValidationError(`Can not Select the Same Team`);
    } else {
      if (numTeam === 1) {
        setSelectedEasternTeam1(team);
        clearFieldError("easternTeam1");
      } else {
        setSelectedEasternTeam2(team);
        clearFieldError("easternTeam2");
      }
    }
  };

  const handleWestFinalsTeamSelection = (team: string, numTeam: number) => {
    if (
      (team === selectedWesternTeam2 && numTeam === 1) ||
      (team === selectedWesternTeam1 && numTeam === 2)
    ) {
      setValidationError(`Can not Select the Same Team`);
    } else {
      if (numTeam === 1) {
        setSelectedWesternTeam1(team);
        clearFieldError("westernTeam1");
      } else {
        setSelectedWesternTeam2(team);
        clearFieldError("westernTeam2");
      }
    }
  };

  const handleFinalsTeam1Change = (team: string) => {
    setSelectedFinalsTeam1(team);
    clearFieldError("finalsTeam1");
  };

  const handleFinalsTeam2Change = (team: string) => {
    setSelectedFinalsTeam2(team);
    clearFieldError("finalsTeam2");
  };

  const handleMvpChange = (player: string) => {
    setSelectedMvp(player);
    clearFieldError("mvp");
  };

  const handleChampionChange = (team: string) => {
    setSelectedChampion(team);
    clearFieldError("champion");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    if (stage === "Before playoffs" && hasEmptyRequiredFields()) {
      const errors: FieldErrors = {};
      if (!selectedEasternTeam1) errors.easternTeam1 = "Select a team";
      if (!selectedEasternTeam2) errors.easternTeam2 = "Select a team";
      if (!selectedWesternTeam1) errors.westernTeam1 = "Select a team";
      if (!selectedWesternTeam2) errors.westernTeam2 = "Select a team";
      if (!selectedFinalsTeam1) errors.finalsTeam1 = "Select a team";
      if (!selectedFinalsTeam2) errors.finalsTeam2 = "Select a team";
      if (!selectedMvp) errors.mvp = "Select an MVP";
      if (!selectedChampion) errors.champion = "Select a champion";
      setFieldErrors(errors);
      const first =
        CHAMP_PICK_FIELDS_BEFORE_PLAYOFFS.find((field) => errors[field]) ?? null;
      setScrollTarget(first);
      setScrollNonce((current) => current + 1);
      setValidationError("Please fill in all the required fields.");
      return;
    }
    setFieldErrors({});
    if (!selectedTournamentId) {
      notify.warning("Select a tournament first.");
      return;
    }
    setIsSubmitting(true);
    try {
      if (stage === "Before playoffs") {
        await axiosInstance.post("/champions-guess/update/beforePlayoffs", {
          tournamentId: selectedTournamentId,
          champTeamGuess: {
            team: getFullTeamName(selectedChampion),
          },
          conferenceFinalGuess: [
            {
              team1: nbaTeamsNicknames[selectedEasternTeam1],
              team2: nbaTeamsNicknames[selectedEasternTeam2],
              conference: "East",
            },
            {
              team1: nbaTeamsNicknames[selectedWesternTeam1],
              team2: nbaTeamsNicknames[selectedWesternTeam2],
              conference: "West",
            },
            {
              team1: nbaTeamsNicknames[selectedFinalsTeam1],
              team2: nbaTeamsNicknames[selectedFinalsTeam2],
              conference: "Finals",
            },
          ],
          mvpGuess: {
            player: selectedMvp,
          },
          stage: stage,
        });
      } else if (stage === "Round 1" || stage === "Round 2") {
        await axiosInstance.post("/champions-guess/update/afterFirstRound", {
          tournamentId: selectedTournamentId,
          champTeamGuess: {
            team: getFullTeamName(selectedChampion),
          },
          mvpGuess: {
            player: selectedMvp,
          },
          stage,
        });
      }
      await queryClient.invalidateQueries({
        queryKey: ["userGuesses", stage, selectedTournamentId],
      });
      showSuccessMessage("Picks locked in.", "Good luck!");
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Couldn't save your picks. Try again.",
      );
      if (message) showError(message);
    } finally {
      setIsSubmitting(false);
      setShowInput("Submit");
    }
  };

  const {
    data: guesses,
    isSuccess,
    isLoading,
  } = useQuery<UserGuessesResponse>({
    queryKey: ["userGuesses", stage, selectedTournamentId],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/playoffs-stage/userGuesses/${stage}`
      );
      return res.data;
    },
    enabled: !!stage && stage !== "Finish" && !!selectedTournamentId,
    retry: 1,
    staleTime: 3 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    meta: { errorMessage: "Couldn't load your champion picks. Try again." },
  });

  useEffect(() => {
    if (!isSuccess || !guesses) return;

    let hasGuesses = false;

    if (
      guesses.conferenceFinalGuesses.length > 0 &&
      stage === "Before playoffs"
    ) {
      const conferencePriority = guesses.conferenceFinalGuesses
        .slice()
        .sort(
          (a, b) => getGuessTimestamp(b.stage) - getGuessTimestamp(a.stage)
        );

      for (const guess of conferencePriority) {
        const team1Name = getConferenceTeamName(guess, "team1");
        const team2Name = getConferenceTeamName(guess, "team2");

        if (!team1Name || !team2Name) {
          continue;
        }

        const mappedTeam1 = nbaTeamsNicknamesReversed[team1Name] ?? team1Name;
        const mappedTeam2 = nbaTeamsNicknamesReversed[team2Name] ?? team2Name;

        switch (guess.conference) {
          case "East":
            if (!selectedEasternTeam1 && !selectedEasternTeam2) {
              setSelectedEasternTeam1(mappedTeam1);
              setSelectedEasternTeam2(mappedTeam2);
              hasGuesses = true;
            }
            break;
          case "West":
            if (!selectedWesternTeam1 && !selectedWesternTeam2) {
              setSelectedWesternTeam1(mappedTeam1);
              setSelectedWesternTeam2(mappedTeam2);
              hasGuesses = true;
            }
            break;
          case "Finals":
            if (!selectedFinalsTeam1 && !selectedFinalsTeam2) {
              setSelectedFinalsTeam1(mappedTeam1);
              setSelectedFinalsTeam2(mappedTeam2);
              hasGuesses = true;
            }
            break;
        }
      }
    }

    if (guesses.championTeamGuesses.length > 0) {
      const latestChampion = guesses.championTeamGuesses
        .slice()
        .sort(
          (a, b) => getGuessTimestamp(b.stage) - getGuessTimestamp(a.stage)
        )
        .find((guess) => (guess.teamRelation?.name ?? guess.team)?.trim());

      const championTeamName =
        latestChampion?.teamRelation?.name ?? latestChampion?.team ?? "";

      if (championTeamName) {
        setSelectedChampion(
          nbaTeamsNicknamesReversed[championTeamName] ?? championTeamName
        );
      }
      hasGuesses = true;
    }

    if (guesses.mvpGuesses.length > 0) {
      const latestMvp = guesses.mvpGuesses
        .slice()
        .sort(
          (a, b) => getGuessTimestamp(b.stage) - getGuessTimestamp(a.stage)
        )
        .find((guess) => guess.player?.trim());

      if (latestMvp?.player) {
        setSelectedMvp(latestMvp.player);
      }
      hasGuesses = true;
    }

    if (hasGuesses) {
      setGuessesFilled(true);
    }
  }, [
    isSuccess,
    guesses,
    stage,
    selectedEasternTeam1,
    selectedEasternTeam2,
    selectedWesternTeam1,
    selectedWesternTeam2,
    selectedFinalsTeam1,
    selectedFinalsTeam2,
  ]);

  const easternTeams = getTeamsForRound("east");
  const westernTeams = getTeamsForRound("west");
  const finalsTeams = getTeamsForRound("finals");

  const teamLogos = useMemo(() => {
    const logos: Record<string, string> = {};
    for (const series of [...west, ...east]) {
      if (series.team1 && series.logo1) logos[series.team1] = series.logo1;
      if (series.team2 && series.logo2) logos[series.team2] = series.logo2;
    }
    return logos;
  }, [west, east]);

  const activeFields =
    stage === "Before playoffs"
      ? CHAMP_PICK_FIELDS_BEFORE_PLAYOFFS
      : stage === "Round 1" || stage === "Round 2"
        ? CHAMP_PICK_FIELDS_LATER_ROUND
        : [];

  const pickValues: Record<ChampPickField, string> = {
    easternTeam1: selectedEasternTeam1,
    easternTeam2: selectedEasternTeam2,
    westernTeam1: selectedWesternTeam1,
    westernTeam2: selectedWesternTeam2,
    finalsTeam1: selectedFinalsTeam1,
    finalsTeam2: selectedFinalsTeam2,
    mvp: selectedMvp,
    champion: selectedChampion,
  };

  const pickedCount = activeFields.filter((field) => pickValues[field]).length;
  const totalPicks = activeFields.length;

  const lastDate = new Date(startDate).toLocaleString("he-IL", {
    timeZone: "Asia/Jerusalem",
  });

  const stageLabel =
    stage === "Round 1" || stage === "Round 2" ? `After ${stage}` : stage;

  return {
    stage,
    setShowInput,
    selectedEasternTeam1,
    selectedEasternTeam2,
    selectedWesternTeam1,
    selectedWesternTeam2,
    selectedFinalsTeam1,
    selectedFinalsTeam2,
    selectedMvp,
    selectedChampion,
    guessesFilled,
    validationError,
    fieldErrors,
    scrollTarget,
    scrollNonce,
    isSubmitting,
    isLoading,
    easternTeams,
    westernTeams,
    finalsTeams,
    mvpOptions: MVP_OPTIONS,
    teamLogos,
    pickedCount,
    totalPicks,
    lastDate,
    stageLabel,
    handleEastFinalsTeamSelection,
    handleWestFinalsTeamSelection,
    handleFinalsTeam1Change,
    handleFinalsTeam2Change,
    handleMvpChange,
    handleChampionChange,
    handleSubmit,
  };
};

export type ChampionsInputModel = ReturnType<typeof useChampionsInputModel>;
