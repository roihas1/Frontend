import React from "react";
import SubmitButton from "../common/SubmitButton"; // Import SubmitButton if it's a separate component

interface ActionButtonsProps {
  text1: string;
  text2: string;
  onClick1: () => void;
  onClick2?: (e: React.FormEvent) => Promise<void>;
  loading: boolean;
  disabled?: boolean; // Optional: If you want to disable buttons in certain conditions
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  text1,
  text2,
  onClick1,
  onClick2,
  loading,
  disabled = false,
}) => {
  return (
    <div className="flex justify-between mt-4 mb-4">
      <button
        type="button"
        onClick={onClick1}
        className="text-colors-nba-red hover:scale-110 transition-transform"
       
      >
        {text1}
      </button>
      <SubmitButton
        text={text2}
        loading={loading}
        onClick={onClick2}
        disabled={disabled || loading}
      />
    </div>
  );
};

export default ActionButtons;
