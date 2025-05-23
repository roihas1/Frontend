import React, { useEffect, useState } from "react";
import TeamDialog from "../form/TeamDialog"; // Import the TeamDialog component
import { Series } from "../../pages/HomePage";

// import { useError } from "../providers&context/ErrorProvider";
import { CircularProgress } from "@mui/material";
import Logo from "../../assets/siteLogo/logo_color_trans.png";


interface NBASeedCardProps {
  series: Series | undefined;
  userPoints: number;
  fetchData: ()=>void;
}

const NBASeedCard: React.FC<NBASeedCardProps> = ({ series, userPoints, fetchData }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [seriesScore, setSeriesScore] = useState<number[]>([]);
  // const { showError } = useError();
  
  const openDialog = () => setIsDialogOpen(true);
  const closeDialog = () => {
    setIsDialogOpen(false);

  };
  const [loading, setLoading] = useState<boolean>(false);

  const getSeriesScore = async () => {
    setLoading(true);
    setSeriesScore(series?.bestOf7BetId?.seriesScore ?? [0]);
    setLoading(false);
    // setLoading(true);
    // try {
    //   const seriesResponse = await axiosInstance.get(
    //     `/series/${series?.id}/score`
    //   );
    //   setSeriesScore(seriesResponse.data);
    //   // Log the API response
    // } catch (error) {
    //   showError("Failed to fetch series score.");
    //   console.error("Error fetching series score:", error); // Log the error to debug
    //   setLoading(false);
    // } finally {
    //   setLoading(false);
    // }
  };

  useEffect(() => {
    if (series) {
      getSeriesScore();
    }
  }, [series]);

  if (!series) {
    return (
      <div
        className={`bg-white shadow-lg rounded-lg p-2 m-2 max-w-xs mx-auto `}
      >
        <div className="flex flex-col items-center justify-center rounded-md">
          <div className="relative">
            <img
              src={Logo}
              alt="NBA Logo"
              className="w-14 h-14 object-contain rounded-2xl"
            />
          </div>
          <p className="text-xs font-bold text-gray-700 mt-2 text-center">
            Waiting for Matchup
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-1 max-w-xs mx-auto">
      {loading && (
        <div className="flex justify-center">
          <CircularProgress />
        </div>
      )}
      {/* Series */}
      {!loading && (
        <div
          className={`flex flex-col items-center cursor-pointer `}
          onClick={openDialog}
        >
          {/* Team 1 */}
          <div
            className={`relative flex items-center w-full `}
          >
            {/* Left column for win count with background color */}
            <div className="w-1/4 flex justify-center items-center bg-blue-100 rounded-lg py-1">
              <div className="text-md font-bold text-blue-600 px-2">
                {seriesScore[0]} {/* Display wins for team 1 */}
              </div>
            </div>

            {/* Right column for team logo, seed, and name */}
            <div className="w-3/4 flex flex-col items-center ">
              <img
                src={series.logo1}
                alt={`Team ${series.team1}`}
                className="w-10 h-10 object-contain transition-transform hover:scale-110"
              />
              {/* Team name (hidden initially) */}
              <p className="absolute inset-0 flex items-center justify-center text-sm text-white font-bold opacity-0 hover:opacity-90 bg-black rounded-xl max-w-full text-ellipsis overflow-hidden transition-opacity text-center">
                {series.team1 === "timberwolves" ? "Wolves" : series.team1}
              </p>
              {/* <p className="text-xs font-semibold text-gray-700 mt-2">{series.team1 === "timberwolves" ? "Wolves" : series.team1}</p> */}
              <p className="text-xs font-semibold text-gray-700">
                Seed #{series.seed1}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-300 my-1 w-full"></div>

          {/* Team 2 */}
          <div
            className={`relative flex items-center w-full `}
          >
            {/* Left column for win count with background color */}
            <div className="w-1/4 flex justify-center items-center bg-blue-100 rounded-lg py-2">
              <div className="text-md font-bold text-blue-600">
                {seriesScore[1]}
              </div>
            </div>

            {/* Right column for team logo, seed, and name */}
            <div className="w-3/4 flex flex-col items-center">
              <img
                src={series.logo2}
                alt={`Team ${series.team2}`}
                className="w-10 h-10 object-contain transition-transform hover:scale-110"
              />
              {/* Team name (hidden initially) */}
              <p className="absolute inset-0 flex items-center justify-center text-sm text-white font-bold opacity-0 hover:opacity-90 bg-black rounded-xl max-w-full text-ellipsis overflow-hidden transition-opacity text-center">
                {series.team2 === "timberwolves" ? "Wolves" : series.team2}
              </p>
              {/* <p className="text-xs font-semibold text-gray-700 mt-2">{series.team2 === "timberwolves" ? "Wolves" : series.team2}</p> */}
              <p className="text-xs font-semibold text-gray-700">
                Seed #{series.seed2}
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Team Dialog */}
      <TeamDialog
        isOpen={isDialogOpen}
        series={series}
        closeDialog={closeDialog}
        userPoints={userPoints}
        fetchData={fetchData}
      />
    </div>
  );
};

export default React.memo(NBASeedCard);
