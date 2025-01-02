interface SubmitButtonProps {
  loading: boolean;
  text: string;
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void; // Type onClick to accept a mouse event
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ loading, text, onClick }) => (
  <button
    type="submit"
    className="w-1/3 p-3 mt-4 bg-colors-nba-blue text-white rounded-2xl hover:bg-colors-nba-red"
    onClick={onClick} // onClick is passed from the parent component
  >
    {loading ? `${text}...` : text}
  </button>
);

export default SubmitButton;
