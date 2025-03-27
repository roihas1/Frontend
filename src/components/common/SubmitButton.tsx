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
      ${className ? className : "w-full sm:w-1/2"} 
      px-4 py-2 sm:px-6 sm:py-3 
     text-sm
       sm:text-lg font-semibold 
      bg-colors-nba-blue text-white rounded-xl 
      hover:bg-colors-nba-red  
      disabled:bg-gray-400 disabled:cursor-not-allowed 
      transition-all duration-200 ease-in-out shadow-md
    `}
    onClick={onClick}
    disabled={disabled}
  >
    {loading ? `${text}...` : text}
  </button>
);

export default SubmitButton;
