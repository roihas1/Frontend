import { useCallback, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { getErrorMessage } from "../../api/getErrorMessage";
import { completeLoginSession } from "../../auth/completeLoginSession";
import { useAuth } from "../../components/providers&context/AuthContext";
import { useError, useSuccessMessage } from "../../components/providers&context/NotificationProvider";
import { useTournament } from "../../components/providers&context/TournamentContext";
import { League } from "../LeagueSelectionPage";
import {
  UpdateMyProfileResponse,
  UpdateProfilePayload,
  UserProfile,
} from "../../types";

export function useAccountPageModel() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const { showError } = useError();
  const { showSuccessMessage } = useSuccessMessage();
  const { selectedTournamentId } = useTournament();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login", { replace: true });
    }
  }, [isLoggedIn, navigate]);

  const profileQuery = useQuery({
    queryKey: ["me"],
    queryFn: async (): Promise<UserProfile> => {
      const response = await axiosInstance.get<UserProfile>("/auth/me");
      return response.data;
    },
    enabled: isLoggedIn,
    staleTime: 60 * 1000,
    meta: { errorMessage: "Couldn't load your profile. Try again." },
  });

  const leaguesQuery = useQuery<League[]>({
    queryKey: ["private-leagues", selectedTournamentId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/private-league`);
      return response.data;
    },
    enabled: isLoggedIn && !!selectedTournamentId,
    staleTime: 3 * 60 * 1000,
    gcTime: 3 * 60 * 1000,
    meta: { errorMessage: "Couldn't load your leagues. Try again." },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => {
      const response = await axiosInstance.patch<UpdateMyProfileResponse>(
        "/auth/me",
        payload,
      );
      return response.data;
    },
    onSuccess: (data) => {
      if (data.accessToken && data.expiresIn != null) {
        completeLoginSession({
          accessToken: data.accessToken,
          expiresIn: data.expiresIn,
          username: data.profile.username,
          userRole: data.profile.role,
        });
      }
      queryClient.setQueryData(["me"], data.profile);
      void queryClient.invalidateQueries({ queryKey: ["me"] });
      void queryClient.invalidateQueries({ queryKey: ["auth/standings"] });
      void queryClient.invalidateQueries({
        queryKey: ["overall-league", selectedTournamentId],
      });
      showSuccessMessage("Profile updated.");
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        return;
      }
      const message = getErrorMessage(
        error,
        "Couldn't update your profile. Try again.",
      );
      if (message) showError(message);
    },
  });

  const checkUsernameAvailable = useCallback(
    async (username: string): Promise<boolean> => {
      const response = await axiosInstance.get<{ available: boolean }>(
        "/auth/me/username-available",
        { params: { username: username.trim() } },
      );
      return response.data.available;
    },
    [],
  );

  const changePasswordMutation = useMutation({
    mutationFn: async (payload: {
      currentPassword?: string;
      newPassword: string;
    }) => {
      await axiosInstance.patch("/auth/me/password", payload);
    },
    onSuccess: () => {
      showSuccessMessage("Password updated.");
      void queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(
        error,
        "Couldn't update your password. Try again.",
      );
      if (message) showError(message);
    },
  });

  const leaveLeagueMutation = useMutation({
    mutationFn: async (leagueId: string) => {
      await axiosInstance.patch(
        `/private-league/${leagueId}/leaveLeague`,
      );
    },
    onSuccess: () => {
      showSuccessMessage("You left the league.");
      void queryClient.invalidateQueries({
        queryKey: ["private-leagues", selectedTournamentId],
      });
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(
        error,
        "Couldn't leave the league. Try again.",
      );
      if (message) showError(message);
    },
  });

  const handleManageLeague = useCallback(
    (league: League) => {
      navigate("/manageLeague", { state: { league } });
    },
    [navigate],
  );

  const loading =
    !isLoggedIn ||
    profileQuery.isLoading ||
    (profileQuery.isFetching && !profileQuery.data);

  return {
    profile: profileQuery.data ?? null,
    leagues: leaguesQuery.data ?? [],
    leaguesLoading: leaguesQuery.isLoading,
    loading,
    updateProfile: updateProfileMutation.mutateAsync,
    checkUsernameAvailable,
    isUpdatingProfile: updateProfileMutation.isPending,
    changePassword: changePasswordMutation.mutateAsync,
    isChangingPassword: changePasswordMutation.isPending,
    leaveLeague: leaveLeagueMutation.mutateAsync,
    isLeavingLeague: leaveLeagueMutation.isPending,
    handleManageLeague,
  };
}

export type AccountPageModel = ReturnType<typeof useAccountPageModel>;
