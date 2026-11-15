import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Badge,
  IconButton,
  Menu,
} from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  ChevronDownIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import { PlayerMatchupBet, SpontaneousBet } from "../../types";
import { useError } from "../providers&context/NotificationProvider";
import { getErrorMessage } from "../../api/getErrorMessage";
import axiosInstance from "../../api/axiosInstance";
import { logos, Series } from "../../pages/HomePage";
import defaultLogo from "../../assets/logos/defaultLogoTBD.png";
import TeamDialog from "../form/TeamDialog";
import { useAuth } from "../providers&context/AuthContext";
import { useMissingBets } from "../providers&context/MissingBetsContext";
import { useTournament } from "../providers&context/TournamentContext";

interface MissingBetsData {
  [key: string]: {
    seriesName: string;
    gamesAndWinner: boolean;
    playerMatchup: PlayerMatchupBet[];
    spontaneousBets: SpontaneousBet[];
  };
}

const teamAliasesToFullName: Record<string, string> = {
  hawks: "Atlanta Hawks",
  celtics: "Boston Celtics",
  nets: "Brooklyn Nets",
  hornets: "Charlotte Hornets",
  bulls: "Chicago Bulls",
  cavs: "Cleveland Cavaliers",
  cavaliers: "Cleveland Cavaliers",
  mavs: "Dallas Mavericks",
  nuggets: "Denver Nuggets",
  pistons: "Detroit Pistons",
  warriors: "Golden State Warriors",
  rockets: "Houston Rockets",
  pacers: "Indiana Pacers",
  clippers: "Los Angeles Clippers",
  lakers: "Los Angeles Lakers",
  grizzlies: "Memphis Grizzlies",
  heat: "Miami Heat",
  bucks: "Milwaukee Bucks",
  wolves: "Minnesota Timberwolves",
  timberwolves: "Minnesota Timberwolves",
  pelicans: "New Orleans Pelicans",
  knicks: "New York Knicks",
  thunder: "Oklahoma City Thunder",
  okc: "Oklahoma City Thunder",
  magic: "Orlando Magic",
  suns: "Phoenix Suns",
  sixers: "Philadelphia 76ers",
  "76ers": "Philadelphia 76ers",
  blazers: "Portland Trail Blazers",
  kings: "Sacramento Kings",
  spurs: "San Antonio Spurs",
  raptors: "Toronto Raptors",
  jazz: "Utah Jazz",
  wizards: "Washington Wizards",
};

const normalizeName = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/\s+/g, " ");

const resolveTeamLogo = (teamName?: string) => {
  if (!teamName) return defaultLogo;
  const normalizedInput = normalizeName(teamName);
  const normalizedTeamName =
    teamAliasesToFullName[normalizedInput] ?? teamName.trim();
  const logoKey = normalizedTeamName.toLowerCase().replace(/ /g, "_");
  return logos[logoKey] ?? defaultLogo;
};

const resolveDisplayTeamName = (
  teamName?: string,
  relationName?: string,
) => {
  const candidate = teamName?.trim() || relationName?.trim() || "";
  if (!candidate) return "";
  const normalized = normalizeName(candidate);
  const fullName = teamAliasesToFullName[normalized] ?? candidate;
  return fullName.split(" ").slice(-1)[0] || fullName;
};

interface MissingBetRowProps {
  label: string;
  meta: string;
  onClick: () => void;
}

const MissingBetRow: React.FC<MissingBetRowProps> = ({
  label,
  meta,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-colors-nba-blue/5 active:bg-colors-nba-blue/10"
  >
    <span className="min-w-0 flex-1">
      <span className="block truncate text-sm font-medium text-gray-900">
        {label}
      </span>
      <span className="mt-0.5 block text-[11px] font-medium uppercase tracking-wide text-gray-400">
        {meta}
      </span>
    </span>
    <span className="shrink-0 rounded-full bg-colors-nba-blue/10 px-2 py-0.5 text-[11px] font-semibold text-colors-nba-blue">
      Predict
    </span>
  </button>
);

interface MissingBetsProps {
  showLabel?: boolean;
  compact?: boolean;
}

const MissingBets: React.FC<MissingBetsProps> = ({
  showLabel = true,
  compact = false,
}) => {
  const [badgeContent, setBadgeContent] = useState<number>(0);
  const [missingBetsData, setMissiningBetsData] = useState<MissingBetsData>();
  const { showError } = useError();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedSeries, setSelectedSeries] = useState<Series>();
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [seriesPoints, setSeriesPoints] = useState<number>(0);
  const [spontaneousGameTab, setSpontaneousGameTab] = useState<number>(0);
  const [intialTab, setIntialTab] = useState<number>(0);
  const { refreshTrigger, setMissingBetsCount } = useMissingBets();
  const { pathname } = useLocation();

  const { isLoggedIn } = useAuth();
  const { selectedTournamentId } = useTournament();

  const fetchSeriesData = async (id: string) => {
    try {
      const response = await axiosInstance.get(`/series/${id}`);
      const responsePoints = await axiosInstance.get(`user-series-points/user`);
      setSeriesPoints(responsePoints.data[id]);
      const series: Series = response.data;
      const team1Name = series.team1Relation?.name ?? series.team1 ?? "";
      const team2Name = series.team2Relation?.name ?? series.team2 ?? "";
      const team1Logo = resolveTeamLogo(team1Name);
      const team2Logo = resolveTeamLogo(team2Name);
      series.team1 = resolveDisplayTeamName(
        series.team1,
        series.team1Relation?.name,
      );
      series.team2 = resolveDisplayTeamName(
        series.team2,
        series.team2Relation?.name,
      );
      series.dateOfStart = new Date(response.data.dateOfStart);
      series.logo1 = team1Logo;
      series.logo2 = team2Logo;
      setSelectedSeries(series);
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Couldn't load that series. Try again.",
      );
      if (message) showError(message);
    }
  };

  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const fetchMissingBets = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/user-missing-bets/user`);
      setMissiningBetsData(response.data);
      const totalMissingBets: number = Object.values(
        response.data as MissingBetsData,
      ).reduce(
        (acc: number, series) =>
          acc +
          (series.gamesAndWinner ? 1 : 0) +
          series.playerMatchup.length +
          series.spontaneousBets.length,
        0,
      );
      setBadgeContent(totalMissingBets);
      setMissingBetsCount(totalMissingBets);
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Couldn't load your missing bets. Try again.",
      );
      if (message) showError(message);
    }
  }, [showError, setMissingBetsCount]);

  useEffect(() => {
    if (isLoggedIn && selectedTournamentId) {
      fetchMissingBets();
    } else {
      setBadgeContent(0);
      setMissingBetsCount(0);
    }
  }, [
    fetchMissingBets,
    refreshTrigger,
    isLoggedIn,
    selectedTournamentId,
    pathname,
    setMissingBetsCount,
  ]);

  useEffect(() => {
    if (selectedSeries) {
      setIsDialogOpen(true);
    }
  }, [selectedSeries, intialTab, spontaneousGameTab]);

  const calculateTotalBets = (series: MissingBetsData[string]) => {
    const gamesAndWinnerCount = series.gamesAndWinner ? 1 : 0;
    const playerMatchupCount = series.playerMatchup.length;
    const spontaneousBetsCount = series.spontaneousBets.length;

    return gamesAndWinnerCount + playerMatchupCount + spontaneousBetsCount;
  };

  const seriesIds = missingBetsData ? Object.keys(missingBetsData) : [];
  const hasMissingBets = seriesIds.length > 0;

  const renderSeriesRows = (id: string) => {
    const series = missingBetsData![id];
    return (
      <div className="space-y-0.5">
        {series.gamesAndWinner && (
          <MissingBetRow
            label="Games and Winner"
            meta="Series"
            onClick={() => {
              handleClose();
              setSpontaneousGameTab(0);
              setIntialTab(0);
              void fetchSeriesData(id);
            }}
          />
        )}
        {series.playerMatchup.map((matchup) => (
          <MissingBetRow
            key={matchup.id}
            label={`${matchup.player1} vs ${matchup.player2}`}
            meta="Matchup"
            onClick={() => {
              handleClose();
              setSpontaneousGameTab(0);
              setIntialTab(0);
              void fetchSeriesData(id);
            }}
          />
        ))}
        {series.spontaneousBets.map((matchup) => (
          <MissingBetRow
            key={matchup.id}
            label={`${matchup.player1} vs ${matchup.player2}`}
            meta={
              matchup.gameNumber != null
                ? `Game ${matchup.gameNumber}`
                : "Live bet"
            }
            onClick={() => {
              handleClose();
              setSpontaneousGameTab(matchup.gameNumber ?? 0);
              setIntialTab(1);
              void fetchSeriesData(id);
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="block">
      <div className={`flex items-center ${compact ? "gap-0" : "gap-2"}`}>
        <IconButton
          onClick={handleClick}
          disabled={!isLoggedIn}
          aria-label={
            badgeContent > 0
              ? `Missing bets, ${badgeContent} open`
              : "Missing bets"
          }
          size={compact ? "small" : "medium"}
          sx={
            compact
              ? {
                  width: 40,
                  height: 40,
                  color: isLoggedIn ? "#111827" : undefined,
                }
              : undefined
          }
        >
          <Badge
            badgeContent={!isLoggedIn ? 0 : badgeContent}
            overlap="circular"
            sx={{
              "& .MuiBadge-badge": {
                backgroundColor: "#1D428A",
                color: "white",
                cursor: "pointer",
                ...(compact && {
                  minWidth: 16,
                  height: 16,
                  fontSize: "0.65rem",
                  top: 2,
                  right: 2,
                }),
              },
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className={`${compact ? "size-5" : "size-6"} ${
                !isLoggedIn ? "text-gray-500" : "text-gray-900"
              }`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
              />
            </svg>
          </Badge>
        </IconButton>
        {showLabel && !compact && (
          <button
            type="button"
            className="text-md text-gray-900 sm:hidden focus:outline-none"
            onClick={handleClick}
            disabled={!isLoggedIn}
          >
            Missing Bets
          </button>
        )}
      </div>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        MenuListProps={{
          "aria-label": "Missing bets",
          sx: { py: 0 },
        }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              width: { xs: "min(22rem, calc(100vw - 1.5rem))", sm: 360 },
              maxHeight: "min(70vh, 32rem)",
              overflow: "hidden",
              borderRadius: "16px",
              border: "1px solid rgba(15, 23, 42, 0.08)",
              boxShadow: "0 16px 40px rgba(15, 23, 42, 0.16)",
              backgroundColor: "#ffffff",
            },
          },
        }}
      >
        <div className="flex max-h-[min(70vh,32rem)] flex-col">
          <div className="shrink-0 border-b border-gray-100 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-colors-nba-blue">
                  Missing bets
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {hasMissingBets
                    ? "Tap a bet to finish your prediction."
                    : "You’re caught up for tip-off."}
                </p>
              </div>
              {hasMissingBets && (
                <span className="shrink-0 rounded-full bg-colors-nba-blue px-2.5 py-1 text-xs font-semibold text-white">
                  {badgeContent}
                </span>
              )}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-2">
            {!hasMissingBets ? (
              <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-colors-nba-blue/10 text-colors-nba-blue">
                  <TrophyIcon className="h-5 w-5" aria-hidden />
                </span>
                <p className="text-sm font-medium text-gray-900">
                  No open bets
                </p>
                <p className="text-xs text-gray-500">
                  You’re ready for tip-off.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {seriesIds.map((id) => {
                  const totalBets = calculateTotalBets(missingBetsData![id]);
                  const useAccordion =
                    totalBets > 3 || seriesIds.length > 3;

                  if (useAccordion) {
                    return (
                      <Accordion
                        key={id}
                        disableGutters
                        elevation={0}
                        sx={{
                          borderRadius: "12px !important",
                          border: "1px solid rgba(15, 23, 42, 0.08)",
                          backgroundColor: "#f8fafc",
                          "&:before": { display: "none" },
                          overflow: "hidden",
                        }}
                      >
                        <AccordionSummary
                          expandIcon={
                            <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                          }
                          sx={{
                            minHeight: 44,
                            px: 1.5,
                            "& .MuiAccordionSummary-content": {
                              my: 1,
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: 1,
                            },
                          }}
                        >
                          <span className="truncate text-sm font-semibold text-gray-900">
                            {missingBetsData![id].seriesName}
                          </span>
                          <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-colors-nba-blue ring-1 ring-colors-nba-blue/15">
                            {totalBets}
                          </span>
                        </AccordionSummary>
                        <AccordionDetails sx={{ px: 0.5, pb: 1, pt: 0 }}>
                          {renderSeriesRows(id)}
                        </AccordionDetails>
                      </Accordion>
                    );
                  }

                  return (
                    <section
                      key={id}
                      className="overflow-hidden rounded-xl border border-gray-200/80 bg-slate-50"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-gray-200/70 px-3 py-2">
                        <h3 className="truncate text-sm font-semibold text-gray-900">
                          {missingBetsData![id].seriesName}
                        </h3>
                        <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-colors-nba-blue ring-1 ring-colors-nba-blue/15">
                          {totalBets}
                        </span>
                      </div>
                      <div className="px-0.5 py-1">{renderSeriesRows(id)}</div>
                    </section>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Menu>
      {selectedSeries && (
        <TeamDialog
          isOpen={isDialogOpen}
          series={selectedSeries}
          closeDialog={() => setIsDialogOpen(false)}
          userPoints={seriesPoints}
          intialSelectedTab={intialTab}
          intialGamesTab={spontaneousGameTab + 1}
        />
      )}
    </div>
  );
};

export default MissingBets;
