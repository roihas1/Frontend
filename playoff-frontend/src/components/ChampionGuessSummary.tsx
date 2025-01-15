import React, { useEffect, useState } from "react";
import { useError } from "./ErrorProvider";
import { useSuccessMessage } from "./successMassageProvider";
import axiosInstance from "../api/axiosInstance";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from "@mui/material";

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

const ChampionGuessSummary: React.FC<ChampionGuessProps> = ({ stage }) => {
  const { showError } = useError();
  const { showSuccessMessage } = useSuccessMessage();
  const [priorGuesses, setPriorGuesses] = useState<PriorGuesses>();
  const [priorGuessesRound2, setPriorGuessesRound2] =
    useState<PriorGuessesByStage>();
  const [stagesToShow, setStagesToShow] = useState<string[]>([]);

  const fetchPriorStageGuesses = async () => {
    try {
      const response = await axiosInstance.get(
        `playoffs-stage/getGuesses/${stage}`
      );
      if (stage === "Round 2" || stage === "Finish") {
        setPriorGuessesRound2(response.data);
      } else {
        setPriorGuesses(response.data);
      }
    } catch (error) {
      showError(`Failed to fetch guesses ${error}`);
    }
  };

  useEffect(() => {
    fetchPriorStageGuesses();
    setStagesToShow(["Before Playoffs", "Round 1", "Round 2"]);
  }, []);

  const renderGuessSection = (title: string, guesses: any[]) => (
    <div className="mb-4">
      <h3 className="font-bold">{title}</h3>
      <ul>
        {guesses.map((guess) => (
          <li className="font-semibold" key={guess.id}>
            {guess.conference ? (
              `${guess.conference} - ${guess.team1} vs ${guess.team2}`
            ) : guess.team ? (
              guess.team
            ) : (
              guess.player
            )}
          </li>
        ))}
      </ul>
    </div>
  );

  const renderAccordion = (
    stageName: string,
    guesses: PriorGuesses | undefined,
    stageKey: keyof PriorGuessesByStage
  ) => {
    return (
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
          <div>
            {guesses && (
              <>
                { stageKey === 'beforePlayoffs' &&   renderGuessSection("Conference Final Guesses", guesses.conferenceFinalGuesses)}
                {renderGuessSection("Champion Team Guess", guesses.championTeamGuesses)}
                {renderGuessSection("MVP Guesses", guesses.mvpGuesses)}
              </>
            )}
          </div>
        </AccordionDetails>
      </Accordion>
    );
  };

  return (
    <div>
      {stage === "Round 1" && priorGuesses && renderAccordion(stagesToShow[0], priorGuesses, "beforePlayoffs")}

      {stage === "Round 2" && priorGuessesRound2 && (
        <div className="mt-4">
          {renderAccordion(stagesToShow[0], priorGuessesRound2.beforePlayoffs, "beforePlayoffs")}
          {renderAccordion(stagesToShow[1], priorGuessesRound2.round1, "round1")}
        </div>
      )}

      {stage === "Finish" && priorGuessesRound2 && (
        <div className="mt-4">
          {renderAccordion(stagesToShow[0], priorGuessesRound2.beforePlayoffs, "beforePlayoffs")}
          {renderAccordion(stagesToShow[1], priorGuessesRound2.round1, "round1")}
          {renderAccordion(stagesToShow[2], priorGuessesRound2.round2, "round2")}
        </div>
      )}
    </div>
  );
};

export default ChampionGuessSummary;
