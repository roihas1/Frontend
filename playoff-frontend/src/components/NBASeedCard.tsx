import React, { useState } from "react";
import TeamDialog from "./form/TeamDialog"; // Import the TeamDialog component
import { Series } from "../pages/HomePage";
import NBALogo from "../assets/NBALogo.jpg"


interface NBASeedCardProps {
 series: Series | undefined
}

const NBASeedCard: React.FC<NBASeedCardProps> = ({ series }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const openDialog = () => setIsDialogOpen(true);
  const closeDialog = () => setIsDialogOpen(false);
  
  if (!series) {
    console.log("undefined series")
    return (
      <div className="bg-white shadow-lg rounded-lg p-2 max-w-xs mx-auto">
        <div className="flex flex-col items-center cursor-pointer">
          {/* NBA Logo Placeholder */}
          <div className="relative">
            <img
              src={NBALogo}
              alt="NBA Logo"
              className="w-14 h-14 object-contain transition-transform hover:scale-110"
            />
          </div>
          <p className="text-sm font-bold text-gray-700 mt-2">Waiting for Matchup</p>

         
        </div> 
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-2 max-w-xs mx-auto">
      {/* Series (clickable) */}
      <div className="flex flex-col items-center cursor-pointer" onClick={openDialog}>
        {/* Team 1 */}
        <div className="relative">
          <img
            src={series.logo1}
            alt={`Team ${series.team1}`}
            className="w-14 h-14 object-contain transition-transform hover:scale-110"
          />
          {/* Team name (hidden initially) */}
          <p className="absolute inset-0 flex items-center justify-center text-sm text-white font-bold opacity-0 hover:opacity-90 bg-black rounded-3xl max-w-full text-ellipsis overflow-hidden transition-opacity text-center">
            {series.team1}
          </p>
        </div>
        <p className="text-sm font-bold text-gray-700 mt-2">Seed #{series.seed1}</p>

        {/* Divider */}
        <div className="border-t border-colors-nba-blue m-2 w-full"></div>

        {/* Team 2 */}
        <div className="relative">
          <img
            src={series.logo2}
            alt={`Team ${series.team2}`}
            className="w-14 h-14 object-contain transition-transform hover:scale-110"
          />
          {/* Team name (hidden initially) */}
          <p className="absolute inset-0 flex items-center justify-center text-sm text-white font-bold opacity-0 hover:opacity-90 bg-black rounded-3xl transition-opacity text-center w-full">
            {series.team2}
          </p>
        </div>
        <p className="text-sm font-bold text-gray-700 mt-2">Seed #{series.seed2}</p>
      </div>

      {/* Team Dialog */}
      <TeamDialog
        isOpen={isDialogOpen}
        series={series}
        closeDialog={closeDialog}
      />
    </div>
  );
};

export default NBASeedCard;
