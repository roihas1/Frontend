import React from "react";
import { useMediaQuery, useTheme } from "@mui/material";
import ChampionGuessSummary from "./ChampionGuessSummary";
import ChampionsInputDesktopView from "./championsInput/ChampionsInputDesktopView";
import ChampionsInputMobileView from "./championsInput/ChampionsInputMobileView";
import {
  useChampionsInputModel,
  type ChampionsInputProps,
} from "./championsInput/useChampionsInputModel";

export type { ChampionsInputProps };

const ChampionsInput: React.FC<ChampionsInputProps> = (props) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"), {
    noSsr: true,
  });
  const model = useChampionsInputModel(props);

  if (props.stage === "Finish") {
    return (
      <div
        className={
          isMobile ? "min-h-0 flex-1 overflow-y-auto px-4 py-3" : undefined
        }
      >
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4 sm:p-6 mx-auto">
          <h3 className="text-lg sm:text-xl font-semibold text-center text-colors-nba-blue">
            Champions Betting - Previous Guesses
          </h3>
          <p className="text-xs text-gray-500 text-center mt-1 mb-4">
            Your picks from earlier rounds
          </p>
          <ChampionGuessSummary stage={props.stage} />
          <button
            type="button"
            onClick={() => props.setShowInput("Close")}
            className="w-full min-h-[48px] flex items-center justify-center gap-1.5 text-sm font-medium text-colors-nba-blue active:bg-gray-50 rounded-lg mt-4 sm:w-auto sm:mx-auto sm:px-4 hover:underline"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="size-4 shrink-0"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m4.5 15.75 7.5-7.5 7.5 7.5"
              />
            </svg>
            Collapse Previous Guesses
          </button>
        </div>
      </div>
    );
  }

  if (isMobile) {
    return <ChampionsInputMobileView {...model} />;
  }

  return <ChampionsInputDesktopView {...model} />;
};

export default ChampionsInput;
