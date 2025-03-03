import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Badge,
  IconButton,
  ListSubheader,
  Menu,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { PlayerMatchupBet, SpontaneousBet } from "../../types";
import { useError } from "../providers&context/ErrorProvider";
// import { useSuccessMessage } from "../providers&context/successMassageProvider";
import axiosInstance from "../../api/axiosInstance";
import { logos, Series } from "../../pages/HomePage";
import TeamDialog from "../form/TeamDialog";
import { useAuth } from "../providers&context/AuthContext";
import { useMissingBets } from "../providers&context/MissingBetsContext";
import StyledMenuItem from "../forPages/StyledMenuItem";

interface MissingBetsData {
  [key: string]: {
    seriesName: string;
    gamesAndWinner: boolean;
    playerMatchup: PlayerMatchupBet[];
    spontaneousBets: SpontaneousBet[];
  };
}

const MissingBets = () => {
  const [badgeContent, setBadgeContent] = useState<number>(0);
  const [missingBetsData, setMissiningBetsData] = useState<MissingBetsData>();
  const { showError } = useError();
  // const { showSuccessMessage } = useSuccessMessage();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedSeries, setSelectedSeries] = useState<Series>();
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [seriesPoints, setSeriesPoints] = useState<number>(0);
  const [spontaneousGameTab, setSpontaneousGameTab] = useState<number>(0);
  const [intialTab, setIntialTab] = useState<number>(0);
  const { refreshTrigger } = useMissingBets();

  const { isLoggedIn } = useAuth();

  const fetchSeriesData = async (id: string) => {
    try {
      const response = await axiosInstance.get(`/series/${id}`);
      const responsePoints = await axiosInstance.get(
        `series/${id}/getOverallPointsPerSeries`
      );

      setSeriesPoints(responsePoints.data);
      const series: Series = response.data;
      const team1Logo = logos[series.team1.toLowerCase().replace(/ /g, "_")];
      const team2Logo = logos[series.team2.toLowerCase().replace(/ /g, "_")];
      series.dateOfStart = new Date(response.data.dateOfStart);
      series.logo1 = team1Logo;
      series.logo2 = team2Logo;

      setSelectedSeries(series);
    } catch {
      showError(`Server Error,try again.`);
    }
  };

  // Open/close state for a possible modal or dropdown
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const fetchMissingBets = async () => {
    try {
      const response = await axiosInstance.get(`/series/bets/allMissingBets`);

      setMissiningBetsData(response.data);
      const totalMissingBets: number = Object.values(response.data as MissingBetsData ).reduce(
        (acc: number, series) =>
          acc +
          (series.gamesAndWinner ? 1 : 0) + // Add 1 if gamesAndWinner is true
          series.playerMatchup.length + // Count playerMatchup bets
          series.spontaneousBets.length, // Count spontaneous bets
        0
      );
      setBadgeContent(totalMissingBets);
    } catch (error) {
      showError(`${error}`);
    }
  };
  useEffect(() => {
    if (isLoggedIn) {
      fetchMissingBets();
    }
   
  }, [refreshTrigger]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchMissingBets();
    }
  }, [isLoggedIn]);

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

  return (
    <div className="block ">
      <IconButton onClick={handleClick} disabled={!isLoggedIn}>
        <Badge
          badgeContent={!isLoggedIn ? 0 : badgeContent}
          sx={{
            "& .MuiBadge-badge": {
              backgroundColor: "#1D428A",
              color: "white",
              cursor: "pointer",
            },
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className={`size-6 text-black ${
              !isLoggedIn ? "text-gray-500" : ""
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
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
        sx={{
          "& .MuiPaper-root": {
            borderRadius: "6px",
            boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
            backgroundColor: "#f5f5f5",
          },
        }}
      >
        <div className="p-2.5 flex justify-center">
          {missingBetsData && Object.keys(missingBetsData).length > 0 ? (
            <Typography
              variant="h6"
              sx={{
                fontWeight: "semi-bold",
                textDecoration: "underline",
                color: "black",
              }}
            >
              Bets you need to guess
            </Typography>
          ) : (
            <Typography
              variant="h6"
              sx={{
                fontWeight: 300,
                fontStyle: "italic",
                color: "black",
              }}
            >
              No bets need to be guessed
            </Typography>
          )}
        </div>
        {missingBetsData &&
          Object.keys(missingBetsData).map((id) => {
            const totalBets = calculateTotalBets(missingBetsData[id]);
            return totalBets > 3 || Object.keys(missingBetsData).length > 3 ? (
              <Accordion key={id}>
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
                  sx={{
                    backgroundColor: "#f5f5f5",
                    "&.Mui-expanded": {
                      minHeight: "32px", // Adjust the height when expanded
                      margin: 0, // Remove additional margin
                    },
                    "& .MuiAccordionSummary-content": {
                      margin: "1px", // Remove margin inside the content
                    },
                    padding: "4px 8px", // Adjust the padding for a tighter look
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: "600",
                      textDecoration: "underline",
                    }}
                  >
                    {missingBetsData[id].seriesName}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {/* Display inside Accordion */}
                  {missingBetsData[id].gamesAndWinner && (
                    <StyledMenuItem
                      key={`${id}-gamesWinner`}
                      onClick={() => {
                        handleClose();
                        setSpontaneousGameTab(0);
                        setIntialTab(0);
                        fetchSeriesData(id);
                      }}
                    >
                      Games and Winner Selection
                    </StyledMenuItem>
                  )}
                  {missingBetsData[id].playerMatchup.map((matchup) => (
                    <StyledMenuItem
                      key={matchup.id}
                      onClick={() => {
                        handleClose();
                        setSpontaneousGameTab(0);
                        setIntialTab(0);
                        fetchSeriesData(id);
                      }}
                    >
                      {matchup.player1} vs {matchup.player2}
                    </StyledMenuItem>
                  ))}
                  {missingBetsData[id].spontaneousBets.map((matchup) => (
                    <StyledMenuItem
                      key={matchup.id}
                      onClick={() => {
                        setSpontaneousGameTab(matchup.gameNumber ?? 0);
                        setIntialTab(1);
                        handleClose();
                        fetchSeriesData(id);
                      }}
                    >
                      {matchup.player1} vs {matchup.player2}
                    </StyledMenuItem>
                  ))}
                </AccordionDetails>
              </Accordion>
            ) : (
              <div>
                <ListSubheader
                  sx={{
                    padding: "4px 8px", // Match AccordionSummary padding
                    backgroundColor: "#f5f5f5", // Same background color
                    borderRadius: "4px", // Consistent rounded corners
                    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)", // Subtle shadow for elevation
                    cursor: "pointer", // Make it feel clickable like Accordion
                    "&:hover": {
                      backgroundColor: "#e0e0e0", // Slight hover effect
                    },
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: "600",
                      textDecoration: "underline",
                      color: "black",
                    }}
                  >
                    {missingBetsData[id].seriesName}
                  </Typography>
                </ListSubheader>
                {missingBetsData[id].gamesAndWinner && (
                  <StyledMenuItem
                    key={`${id}-gamesWinner`}
                    onClick={() => {
                      handleClose();
                      setSpontaneousGameTab(0);
                      setIntialTab(0);
                      fetchSeriesData(id);
                    }}
                  >
                    Games and Winner Selection
                  </StyledMenuItem>
                )}
                {missingBetsData[id].playerMatchup.map((matchup) => (
                  <StyledMenuItem
                    key={matchup.id}
                    onClick={() => {
                      handleClose();
                      setSpontaneousGameTab(0);
                      setIntialTab(0);
                      fetchSeriesData(id);
                    }}
                  >
                    {matchup.player1} vs {matchup.player2}
                  </StyledMenuItem>
                ))}
                {missingBetsData[id].spontaneousBets.map((matchup) => (
                  <StyledMenuItem
                    key={matchup.id}
                    onClick={() => {
                      setSpontaneousGameTab(matchup.gameNumber ?? 0);
                      setIntialTab(1);
                      handleClose();
                      fetchSeriesData(id);
                    }}
                  >
                    {matchup.player1} vs {matchup.player2}
                  </StyledMenuItem>
                ))}
              </div>
            );
          })}
      </Menu>
      {selectedSeries && (
        <TeamDialog
          isOpen={isDialogOpen}
          series={selectedSeries}
          closeDialog={() => setIsDialogOpen(false)}
          userPoints={seriesPoints}
          intialSelectedTab={intialTab}
          intialGamesTab={spontaneousGameTab}
        />
      )}
    </div>
  );
};

export default MissingBets;
