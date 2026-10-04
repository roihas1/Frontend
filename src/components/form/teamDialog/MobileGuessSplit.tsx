import React from "react";

interface MobileGuessSplitProps {
  first: number;
  second: number;
  option1: string;
  option2: string;
}

const clampShare = (value: number, max: number) => {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(value, max));
};

const MobileGuessSplit: React.FC<MobileGuessSplitProps> = ({
  first,
  second,
  option1,
  option2,
}) => {
  const leftWidth = clampShare(first, 100);
  const rightWidth = clampShare(second, 100 - leftWidth);

  return (
    <div>
      <div className="mb-1 grid grid-cols-2 gap-2 text-[11px] leading-tight text-gray-600">
        <span className="min-w-0 truncate" title={option1}>
          <span className="font-semibold text-colors-nba-blue">
            {leftWidth.toFixed(0)}%
          </span>{" "}
          {option1}
        </span>
        <span className="min-w-0 truncate text-right" title={option2}>
          {option2}{" "}
          <span className="font-semibold text-[#3a86b0]">
            {rightWidth.toFixed(0)}%
          </span>
        </span>
      </div>
      <div className="flex h-2 overflow-hidden rounded-full bg-[#c8f7ff]">
        <div
          className="h-full bg-colors-nba-blue"
          style={{ width: `${leftWidth}%` }}
        />
        <div
          className="h-full bg-[#539dc9]"
          style={{ width: `${rightWidth}%` }}
        />
      </div>
    </div>
  );
};

export default MobileGuessSplit;
