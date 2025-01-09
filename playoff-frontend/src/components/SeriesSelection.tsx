// SeriesSelection.tsx
import React from "react";
import { Series } from "../pages/HomePage";


interface SeriesSelectionProps {
  seriesList: Series[];
  selectedSeries: Series | null;
  onSeriesSelect: (series: Series) => void;
}

interface SeriesSelectionProps {
    seriesList: Series[];
    selectedSeries: Series | null;
    onSeriesSelect: (series: Series) => void; // On select series
    setBets: React.Dispatch<React.SetStateAction<any[]>>; // Set bets function
  }
  
  const SeriesSelection: React.FC<SeriesSelectionProps> = ({
    seriesList,
    selectedSeries,
    onSeriesSelect,
    setBets,
  }) => {
    const handleSeriesSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedSeriesId = e.target.value;
      const series = seriesList.find((s) => s.id === selectedSeriesId);
      if (series) {
        onSeriesSelect(series); // Update selected series
        setBets(series.playerMatchupBets); // Set bets for the selected series
      }
    };
  
    return (
      <div className="mb-4">
        <label htmlFor="selectSeries" className="block text-lg font-semibold">
          Select a Series
        </label>
        <select
          id="selectSeries"
          value={selectedSeries?.id || ""}
          onChange={handleSeriesSelect}
          className="w-full p-3 border border-gray-300 rounded-lg mt-2"
        >
          <option value="">-- Select Series --</option>
          {seriesList.map((series) => (
            <option key={series.id} value={series.id}>
              {series.team1} vs {series.team2}
            </option>
          ))}
        </select>
      </div>
    );
  };
  
  export default SeriesSelection;