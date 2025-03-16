interface SubmitButtonProps {
  loading: boolean;
  text: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  disabled?: boolean;
  className?: string;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
  loading,
  text,
  onClick,
  disabled,
  className,
}) => (
  <button
    type="submit"
    className={`
      ${className ? className : "w-full sm:w-1/3"} 
      px-6 py-3 min-w-[120px] text-lg font-semibold 
      bg-colors-nba-blue text-white rounded-xl 
      hover:bg-colors-nba-red focus:ring-4 focus:ring-colors-nba-red/50 
      disabled:bg-gray-400 disabled:cursor-not-allowed 
      transition-all duration-200 ease-in-out shadow-lg
    `}
    onClick={onClick}
    disabled={disabled}
  >
    {loading ? `${text}...` : text}
  </button>
);

export default SubmitButton;
