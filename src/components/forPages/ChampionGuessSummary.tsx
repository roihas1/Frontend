import React, { useEffect } from "react";
import { useError } from "../providers&context/ErrorProvider";
import axiosInstance from "../../api/axiosInstance";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useTournament } from "../providers&context/TournamentContext";

interface PriorGuesses {
  conferenceFinalGuesses: {
    id: string;
    team1: string;
    team2: string;
    conference: string;
  }[];
  championTeamGuesses: { id: string; team: string }[];
  mvpGuesses: { id: string; player: string }[];
}

interface PriorGuessesByStage {
  beforePlayoffs?: PriorGuesses;
  round1?: PriorGuesses;
  round2?: PriorGuesses;
}

interface ChampionGuessProps {
  stage: string;
}

const stagesToShow = ["Before Playoffs", "Round 1", "Round 2"];

function resolveTeamLabel(raw: unknown): string {
  if (raw == null) return "";
  if (typeof raw === "string") return raw.trim();
  if (typeof raw === "object" && raw !== null && "name" in raw) {
    const n = (raw as { name: unknown }).name;
    if (typeof n === "string" && n.trim()) return n.trim();
  }
  return "";
}

/** Flatten `{ guess: { team1, team2, ... } }` style payloads */
function mergeNestedGuess(guess: Record<string, unknown>): Record<string, unknown> {
  const inner = guess.guess;
  if (inner && typeof inner === "object" && inner !== null) {
    return { ...guess, ...(inner as Record<string, unknown>) };
  }
  return guess;
}

function conferenceFinalDisplayLine(raw: Record<string, unknown>): string {
  const guess = mergeNestedGuess(raw);
  const conference =
    typeof guess.conference === "string" ? guess.conference.trim() : "";
  const t1 =
    resolveTeamLabel(guess.team1) ||
    resolveTeamLabel(guess.team1Relation) ||
    (typeof guess.team1Name === "string" ? guess.team1Name.trim() : "");
  const t2 =
    resolveTeamLabel(guess.team2) ||
    resolveTeamLabel(guess.team2Relation) ||
    (typeof guess.team2Name === "string" ? guess.team2Name.trim() : "");
  const left = t1 || "—";
  const right = t2 || "—";
  return conference
    ? `${conference} - ${left} vs ${right}`
    : `${left} vs ${right}`;
}

function championDisplayLine(raw: Record<string, unknown>): string {
  const guess = mergeNestedGuess(raw);
  return (
    resolveTeamLabel(guess.team) ||
    resolveTeamLabel(guess.teamRelation) ||
    resolveTeamLabel(guess.championTeam) ||
    resolveTeamLabel(guess.champTeamGuess) ||
    (typeof guess.teamName === "string" ? guess.teamName.trim() : "") ||
    "—"
  );
}

function mvpDisplayLine(raw: Record<string, unknown>): string {
  const guess = mergeNestedGuess(raw);
  if (typeof guess.player === "string" && guess.player.trim()) {
    return guess.player.trim();
  }
  if (
    guess.player &&
    typeof guess.player === "object" &&
    guess.player !== null &&
    "name" in guess.player
  ) {
    const n = (guess.player as { name: unknown }).name;
    if (typeof n === "string" && n.trim()) return n.trim();
  }
  if (typeof guess.mvpGuess === "string" && guess.mvpGuess.trim()) {
    return guess.mvpGuess.trim();
  }
  const mvpObj = guess.mvpGuess;
  if (
    mvpObj &&
    typeof mvpObj === "object" &&
    mvpObj !== null &&
    "player" in mvpObj
  ) {
    const p = (mvpObj as { player: unknown }).player;
    if (typeof p === "string" && p.trim()) return p.trim();
  }
  return "—";
}

function guessRowKey(guess: Record<string, unknown>, index: number): string {
  const id = guess.id;
  if (typeof id === "string" && id) return id;
  return `guess-${index}`;
}

const ChampionGuessSummary: React.FC<ChampionGuessProps> = ({ stage }) => {
  const { showError } = useError();
  const { selectedTournamentId } = useTournament();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["priorGuesses", stage, selectedTournamentId],
    queryFn: async () => {
      if (stage === "Before playoffs") return null;
      const response = await axiosInstance.get(
        `playoffs-stage/getGuesses/${stage}`
      );
      return response.data;
    },
    enabled:
      !!stage &&
      stage !== "Before playoffs" &&
      !!selectedTournamentId,
    staleTime: 3600000, // 1 hour
    gcTime: 3600000, // 1 hour
    retry: 1,
  });

  useEffect(() => {
    if (isError && error) {
      showError(`Failed to fetch guesses: ${error}`);
    }
  }, [isError, error, showError]);

  const priorGuesses = stage === "Round 1" ? (data as PriorGuesses) : undefined;
  const priorGuessesRound2 =
    stage === "Round 2" || stage === "Finish"
      ? (data as PriorGuessesByStage)
      : undefined;

  const renderGuessSection = (
    title: string,
    guesses: unknown[] | undefined,
    formatLine: (g: Record<string, unknown>) => string
  ) => {
    const list = Array.isArray(guesses) ? guesses : [];
    if (list.length === 0) return null;
    return (
      <div className="mb-4">
        <h3 className="font-bold">{title}</h3>
        <ul>
          {list.map((raw, index) => {
            const guess =
              raw && typeof raw === "object"
                ? (raw as Record<string, unknown>)
                : {};
            return (
              <li className="font-semibold" key={guessRowKey(guess, index)}>
                {formatLine(guess)}
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  const renderAccordion = (
    stageName: string,
    guesses: PriorGuesses | undefined,
    stageKey: keyof PriorGuessesByStage
  ) => (
    <Accordion key={stageName} className="mb-4">
      <AccordionSummary
        expandIcon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m19.5 8.25-7.5 7.5-7.5-7.5"
            />
          </svg>
        }
        aria-controls={`panel-${stageName}-content`}
        id={`panel-${stageName}-header`}
      >
        <Typography component="span">{stageName}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {guesses && (
          <>
            {stageKey === "beforePlayoffs" &&
              renderGuessSection(
                "Conference Final Guesses",
                guesses.conferenceFinalGuesses,
                conferenceFinalDisplayLine
              )}
            {renderGuessSection(
              "Champion Team Guess",
              guesses.championTeamGuesses,
              championDisplayLine
            )}
            {renderGuessSection("MVP Guesses", guesses.mvpGuesses, mvpDisplayLine)}
          </>
        )}
      </AccordionDetails>
    </Accordion>
  );

  if (isLoading) return <div className="text-center">Loading guesses...</div>;

  return (
    <div>
      {stage === "Round 1" &&
        priorGuesses &&
        renderAccordion(stagesToShow[0], priorGuesses, "beforePlayoffs")}

      {stage === "Round 2" && priorGuessesRound2 && (
        <div className="mt-4">
          {renderAccordion(
            stagesToShow[0],
            priorGuessesRound2.beforePlayoffs,
            "beforePlayoffs"
          )}
          {renderAccordion(
            stagesToShow[1],
            priorGuessesRound2.round1,
            "round1"
          )}
        </div>
      )}

      {stage === "Finish" && priorGuessesRound2 && (
        <div className="mt-4">
          {renderAccordion(
            stagesToShow[0],
            priorGuessesRound2.beforePlayoffs,
            "beforePlayoffs"
          )}
          {renderAccordion(
            stagesToShow[1],
            priorGuessesRound2.round1,
            "round1"
          )}
          {renderAccordion(
            stagesToShow[2],
            priorGuessesRound2.round2,
            "round2"
          )}
        </div>
      )}
    </div>
  );
};

export default ChampionGuessSummary;
