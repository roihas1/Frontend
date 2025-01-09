interface SubmitButtonProps {
  loading: boolean;
  text: string;
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void; // Type onClick to accept a mouse event
  disabled?: boolean;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ loading, text, onClick , disabled}) => (
  <button
    type="submit"
    className="w-1/3 p-3  bg-colors-nba-blue text-white rounded-2xl hover:bg-colors-nba-red shadow-2xl"
    onClick={onClick} // onClick is passed from the parent component
    disabled= {disabled}
  >
    {loading ? `${text}...` : text}
  </button>
);

export default SubmitButton;
