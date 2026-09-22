import React from "react";
import {
  FormControl,
  MenuItem,
  Select,
  type SelectChangeEvent,
} from "@mui/material";

interface LeagueStandingsPaginationProps {
  pageStart: number;
  pageEnd: number;
  hasPrev: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  limit: number;
  onLimitChange: (e: SelectChangeEvent<number>) => void;
  compact?: boolean;
  showPageSize?: boolean;
}

const LeagueStandingsPagination: React.FC<LeagueStandingsPaginationProps> = ({
  pageStart,
  pageEnd,
  hasPrev,
  hasNext,
  onPrevious,
  onNext,
  limit,
  onLimitChange,
  compact = false,
  showPageSize = true,
}) => (
  <div
    className={`flex flex-col gap-3 ${compact ? "pb-24" : "pb-4"}`}
  >
    <div className="grid grid-cols-3 items-center gap-2">
      <button
        type="button"
        className="flex w-full justify-center gap-1.5 items-center px-3 py-2.5 bg-colors-nba-blue text-white rounded-lg disabled:opacity-50 min-h-12"
        onClick={onPrevious}
        disabled={!hasPrev}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="size-4 shrink-0"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
          />
        </svg>
        <span>{compact ? "Prev" : "Previous"}</span>
      </button>
      <span className="px-2 py-2 rounded-full bg-gray-100 text-sm font-medium text-gray-700 whitespace-nowrap text-center tabular-nums">
        {pageStart > 0 ? `${pageStart}–${pageEnd}` : "—"}
      </span>
      <button
        type="button"
        className="flex w-full justify-center gap-1.5 items-center px-3 py-2.5 bg-colors-nba-blue text-white rounded-lg disabled:opacity-50 min-h-12"
        onClick={onNext}
        disabled={!hasNext}
      >
        <span>Next</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="size-4 shrink-0"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
          />
        </svg>
      </button>
    </div>
    {showPageSize && (
      <div className="flex justify-center">
        <FormControl className="w-full max-w-[180px]">
          <Select
            labelId="standings-limit"
            id="standingsLimitSelection"
            value={limit}
            onChange={onLimitChange}
            size="small"
            sx={{
              borderRadius: "1rem",
              minWidth: 96,
              "& .MuiSelect-select": { py: 1 },
            }}
          >
            <MenuItem value={10}>10 per page</MenuItem>
            <MenuItem value={30}>30 per page</MenuItem>
            <MenuItem value={50}>50 per page</MenuItem>
          </Select>
        </FormControl>
      </div>
    )}
  </div>
);

export default LeagueStandingsPagination;
