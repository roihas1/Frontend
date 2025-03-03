import { Paper, Typography } from "@mui/material";

const ChampColumn = () => {
    const opacity = 0.218;
    return (
      <div className="flex flex-col space-y-2">
        <div>
          <Paper
            sx={{
              padding: 1,
              backgroundColor: `rgba(107, 144, 225,${opacity})`,
            }}
          >
            <Typography className="text-md flex justify-center truncate">
              Champion Team
            </Typography>
          </Paper>
        </div>
        <div>
          <Paper
            sx={{
              padding: 1,
              backgroundColor: `rgba(107, 144, 225,${opacity})`,
            }}
          >
            <Typography className="text-md flex justify-center truncate">
              MVP
            </Typography>
          </Paper>
        </div>
        <div>
          <Paper
            sx={{
              padding: 1,
              backgroundColor: `rgba(107, 144, 225,${opacity + 0.5})`,
            }}
          >
            <Typography className="text-md flex justify-center truncate">
              Eastern Conference Teams
            </Typography>
          </Paper>
        </div>
        <div>
          <Paper
            sx={{
              padding: 1,
              backgroundColor: `rgba(107, 144, 225,${opacity + 0.5})`,
            }}
          >
            <Typography className="text-md flex justify-center truncate">
              Western Conference Teams
            </Typography>
          </Paper>
        </div>
        <div>
          <Paper
            sx={{
              padding: 1,
              backgroundColor: `rgba(107, 144, 225,${opacity + 0.5})`,
            }}
          >
            <Typography className="text-md flex justify-center truncate">
              Finals NBA Teams
            </Typography>
          </Paper>
        </div>
      </div>
    );
  };
  export default ChampColumn;