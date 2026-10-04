import {
  Autocomplete,
  Checkbox,
  FormControl,
  Input,
  TextField,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { User } from "../types";
import axiosInstance from "../api/axiosInstance";
import { buildRemoveUsersRequest } from "../api/privateLeagueRequests";
import { useError, useSuccessMessage } from "../components/providers&context/NotificationProvider";
import { getErrorMessage } from "../api/getErrorMessage";
import { League } from "./LeagueSelectionPage";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTournament } from "../components/providers&context/TournamentContext";

const ManageLeague: React.FC = () => {
  const location = useLocation();
  const { showError } = useError();
  const navigate = useNavigate();
  const { showSuccessMessage } = useSuccessMessage();
  const tempLeague = location.state?.league;
  const [leagueName, setLeagueName] = useState<string>("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [league, setLeague] = useState<League>();
  const { selectedTournamentId } = useTournament();

  useEffect(() => {
    const settingLeague = () => {
      setLeague(tempLeague);
    };
    const fetchLeagueUsers = async () => {
      try {
        const response = await axiosInstance.get(
          `/private-league/${league?.id}/users`
        );
        setUsers(response.data);
      } catch (error) {
        const message = getErrorMessage(
          error,
          "Couldn't load league members. Try again.",
        );
        if (message) showError(message);
      }
    };

    settingLeague();
    if (league) {
      fetchLeagueUsers();
    }
  }, [league, selectedTournamentId, showError]);

  const handleUpdateLeagueName = async () => {
    try {
      await axiosInstance.patch(
        `/private-league/${league?.id}/${leagueName}/updateName`
      );
      if (league) league.name = leagueName;
      setLeagueName("");
      showSuccessMessage("League renamed.", `It's now ${leagueName}.`);
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Couldn't rename the league. Try again.",
      );
      if (message) showError(message);
    }
  };

  const handleDeleteLeague = async () => {
    try {
      if (!league?.id) return;
      deleteLeagueMutation.mutate(league.id);
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Couldn't delete the league. Try again.",
      );
      if (message) showError(message);
    }
  };
  const queryClient = useQueryClient();

  const deleteLeagueMutation = useMutation({
    mutationFn: async (leagueId: string) => {
      return axiosInstance.delete(`/private-league/${leagueId}`);
    },
    onSuccess: () => {
      showSuccessMessage("League deleted.");
      queryClient.invalidateQueries({
        queryKey: ["private-leagues", selectedTournamentId],
      });
      navigate("/leagues");
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(
        error,
        "Couldn't delete the league. Try again.",
      );
      if (message) showError(message);
    },
  });

  const handleRemoveUsers = async () => {
    try {
      await axiosInstance.patch(
        `/private-league/${league?.id}/removeUsers`,
        buildRemoveUsersRequest(
          selectedUsers.map((user) => user.id),
          selectedTournamentId,
        ),
      );

      setSelectedUsers([]);
      showSuccessMessage(
        "Players removed.",
        league?.name ? `They're out of ${league.name}.` : undefined,
      );
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Couldn't remove those players. Try again.",
      );
      if (message) showError(message);
    }
  };

  return (
    <div className="flex flex-col items-center p-4 bg-gray-100 min-h-screen">
      {/* League Title */}
      <h1 className="text-2xl font-semibold text-center">
        {league?.name} - League Admin
      </h1>

      {/* League Code */}
      <div className="w-full max-w-xl mt-6">
        <p className="text-gray-700 mb-1">
          Invite your friends to join the fun! Share this league code and
          compete together.
        </p>
        <h3 className="text-lg font-medium">
          League Code: <span className="font-semibold">{league?.code}</span>
        </h3>
      </div>

      {/* Change League Name */}
      <div className="w-full max-w-xl mt-6">
        <h3 className="text-xl font-semibold mb-2">Change League Name</h3>
        <FormControl fullWidth required>
          <Input
            type="text"
            name="leagueName"
            placeholder="Enter new league name"
            value={leagueName}
            onChange={(e) => setLeagueName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-2xl bg-white"
          />
        </FormControl>
        <button
          className="w-full md:w-1/2 text-lg bg-colors-nba-yellow hover:opacity-80 py-2 rounded-lg text-black shadow-md font-semibold mt-4"
          onClick={handleUpdateLeagueName}
        >
          Change Name
        </button>
      </div>

      {/* Remove Players */}
      <div className="w-full max-w-xl mt-8">
        <h3 className="text-xl font-semibold mb-2">Remove Players</h3>
        <p className="text-gray-600 mb-2">
          Search for the player you wish to remove from this league.
        </p>
        <Autocomplete
          multiple
          options={users.filter((user) => user.id !== league?.admin?.id)}
          disableCloseOnSelect
          getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
          value={selectedUsers}
          onChange={(event, newValues) => {
            event.preventDefault();
            setSelectedUsers(newValues);
          }}
          renderOption={(props, option, { selected }) => (
            <li {...props} key={option.id}>
              <Checkbox checked={selected} />
              {`${option.firstName} ${option.lastName}`}
            </li>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              margin="normal"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "1rem" } }}
              label="Search Users"
            />
          )}
        />
        <button
          className="w-full md:w-1/2 text-lg mt-4 bg-colors-nba-yellow hover:opacity-80 py-2 rounded-lg text-black shadow-md font-semibold"
          onClick={handleRemoveUsers}
        >
          Remove Selected Users
        </button>
      </div>

      {/* Delete League */}
      <div className="w-full max-w-xl mt-10">
        <h3 className="text-xl font-semibold mb-2 text-colors-nba-red">
          Delete League
        </h3>
        <p className="text-gray-600 mb-4">
          To delete the league, click the button below. Players will remain in
          the system and can join other leagues.
        </p>
        <button
          className="w-full md:w-1/2 text-lg bg-colors-nba-red hover:opacity-80 py-2 rounded-lg text-white shadow-md font-semibold"
          onClick={handleDeleteLeague}
        >
          Delete League
        </button>
      </div>
    </div>
  );
};

export default ManageLeague;
