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
      <strong>Let the Matchup Begin! 🏆</strong>
    </Typography>

    {/* Instructions */}
    <ul className="text-sm text-left space-y-3">
      <li>
        <strong>1. Pick Your Battle ⚔️:</strong> Select a playoff series and a league to compare users from.
      </li>
      <li>
        <strong>2. Choose Your Rivals 👥:</strong> Use the search bar to find them.
      </li>
      <li>
        <strong>3. Pick Your Betting Style 🎯:</strong> Compare Series Bets or Championship Picks. If you go with Series, choose between **Regular** and **Spontaneous** bets.
      </li>
      <li>
        <strong>4. Watch the Showdown 📊:</strong> See who made the boldest predictions and how their scores stack up!
      </li>
      <li>
        <strong>5. Adjust Your Squad 🚀:</strong> Want to swap someone out? Just hit the "X" next to their name.
      </li>
    </ul>
  </Paper>
);

export default InstructionPaper;
