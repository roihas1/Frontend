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
import { useError } from "../components/providers&context/ErrorProvider";
import { useSuccessMessage } from "../components/providers&context/successMassageProvider";
import { League } from "./LeagueSelectionPage";

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
      } catch {
        showError(`Failed to get users.`);
      }
    };

    settingLeague();
    if (league) {
      fetchLeagueUsers();
    }
  }, [league]);
  const handleUpdateLeagueName = async () => {
    try {
      console.log("in handle update league name");
      await axiosInstance.patch(
        `/private-league/${league?.id}/${leagueName}/updateName`
      );
      if (league) league.name = leagueName;
      setLeagueName("");

      showSuccessMessage(`League name changed to ${leagueName}`);
    } catch  {
      showError(`Failed to update league name.`);
    }
  };
  const handleDeleteLeague = async () => {
    try {
      await axiosInstance.delete(`/private-league/${league?.id}`);
      showSuccessMessage(`League was deleted.`);
      navigate("/leagues");
    } catch {
      showError(`Failed to delete league ${league?.name}`);
    }
  };
  const handleRemoveUsers = async () => {
    try {
      await axiosInstance.patch(`/private-league/${league?.id}/removeUsers`, {
        users: selectedUsers,
      });

      setSelectedUsers([]);
      showSuccessMessage(
        `Selected users was removed from league ${league?.name}`
      );
    } catch (error) {
      showError(`Failed to remove users.`);
    }
  };

  return (
    <div className="flex flex-col items-center p-4 bg-gray-100 ">
      <h1 className="text-2xl font-semibold">
        League Administer - {league?.name}
      </h1>
      <div className="w-1/3 mt-12">
        <h3 className="flex justify-start">
          {" "}
          <strong className="mr-2">League code: </strong>
          {"   "} {league?.code}
        </h3>
      </div>
      <div className="w-1/3 ">
        <h3 className="flex justify-start text-xl mt-8 font-semibold">
          Change league name
        </h3>
        <FormControl fullWidth required>
          <Input
            type="text"
            name="leagueName"
            placeholder="League name"
            value={leagueName}
            onChange={(e) => setLeagueName(e.target.value)}
            className="w-full p-3 mb-6 border border-gray-300 rounded-2xl mt-2 bg-white"
          ></Input>
        </FormControl>
        <button
          className=" w-1/2 text-xl bg-colors-nba-yellow hover:opacity-80 p-2 rounded-lg text-black shadow-md font-semibold"
          onClick={() => handleUpdateLeagueName()}
        >
          Change Name
        </button>
      </div>
      <div className="w-1/3 mt-6">
        <h3 className="flex justify-start text-xl mb-4 font-semibold">
          Remove Players
        </h3>
        <p className="">
          Search for the player you wish to suspend from this league.
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
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "1rem",
                },
              }}
              label="Search Users"
            />
          )}
        />
        <button
          className=" w-1/2 text-xl mt-4 bg-colors-nba-yellow hover:opacity-80 p-2 rounded-lg text-black shadow-md font-semibold"
          onClick={() => handleRemoveUsers()}
        >
          Update League
        </button>
      </div>
      <div className="w-1/3">
        <h3 className="flex justify-start text-xl mt-10 mb-4 font-semibold">
          Delete League
        </h3>
        <p className="mb-4">
          To delete the league, click on the button below. The players entered
          in the league will still exist and can enter other leagues if desired.
        </p>
        <button
          className=" w-1/2 text-xl bg-colors-nba-yellow hover:opacity-80 p-2 rounded-lg text-black shadow-md font-semibold"
          onClick={() => handleDeleteLeague()}
        >
          Delete League
        </button>
      </div>
    </div>
  );
};
export default ManageLeague;
