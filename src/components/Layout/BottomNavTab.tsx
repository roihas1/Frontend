import React from "react";
import { Link } from "react-router-dom";
import { motion, type Transition } from "framer-motion";

interface BottomNavTabProps {
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  isBubbleTarget: boolean;
  to?: string;
  onClick?: () => void;
  isExpanded?: boolean;
  hasPopup?: boolean;
  controlsId?: string;
  transition: Transition;
}

const BottomNavTab: React.FC<BottomNavTabProps> = ({
  label,
  icon: Icon,
  isActive,
  isBubbleTarget,
  to,
  onClick,
  isExpanded,
  hasPopup,
  controlsId,
  transition,
}) => {
  const className = `relative flex min-h-12 flex-1 flex-col items-center justify-center gap-0.5 rounded-full text-[10px] font-medium touch-manipulation select-none [-webkit-tap-highlight-color:transparent] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-colors-nba-blue motion-reduce:transition-none [@media(max-height:500px)]:min-h-11 ${
    isActive ? "text-colors-nba-blue" : "text-gray-700"
  }`;

  const content = (
    <>
      {isBubbleTarget && (
        <motion.span
          layoutId="bottom-nav-bubble"
          className="absolute inset-0 rounded-full bg-white/70 shadow-glass-bubble"
          transition={transition}
          aria-hidden
        />
      )}
      <span className="relative z-10 flex flex-col items-center gap-0.5">
        <Icon className="h-6 w-6" aria-hidden />
        <span className="[@media(max-height:500px)]:sr-only">{label}</span>
      </span>
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        aria-current={isActive ? "page" : undefined}
        className={className}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      aria-haspopup={hasPopup ? "dialog" : undefined}
      aria-expanded={hasPopup ? isExpanded : undefined}
      aria-controls={hasPopup ? controlsId : undefined}
      className={className}
    >
      {content}
    </button>
  );
};

export default BottomNavTab;
