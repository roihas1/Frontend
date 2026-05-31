import React, { useEffect, useMemo, useState } from "react";
import { useError } from "../providers&context/ErrorProvider";
import axiosInstance from "../../api/axiosInstance";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Skeleton,
  Tooltip,
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
  className?: string;
}

const stagesToShow = ["Before Playoffs", "Round 1", "Round 2"];

function ExpandIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={`size-5 shrink-0 text-gray-500 transition-transform duration-200 ${
        expanded ? "rotate-180" : ""
      }`}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m19.5 8.25-7.5 7.5-7.5-7.5"
      />
    </svg>
  );
}

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

function parseConferenceFinalGuess(raw: Record<string, unknown>): {
  conference: string;
  team1: string;
  team2: string;
} {
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
  return {
    conference,
    team1: t1 || "—",
    team2: t2 || "—",
  };
}

function conferenceFinalDisplayLine(raw: Record<string, unknown>): string {
  const { conference, team1, team2 } = parseConferenceFinalGuess(raw);
  return conference
    ? `${conference} - ${team1} vs ${team2}`
    : `${team1} vs ${team2}`;
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

function stagePanelId(stageName: string): string {
  return stageName.replace(/\s+/g, "-");
}

function hasStageGuesses(guesses: PriorGuesses | undefined): boolean {
  if (!guesses) return false;
  return (
    (guesses.conferenceFinalGuesses?.length ?? 0) > 0 ||
    (guesses.championTeamGuesses?.length ?? 0) > 0 ||
    (guesses.mvpGuesses?.length ?? 0) > 0
  );
}

function getDefaultExpandedStage(currentStage: string): string {
  if (currentStage === "Finish") return stagesToShow[2];
  if (currentStage === "Round 2") return stagesToShow[1];
  return stagesToShow[0];
}

function skeletonCountForStage(currentStage: string): number {
  if (currentStage === "Finish") return 3;
  if (currentStage === "Round 2") return 2;
  return 1;
}

function toGuessRecords(list: unknown[]): Record<string, unknown>[] {
  return list.map((raw) =>
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {}
  );
}

function newestFirst(list: unknown[]): Record<string, unknown>[] {
  return toGuessRecords(list).slice().reverse();
}

interface StageEntry {
  stageName: string;
  guesses: PriorGuesses;
  showConference: boolean;
}

function GuessSummarySkeleton({ count }: { count: number }) {
  return (
    <div className="w-full space-y-3" aria-busy="true" aria-label="Loading previous guesses">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton
          key={i}
          variant="rounded"
          height={48}
          className="w-full"
        />
      ))}
    </div>
  );
}

function EmptySummaryMessage() {
  return (
    <p className="text-sm text-gray-500 text-center py-4">
      No previous guesses yet.
    </p>
  );
}

type CategoryAccent = "conference" | "champion" | "mvp";

const CATEGORY_ACCENT: Record<
  CategoryAccent,
  {
    border: string;
    header: string;
    headerBg: string;
    currentBox: string;
    currentText: string;
    earlierText: string;
  }
> = {
  conference: {
    border: "border-l-colors-nba-blue",
    header: "text-colors-nba-blue",
    headerBg: "bg-blue-50/60",
    currentBox: "rounded-lg border border-blue-100 bg-blue-50/80 px-2.5 py-2",
    currentText: "text-sm text-gray-800",
    earlierText: "text-sm text-gray-500",
  },
  champion: {
    border: "border-l-indigo-500",
    header: "text-indigo-700",
    headerBg: "bg-indigo-50/50",
    currentBox: "rounded-lg border border-indigo-100 bg-indigo-50/80 px-2.5 py-2",
    currentText: "text-sm text-gray-800",
    earlierText: "text-sm text-gray-500",
  },
  mvp: {
    border: "border-l-amber-400",
    header: "text-amber-800",
    headerBg: "bg-amber-50/50",
    currentBox: "rounded-lg border border-amber-100 bg-amber-50/80 px-2.5 py-2",
    currentText: "text-sm text-gray-800",
    earlierText: "text-sm text-gray-500",
  },
};

function getCategoryRowStyles(accent: CategoryAccent) {
  const { currentBox, currentText, earlierText } = CATEGORY_ACCENT[accent];
  return { currentBox, currentText, earlierText };
}

function GuessCategoryCard({
  title,
  accent,
  children,
}: {
  title: string;
  accent: CategoryAccent;
  children: React.ReactNode;
}) {
  const styles = CATEGORY_ACCENT[accent];
  return (
    <section
      className={`rounded-xl border border-gray-200 border-l-4 bg-white overflow-hidden shadow-sm ${styles.border}`}
    >
      <h5
        className={`px-3 py-2 text-xs font-semibold uppercase tracking-wide border-b border-gray-100 ${styles.headerBg} ${styles.header}`}
      >
        {title}
      </h5>
      <div className="divide-y divide-gray-100">{children}</div>
    </section>
  );
}

function formatGuessDisplay(value: string): { text: string; isEmpty: boolean } {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "—") {
    return { text: "No pick recorded", isEmpty: true };
  }
  return { text: trimmed, isEmpty: false };
}

function getStagePreview(guesses: PriorGuesses): string {
  const parts: string[] = [];

  const championList = newestFirst(guesses.championTeamGuesses ?? []);
  if (championList.length > 0) {
    const { text, isEmpty } = formatGuessDisplay(
      championDisplayLine(championList[0])
    );
    if (!isEmpty) parts.push(text);
  }

  const mvpList = newestFirst(guesses.mvpGuesses ?? []);
  if (mvpList.length > 0) {
    const { text, isEmpty } = formatGuessDisplay(mvpDisplayLine(mvpList[0]));
    if (!isEmpty) parts.push(text);
  }

  return parts.join(" · ");
}

function GuessValueRow({
  value,
  isEarlier,
  accent,
}: {
  value: string;
  isEarlier?: boolean;
  accent: CategoryAccent;
}) {
  const { text, isEmpty } = formatGuessDisplay(value);
  const rowStyles = getCategoryRowStyles(accent);

  const valueText = (
    <p
      className={`break-words sm:truncate ${
        isEmpty
          ? "text-sm italic text-gray-400"
          : isEarlier
            ? rowStyles.earlierText
            : rowStyles.currentText
      }`}
    >
      {text}
    </p>
  );

  const row = (
    <div className={isEarlier ? "px-2.5 py-2 bg-gray-50/80" : "px-2.5 py-2"}>
      {isEarlier ? valueText : <div className={rowStyles.currentBox}>{valueText}</div>}
    </div>
  );

  if (isEmpty) return row;

  return (
    <>
      <div className="sm:hidden">{row}</div>
      <Tooltip title={text} arrow placement="top">
        <div className="hidden sm:block">{row}</div>
      </Tooltip>
    </>
  );
}

function ConferenceFinalRow({
  conference,
  team1,
  team2,
  isEarlier,
  accent = "conference",
}: {
  conference: string;
  team1: string;
  team2: string;
  isEarlier?: boolean;
  accent?: CategoryAccent;
}) {
  const badgeLabel = conference || "Matchup";
  const left = formatGuessDisplay(team1);
  const right = formatGuessDisplay(team2);
  const rowStyles = getCategoryRowStyles(accent);

  const teamPillClass = (isEmpty: boolean) =>
    `flex-1 min-w-0 rounded-lg border border-gray-200 bg-white px-2 py-2 text-center break-words text-sm ${
      isEmpty
        ? "italic text-gray-400"
        : isEarlier
          ? "text-gray-500"
          : "text-gray-800"
    }`;

  const inner = (
    <>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
          {badgeLabel}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <p className={teamPillClass(left.isEmpty)}>{left.text}</p>
        <span
          className="shrink-0 size-6 rounded-full bg-gray-100 text-[10px] font-semibold text-gray-500 flex items-center justify-center"
          aria-hidden
        >
          vs
        </span>
        <p className={teamPillClass(right.isEmpty)}>{right.text}</p>
      </div>
    </>
  );

  return (
    <div className={isEarlier ? "px-2.5 py-2 bg-gray-50/80" : "px-2.5 py-2"}>
      {isEarlier ? inner : <div className={rowStyles.currentBox}>{inner}</div>}
    </div>
  );
}

function StageAccordion({
  stageName,
  guesses,
  showConference,
  expanded,
  onChange,
}: {
  stageName: string;
  guesses: PriorGuesses;
  showConference: boolean;
  expanded: boolean;
  onChange: (event: React.SyntheticEvent, isExpanded: boolean) => void;
}) {
  const panelId = stagePanelId(stageName);
  const conferenceList = showConference
    ? newestFirst(guesses.conferenceFinalGuesses ?? [])
    : [];
  const championList = newestFirst(guesses.championTeamGuesses ?? []);
  const mvpList = newestFirst(guesses.mvpGuesses ?? []);
  const preview = getStagePreview(guesses);

  return (
    <Accordion
      expanded={expanded}
      onChange={onChange}
      disableGutters
      elevation={0}
      slots={{ heading: "div" }}
      className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden before:hidden"
      sx={{
        "&:before": { display: "none" },
        "&.Mui-expanded": { margin: 0 },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandIcon expanded={expanded} />}
        aria-controls={`panel-${panelId}-content`}
        id={`panel-${panelId}-header`}
        className="min-h-[48px] px-3 py-3 bg-white hover:bg-gray-50 transition-colors [&.Mui-expanded]:min-h-[48px]"
      >
        <div className="flex flex-col gap-0.5 w-full min-w-0 pr-2 text-left">
          <span className="text-sm font-semibold text-colors-nba-blue">
            {stageName}
          </span>
          {preview && (
            <span className="text-sm text-gray-600 line-clamp-2 sm:line-clamp-1 break-words">
              {preview}
            </span>
          )}
        </div>
      </AccordionSummary>
      <AccordionDetails className="px-3 pb-3 pt-2 bg-gray-50/40 space-y-2 border-t border-gray-100">
        {conferenceList.length > 0 && (
          <GuessCategoryCard title="Conference finals" accent="conference">
            {conferenceList.map((guess, index) => {
              const parsed = parseConferenceFinalGuess(guess);
              return (
                <div
                  key={guessRowKey(guess, index)}
                  aria-label={conferenceFinalDisplayLine(guess)}
                >
                  <ConferenceFinalRow
                    conference={parsed.conference}
                    team1={parsed.team1}
                    team2={parsed.team2}
                    isEarlier={index > 0}
                    accent="conference"
                  />
                </div>
              );
            })}
          </GuessCategoryCard>
        )}

        {championList.length > 0 && (
          <GuessCategoryCard title="Champion" accent="champion">
            {championList.map((guess, index) => (
              <GuessValueRow
                key={guessRowKey(guess, index)}
                value={championDisplayLine(guess)}
                isEarlier={index > 0}
                accent="champion"
              />
            ))}
          </GuessCategoryCard>
        )}

        {mvpList.length > 0 && (
          <GuessCategoryCard title="MVP" accent="mvp">
            {mvpList.map((guess, index) => (
              <GuessValueRow
                key={guessRowKey(guess, index)}
                value={mvpDisplayLine(guess)}
                isEarlier={index > 0}
                accent="mvp"
              />
            ))}
          </GuessCategoryCard>
        )}
      </AccordionDetails>
    </Accordion>
  );
}

const ChampionGuessSummary: React.FC<ChampionGuessProps> = ({
  stage,
  className = "",
}) => {
  const { showError } = useError();
  const { selectedTournamentId } = useTournament();
  const [expandedStage, setExpandedStage] = useState<string | false>(() =>
    getDefaultExpandedStage(stage)
  );

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

  const stageEntries = useMemo((): StageEntry[] => {
    const entries: StageEntry[] = [];

    if (stage === "Round 1" && priorGuesses && hasStageGuesses(priorGuesses)) {
      entries.push({
        stageName: stagesToShow[0],
        guesses: priorGuesses,
        showConference: true,
      });
    }

    if (stage === "Round 2" && priorGuessesRound2) {
      const buckets: Array<{
        stageName: string;
        guesses?: PriorGuesses;
        showConference: boolean;
      }> = [
        {
          stageName: stagesToShow[0],
          guesses: priorGuessesRound2.beforePlayoffs,
          showConference: true,
        },
        {
          stageName: stagesToShow[1],
          guesses: priorGuessesRound2.round1,
          showConference: false,
        },
      ];
      for (const bucket of buckets) {
        if (bucket.guesses && hasStageGuesses(bucket.guesses)) {
          entries.push({
            stageName: bucket.stageName,
            guesses: bucket.guesses,
            showConference: bucket.showConference,
          });
        }
      }
    }

    if (stage === "Finish" && priorGuessesRound2) {
      const buckets: Array<{
        stageName: string;
        guesses?: PriorGuesses;
        showConference: boolean;
      }> = [
        {
          stageName: stagesToShow[0],
          guesses: priorGuessesRound2.beforePlayoffs,
          showConference: true,
        },
        {
          stageName: stagesToShow[1],
          guesses: priorGuessesRound2.round1,
          showConference: false,
        },
        {
          stageName: stagesToShow[2],
          guesses: priorGuessesRound2.round2,
          showConference: false,
        },
      ];
      for (const bucket of buckets) {
        if (bucket.guesses && hasStageGuesses(bucket.guesses)) {
          entries.push({
            stageName: bucket.stageName,
            guesses: bucket.guesses,
            showConference: bucket.showConference,
          });
        }
      }
    }

    return entries;
  }, [stage, priorGuesses, priorGuessesRound2]);

  const handleAccordionChange =
    (stageName: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedStage(isExpanded ? stageName : false);
    };

  if (isLoading) {
    return (
      <GuessSummarySkeleton count={skeletonCountForStage(stage)} />
    );
  }

  if (stageEntries.length === 0) {
    return <EmptySummaryMessage />;
  }

  return (
    <div className={`w-full space-y-3 overflow-x-hidden ${className}`.trim()}>
      {stageEntries.map((entry) => (
        <StageAccordion
          key={entry.stageName}
          stageName={entry.stageName}
          guesses={entry.guesses}
          showConference={entry.showConference}
          expanded={expandedStage === entry.stageName}
          onChange={handleAccordionChange(entry.stageName)}
        />
      ))}
    </div>
  );
};

export default ChampionGuessSummary;
