import React from "react";
import { Tooltip } from "@mui/material";

interface HorizontalBarProps {
  first: number;
  second: number;
  option1: string;
  option2: string;
}

export const HorizontalBar: React.FC<HorizontalBarProps> = ({
  first,
  second,
  option1,
  option2,
}) => {
  const leftWidth = Math.max(0, Math.min(first, 100));
  const rightWidth = Math.max(0, Math.min(second, 100 - leftWidth));
  const noneWidth = 100 - leftWidth - rightWidth;
  const leftPercetangeDisplay =
    leftWidth >= rightWidth && leftWidth >= noneWidth;
  const rightPercetangeDisplay =
    rightWidth > leftWidth && rightWidth > noneWidth;

  return (
    <div className="flex flex-col sm:flex-row items-center w-full">
      <div className="flex w-full border border-gray-200 rounded-lg p-0.5 h-8">
        <Tooltip title={option1} arrow>
          <div
            className={`flex items-center justify-center truncate bg-colors-nba-blue 
              ${
                rightWidth < 1 && noneWidth < 1
                  ? "rounded-e-md rounded-s-md"
                  : "rounded-s-md"
              }`}
            style={{ width: `${leftWidth}%`, color: "white" }}
          >
            {leftPercetangeDisplay && (
              <span className=" hidden sm:inline text-s">
                {leftWidth.toFixed(1)}%
              </span>
            )}
            {leftPercetangeDisplay && (
              <span className="sm:hidden">
                {option1} ({leftWidth.toFixed(1)}%)
              </span>
            )}
          </div>
        </Tooltip>

        <Tooltip title={option2} arrow>
          <div
            className={`flex items-center justify-center truncate bg-[#539dc9]
              ${leftWidth < 1 ? "rounded-s-md" : ""} 
              ${noneWidth < 1 ? "rounded-e-md" : ""}`}
            style={{ width: `${rightWidth}%`, color: "white" }}
          >
            {rightPercetangeDisplay && (
              <span className="hidden sm:inline text-s ">
                {rightWidth.toFixed(1)}%
              </span>
            )}
            {rightPercetangeDisplay && (
              <span className=" sm:hidden ">
                {option2} ({rightWidth.toFixed(1)}%)
              </span>
            )}
          </div>
        </Tooltip>

        {noneWidth > 0 && (
          <Tooltip title="None" arrow>
            <div
              className={`flex items-center justify-center truncate bg-[#c8f7ff] rounded-e-md
                ${leftWidth < 1 && rightWidth < 1 ? "rounded-s-md" : ""}`}
              style={{ width: `${noneWidth}%`, color: "black" }}
            >
              {!rightPercetangeDisplay &&
                !leftPercetangeDisplay &&
                `${noneWidth.toFixed(1)}%`}
            </div>
          </Tooltip>
        )}
      </div>
    </div>
  );
};
