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

const ChampionGuessSummary: React.FC<ChampionGuessProps> = ({ stage }) => {
  const { showError } = useError();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["priorGuesses", stage],
    queryFn: async () => {
      if (stage === "Before playoffs") return null;
      const response = await axiosInstance.get(
        `playoffs-stage/getGuesses/${stage}`
      );
      return response.data;
    },
    enabled: stage !== "Before playoffs",
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

  const renderGuessSection = (title: string, guesses: any[]) => (
    <div className="mb-4">
      <h3 className="font-bold">{title}</h3>
      <ul>
        {guesses.map((guess) => (
          <li className="font-semibold" key={guess.id}>
            {guess.conference
              ? `${guess.conference} - ${guess.team1} vs ${guess.team2}`
              : guess.team
              ? guess.team
              : guess.player}
          </li>
        ))}
      </ul>
    </div>
  );

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
                guesses.conferenceFinalGuesses
              )}
            {renderGuessSection(
              "Champion Team Guess",
              guesses.championTeamGuesses
            )}
            {renderGuessSection("MVP Guesses", guesses.mvpGuesses)}
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
