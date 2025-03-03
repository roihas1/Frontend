import React from "react";
import { Series } from "../../pages/HomePage";

interface SelectSeriesDropdownProps {
  seriesList: Series[];
  selectedSeries: Series | null;
  handleSeriesSelection: (e: React.ChangeEvent<{ value: unknown }>) => void;
}

const SelectSeriesDropdown: React.FC<SelectSeriesDropdownProps> = ({
  seriesList,
  selectedSeries,
  handleSeriesSelection,
}) => (
  <div className="mb-4">
    <label htmlFor="selectSeries" className="block text-lg font-semibold">
      Select a Series
    </label>
    <select
      id="selectSeries"
      value={selectedSeries?.id || ""}
      onChange={handleSeriesSelection}
      className="w-full p-3 border border-gray-300 rounded-lg mt-2"
    >
      <option value="">-- Select Series --</option>
      {seriesList.map((series) => (
        <option key={series.id} value={series.id}>
          {series.team1} vs {series.team2} ({series.round})
        </option>
      ))}
    </select>
  </div>
);

export default SelectSeriesDropdown;
