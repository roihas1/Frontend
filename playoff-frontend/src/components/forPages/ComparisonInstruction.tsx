
import { Paper, Typography } from "@mui/material";

const InstructionPaper = () => (
  <Paper
    sx={{
      padding: 3,
      marginBottom: 2,
      backgroundColor: "#f9fafb",
      maxWidth: "600px",
      margin: "auto",
      borderRadius: "8px",
      boxShadow: 3,
    }}
  >
    {/* Title */}
    <Typography
      className="text-xl font-semibold text-center mb-4"
      sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 700, color: "#333" }}
    >
      <strong>How to Compare Users</strong>
    </Typography>

    {/* Instructions */}
    <ul className="text-sm text-left space-y-3">
      <li>
        <strong>1. Select a Series or Switch to Championship:</strong> Use the "Select Series" dropdown to compare a playoff matchup.  
        To compare championship predictions, switch to "Champ" at the top.
      </li>
      <li>
        <strong>2. Choose Users:</strong> Pick from the Top 5 leaderboard or use the search bar.
      </li>
      <li>
        <strong>3. View & Compare Predictions:</strong> Analyze series results, championship picks, and fantasy points.
      </li>
      <li>
        <strong>4. Remove Users:</strong> Click "X" next to a user's name to remove them.
      </li>
      <li>
        <strong>5. Understanding Scores:</strong> Points are awarded based on correct predictions. Scores update after each game.
      </li>
    </ul>
  </Paper>
);

export default InstructionPaper;
