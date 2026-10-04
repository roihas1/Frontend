import React, { useEffect, useRef, useState } from "react";
import { Dialog } from "@headlessui/react";
import { Skeleton, Tab, Tabs } from "@mui/material";
import SubmitButton from "../../common/SubmitButton";
import { PlayerMatchupBet, SpontaneousBet } from "../../../types";
import MobileBetCard from "./MobileBetCard";
import MobileGuessSplit from "./MobileGuessSplit";
import { TeamDialogModel } from "./useTeamDialogModel";

const formatJerusalem = (value: Date | string) =>
  new Date(value).toLocaleString("he-IL", {
    timeZone: "Asia/Jerusalem",
    weekday: "short",
    day: "numeric",
    month: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const LockedChip: React.FC = () => (
  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">
    Locked
  </span>
);

const CheckIcon: React.FC = () => (
  <svg
    viewBox="0 0 20 20"
    className="h-4 w-4 shrink-0 text-colors-nba-blue"
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.2 7.2a1 1 0 0 1-1.4 0L3.3 9.1a1 1 0 1 1 1.4-1.4l4.1 4.1 6.5-6.5a1 1 0 0 1 1.4 0Z"
      clipRule="evenodd"
    />
  </svg>
);

const LockIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 20 20"
    className={className}
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M10 1.5a4 4 0 0 0-4 4V8H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-1V5.5a4 4 0 0 0-4-4Zm2.5 6.5V5.5a2.5 2.5 0 1 0-5 0V8h5Z"
      clipRule="evenodd"
    />
  </svg>
);

const CloseIcon: React.FC = () => (
  <svg
    className="h-4 w-4"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 14 14"
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
    />
  </svg>
);

const MobileDialogSkeleton: React.FC<{
  scrollRef: React.RefObject<HTMLDivElement>;
}> = ({ scrollRef }) => (
  <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
      <div className="flex flex-col items-center gap-2">
        <Skeleton variant="circular" width={56} height={56} />
        <Skeleton variant="text" width={72} />
      </div>
      <Skeleton variant="text" width={24} />
      <div className="flex flex-col items-center gap-2">
        <Skeleton variant="circular" width={56} height={56} />
        <Skeleton variant="text" width={72} />
      </div>
    </div>
    <Skeleton variant="rounded" height={40} />
    <div className="grid grid-cols-2 gap-2">
      <Skeleton variant="rounded" height={96} />
      <Skeleton variant="rounded" height={96} />
    </div>
    <div className="grid grid-cols-4 gap-2">
      {[0, 1, 2, 3].map((item) => (
        <Skeleton key={item} variant="rounded" height={44} />
      ))}
    </div>
    <Skeleton variant="rounded" height={108} />
    <Skeleton variant="rounded" height={108} />
  </div>
);

const DISMISS_DISTANCE = 110;
const DISMISS_FLICK_DISTANCE = 48;
const DISMISS_FLICK_VELOCITY = 0.55;

const useSwipeToClose = (isOpen: boolean, onClose: () => void) => {
  const panelRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      if (wasOpenRef.current) {
        setOffset(0);
        setIsDragging(false);
      }
      wasOpenRef.current = false;
      return;
    }
    wasOpenRef.current = true;

    const panel = panelRef.current;
    if (!panel) return;

    let startY = 0;
    let startX = 0;
    let startTime = 0;
    let tracking = false;
    let dragging = false;
    let fromHeader = false;
    let closing = false;
    let frame = 0;
    let pendingOffset = 0;
    let closeTimer = 0;

    const paintOffset = (next: number) => {
      pendingOffset = next;
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        setOffset(pendingOffset);
      });
    };

    const onStart = (event: TouchEvent) => {
      if (closing || event.touches.length !== 1) return;
      const touch = event.touches[0];
      fromHeader = !!headerRef.current?.contains(event.target as Node);
      tracking = true;
      dragging = false;
      startY = touch.clientY;
      startX = touch.clientX;
      startTime = performance.now();
    };

    const onMove = (event: TouchEvent) => {
      if (!tracking || closing || event.touches.length !== 1) return;
      const touch = event.touches[0];
      const dy = touch.clientY - startY;
      const dx = touch.clientX - startX;

      if (!dragging) {
        if (Math.abs(dy) < 8 && Math.abs(dx) < 8) return;
        const pullingDown = dy > 0 && Math.abs(dy) > Math.abs(dx);
        const atTop = (scrollRef.current?.scrollTop ?? 0) <= 0;
        if (!pullingDown || (!fromHeader && !atTop)) {
          tracking = false;
          return;
        }
        dragging = true;
        setIsDragging(true);
      }

      event.preventDefault();
      paintOffset(Math.max(0, dy));
    };

    const finish = (clientY: number) => {
      if (!tracking || closing) return;
      const wasDragging = dragging;
      tracking = false;
      dragging = false;
      if (frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
      if (!wasDragging) return;

      const dy = Math.max(0, clientY - startY);
      const elapsed = Math.max(performance.now() - startTime, 1);
      const velocity = dy / elapsed;
      const shouldClose =
        dy > DISMISS_DISTANCE ||
        (dy > DISMISS_FLICK_DISTANCE && velocity > DISMISS_FLICK_VELOCITY);

      setIsDragging(false);
      if (!shouldClose) {
        setOffset(0);
        return;
      }

      closing = true;
      setOffset(panel.getBoundingClientRect().height);
      closeTimer = window.setTimeout(() => onCloseRef.current(), 200);
    };

    const onEnd = (event: TouchEvent) => {
      const touch = event.changedTouches[0];
      finish(touch ? touch.clientY : startY);
    };

    panel.addEventListener("touchstart", onStart, { passive: true });
    panel.addEventListener("touchmove", onMove, { passive: false });
    panel.addEventListener("touchend", onEnd);
    panel.addEventListener("touchcancel", onEnd);

    return () => {
      window.clearTimeout(closeTimer);
      if (frame) window.cancelAnimationFrame(frame);
      panel.removeEventListener("touchstart", onStart);
      panel.removeEventListener("touchmove", onMove);
      panel.removeEventListener("touchend", onEnd);
      panel.removeEventListener("touchcancel", onEnd);
    };
  }, [isOpen]);

  return { panelRef, scrollRef, headerRef, offset, isDragging };
};

const countPicked = (
  bets: Array<PlayerMatchupBet | SpontaneousBet>,
  selected: { [key: string]: number }
) =>
  bets.filter((bet) => selected[bet.id] === 1 || selected[bet.id] === 2).length;

const TeamDialogMobileView: React.FC<TeamDialogModel> = ({
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
  handlePlayerSelectionForSeries,
  handlePlayerSelectionForSpontaneous,
  handleSubmit,
  handleRemoveGuessFromBet,
}) => {
  const { panelRef, scrollRef, headerRef, offset, isDragging } =
    useSwipeToClose(isOpen, closeDialog);
  const showSkeleton = isLoadingGuesses && !isSubmitting;
  const seriesInputsLocked = isStartDatePassed || isSubmitting;
  const currentGameLocked =
    spontaneousExpiration[currentSpontaneousBet?.id ?? ""] ?? true;
  const canSubmit =
    !isStartDatePassed ||
    (selectedTab === 1 &&
      !spontaneousExpiration[currentSpontaneousBet?.id ?? ""]);
  const showFooter = canSubmit && !showSkeleton;

  const gameChipRefs = useRef<Record<number, HTMLButtonElement | null>>({});

  useEffect(() => {
    if (selectedTab !== 1) return;
    gameChipRefs.current[gamesTab]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [gamesTab, selectedTab]);

  const isGameLocked = (gameNumber: number) => {
    const bet = series.spontaneousBets?.find(
      (item) => item.gameNumber === gameNumber
    );
    if (!bet) return true;
    return spontaneousExpiration[bet.id] ?? false;
  };

  const pickSummary = (() => {
    if (selectedTab === 0) {
      const parts: string[] = [];
      const winner =
        selectedTeam === 1
          ? series.team1
          : selectedTeam === 2
            ? series.team2
            : undefined;
      if (winner && selectedNumberOfGames > 0) {
        parts.push(`${winner} in ${selectedNumberOfGames}`);
      } else if (winner) {
        parts.push(winner);
      } else if (selectedNumberOfGames > 0) {
        parts.push(`${selectedNumberOfGames} games`);
      }
      const matchups = series.playerMatchupBets ?? [];
      const picked = countPicked(matchups, selectedPlayerForBet);
      if (picked > 0) {
        parts.push(`${picked}/${matchups.length} player picks`);
      }
      return parts.join(" · ");
    }

    const gameBets =
      series.spontaneousBets?.filter((bet) => bet.gameNumber === gamesTab) ??
      [];
    const picked = countPicked(gameBets, selectedPlayerForBetSpontaneous);
    if (picked === 0) return "";
    return `${picked}/${gameBets.length} picks for Game ${gamesTab}`;
  })();

  const teams = [
    {
      id: 1,
      name: series.team1 ?? "Team 1",
      seed: series.seed1,
      logo: series.logo1,
      isLeading:
        isStartDatePassed &&
        !!series.bestOf7BetId?.seriesScore &&
        series.bestOf7BetId.seriesScore[0] >
          series.bestOf7BetId.seriesScore[1],
    },
    {
      id: 2,
      name: series.team2 ?? "Team 2",
      seed: series.seed2,
      logo: series.logo2,
      isLeading:
        isStartDatePassed &&
        !!series.bestOf7BetId?.seriesScore &&
        series.bestOf7BetId.seriesScore[0] <
          series.bestOf7BetId.seriesScore[1],
    },
  ];

  const gameNumbers = Array.from(
    { length: numOfSpontaneousBets },
    (_, index) => index + 1
  );
  const spontaneousBetsForGame =
    series.spontaneousBets?.filter((bet) => bet.gameNumber === gamesTab) ?? [];
  const gameStart = spontaneousBetsForGame.find((bet) => bet.startTime)?.startTime;

  return (
    <Dialog open={isOpen} onClose={closeDialog} className="relative z-30">
      <div
        className="fixed inset-0 bg-black/50"
        style={
          offset > 0
            ? { opacity: Math.max(0, 1 - offset / 280) }
            : undefined
        }
        aria-hidden="true"
      />

      <div className="fixed inset-0 flex items-end">
        <Dialog.Panel
          ref={panelRef}
          aria-busy={showSkeleton || isSubmitting}
          className="flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-xl"
          style={{
            transform: offset > 0 ? `translateY(${offset}px)` : undefined,
            transition: isDragging ? "none" : "transform 200ms ease-out",
          }}
        >
          <div
            ref={headerRef}
            className="shrink-0 touch-none border-b border-gray-200 px-4 pb-3 pt-2"
          >
            <div
              className="mx-auto mb-2 h-1 w-10 rounded-full bg-gray-300"
              aria-hidden="true"
            />
            <div className="flex items-center justify-between">
              <Dialog.Title as="h3" className="text-lg font-bold text-gray-900">
                Series bets
              </Dialog.Title>
              <button
                type="button"
                onClick={closeDialog}
                aria-label="Close"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full text-gray-500 active:bg-gray-100"
              >
                <CloseIcon />
              </button>
            </div>
          </div>

          {showSkeleton ? (
            <MobileDialogSkeleton scrollRef={scrollRef} />
          ) : (
            <div
              ref={scrollRef}
              className={`flex-1 space-y-6 overflow-y-auto overscroll-contain px-4 py-4 ${
                showFooter
                  ? ""
                  : "pb-[max(1rem,env(safe-area-inset-bottom))]"
              }`}
            >
              <div>
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                  {teams.map((team, index) => (
                    <React.Fragment key={team.id}>
                      {index === 1 && (
                        <span className="text-xs font-bold tracking-wide text-gray-400">
                          VS
                        </span>
                      )}
                      <div className="flex min-w-0 flex-col items-center">
                        {team.logo && (
                          <img
                            src={team.logo}
                            alt=""
                            className="h-14 w-14 object-contain"
                          />
                        )}
                        <span className="mt-1 max-w-full truncate text-sm font-semibold text-gray-900">
                          {team.name}
                        </span>
                        <span className="text-xs text-gray-500">#{team.seed}</span>
                      </div>
                    </React.Fragment>
                  ))}
                </div>

                <div className="mt-3 rounded-xl bg-colors-nba-blue/10 px-3 py-2 text-center">
                  {isStartDatePassed ? (
                    <>
                      <p className="text-sm font-semibold text-gray-800">
                        Started ·{" "}
                        {numOfSpontaneousBets === 0
                          ? "Bets closed"
                          : "Check spontaneous bets"}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-600">
                        Updated {formatJerusalem(series.lastUpdate)} ·{" "}
                        {userPoints} pts earned
                      </p>
                    </>
                  ) : (
                    <p className="text-sm font-medium text-gray-700">
                      Starts {formatJerusalem(seriesStart)}
                    </p>
                  )}
                </div>
              </div>

              <section>
                <div className="mb-2 flex items-center justify-center gap-2">
                  <h4 className="text-base font-semibold text-gray-900">
                    Series winner
                  </h4>
                  {isStartDatePassed && <LockedChip />}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {teams.map((team) => {
                    const selected = selectedTeam === team.id;
                    return (
                      <button
                        key={team.id}
                        type="button"
                        aria-pressed={selected}
                        disabled={seriesInputsLocked}
                        onClick={() => setSelectedTeam(team.id)}
                        className={`flex min-h-[5.5rem] min-w-0 flex-col items-center justify-center rounded-xl border px-2 py-3 text-center ${
                          selected
                            ? "border-colors-nba-blue bg-colors-select-bet"
                            : "border-gray-300 bg-gray-50"
                        } ${
                          seriesInputsLocked
                            ? "cursor-not-allowed opacity-60"
                            : "active:scale-[0.98]"
                        }`}
                      >
                        {team.logo && (
                          <img
                            src={team.logo}
                            alt=""
                            className="mb-1 h-9 w-9 object-contain"
                          />
                        )}
                        <span className="flex max-w-full items-center gap-1">
                          {selected && <CheckIcon />}
                          <span className="truncate text-sm font-semibold text-gray-900">
                            {team.name}
                          </span>
                        </span>
                        <span className="text-xs text-gray-500">
                          #{team.seed}
                        </span>
                        {team.isLeading && (
                          <span className="mt-1 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700">
                            Leading
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {isStartDatePassed && (
                  <div className="mt-2">
                    <MobileGuessSplit
                      first={guessPercentage?.teamWin["1"] ?? 0}
                      second={guessPercentage?.teamWin["2"] ?? 0}
                      option1={series.team1 ?? ""}
                      option2={series.team2 ?? ""}
                    />
                  </div>
                )}
              </section>

              <section>
                <div className="mb-2 flex items-center justify-center gap-2">
                  <h4 className="text-base font-semibold text-gray-900">
                    Number of games
                  </h4>
                  {isStartDatePassed && <LockedChip />}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[4, 5, 6, 7].map((games) => {
                    const selected = selectedNumberOfGames === games;
                    return (
                      <button
                        key={games}
                        type="button"
                        aria-pressed={selected}
                        disabled={seriesInputsLocked}
                        onClick={() => setSelectedNumberOfGames(games)}
                        className={`h-11 rounded-xl border text-base font-semibold ${
                          selected
                            ? "border-colors-nba-blue bg-colors-nba-blue text-white"
                            : "border-gray-300 bg-gray-50 text-gray-900"
                        } ${
                          seriesInputsLocked
                            ? "cursor-not-allowed opacity-60"
                            : "active:scale-[0.98]"
                        }`}
                      >
                        {games}
                      </button>
                    );
                  })}
                </div>
              </section>

              <div>
                <Tabs
                  value={selectedTab}
                  onChange={(event, newValue) => {
                    event.preventDefault();
                    setSelectedTab(newValue);
                  }}
                  variant="fullWidth"
                  sx={{
                    minHeight: 44,
                    borderBottom: 1,
                    borderColor: "divider",
                    "& .MuiTab-root": {
                      minHeight: 44,
                      textTransform: "none",
                      fontWeight: 600,
                    },
                  }}
                >
                  <Tab label="Series" />
                  {numOfSpontaneousBets > 0 && <Tab label="Spontaneous" />}
                </Tabs>

                {selectedTab === 0 && (
                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-center gap-2">
                      <h4 className="text-base font-semibold text-gray-900">
                        Select the winner
                      </h4>
                      {isStartDatePassed && <LockedChip />}
                    </div>
                    {(series.playerMatchupBets ?? []).length === 0 ? (
                      <p className="py-6 text-center text-sm text-gray-500">
                        No player matchups for this series.
                      </p>
                    ) : (
                      <ul className="space-y-3">
                        {(series.playerMatchupBets ?? []).map((bet) => (
                          <MobileBetCard
                            key={bet.id}
                            bet={bet}
                            selectedPlayer={selectedPlayerForBet[bet.id]}
                            isLocked={isStartDatePassed}
                            isBusy={isSubmitting}
                            onSelect={(player) =>
                              handlePlayerSelectionForSeries(bet.id, player)
                            }
                            onClear={(player) =>
                              handleRemoveGuessFromBet(bet.id, player)
                            }
                            guessPercentage={guessPercentage.playerMatchup[bet.id]}
                          />
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {selectedTab === 1 && (
                  <div className="mt-4">
                    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 snap-x">
                      {gameNumbers.map((game) => {
                        const selected = gamesTab === game;
                        const locked = isGameLocked(game);
                        return (
                          <button
                            key={game}
                            type="button"
                            ref={(node) => {
                              gameChipRefs.current[game] = node;
                            }}
                            aria-pressed={selected}
                            onClick={() => setGamesTab(game)}
                            className={`inline-flex h-11 shrink-0 snap-start items-center gap-1 rounded-full border px-3 text-sm font-semibold ${
                              selected
                                ? "border-colors-nba-blue bg-colors-nba-blue text-white"
                                : "border-gray-300 bg-white text-gray-800"
                            }`}
                          >
                            Game {game}
                            {locked && (
                              <LockIcon
                                className={`h-3.5 w-3.5 ${
                                  selected ? "text-white/80" : "text-gray-400"
                                }`}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <p className="mx-auto my-3 w-fit rounded-full bg-colors-nba-blue/10 px-3 py-1.5 text-center text-xs font-medium text-gray-700">
                      {gameStart
                        ? `Starts ${formatJerusalem(gameStart)}`
                        : "No start time"}
                    </p>

                    <div className="mb-2 flex items-center justify-center gap-2">
                      <h4 className="text-base font-semibold text-gray-900">
                        Select the winner
                      </h4>
                      {currentGameLocked && <LockedChip />}
                    </div>

                    {spontaneousBetsForGame.length === 0 ? (
                      <p className="py-6 text-center text-sm text-gray-500">
                        No bets for this game.
                      </p>
                    ) : (
                      <ul className="space-y-3">
                        {spontaneousBetsForGame.map((bet) => (
                          <MobileBetCard
                            key={bet.id}
                            bet={bet}
                            selectedPlayer={
                              selectedPlayerForBetSpontaneous[bet.id]
                            }
                            isLocked={currentGameLocked}
                            isBusy={isSubmitting}
                            onSelect={(player) =>
                              handlePlayerSelectionForSpontaneous(bet.id, player)
                            }
                            onClear={(player) =>
                              handleRemoveGuessFromBet(bet.id, player)
                            }
                            guessPercentage={
                              guessPercentage.spontaneousMacthups[bet.id]
                            }
                          />
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {showFooter && (
            <div className="shrink-0 border-t border-gray-200 bg-white px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              {pickSummary && (
                <p className="mb-2 truncate text-center text-xs text-gray-600">
                  {pickSummary}
                </p>
              )}
              {validationError && (
                <p
                  className="mb-2 text-center text-sm font-medium text-red-600"
                  role="alert"
                >
                  {validationError}
                </p>
              )}
              <SubmitButton
                text={isSubmitting ? "Updating.." : "Update"}
                onClick={handleSubmit}
                loading={false}
                className="w-full !py-3"
                disabled={
                  isSubmitting ||
                  (selectedTab === 0
                    ? isStartDatePassed
                    : spontaneousExpiration[currentSpontaneousBet?.id ?? ""] ??
                      true)
                }
              />
            </div>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default TeamDialogMobileView;
