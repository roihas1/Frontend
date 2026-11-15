import { useLocation } from "react-router-dom";
import { useAuth } from "../components/providers&context/AuthContext";
import { HIDDEN_BOTTOM_NAV_ROUTES } from "../components/Layout/navConfig";

export const useShowBottomNav = (): boolean => {
  const { pathname } = useLocation();
  const { isLoggedIn } = useAuth();

  return isLoggedIn && !HIDDEN_BOTTOM_NAV_ROUTES.includes(pathname);
};
