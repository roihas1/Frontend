// import { useState } from 'react'
import "./App.css";
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import { NotificationProvider } from "./components/providers&context/NotificationProvider";
import Navbar from "./components/Layout/NavBar";
import HomePage from "./pages/HomePage";
import { UserProvider } from "./components/providers&context/userContext";
import LeaguesPage from "./pages/LeaguesPage";
import WelcomePage from "./pages/WelcomePage";
import Footer from "./components/common/Footer";
import ComparingPage from "./pages/ComparingPage";
import HowToPlayPage from "./pages/HowToPlayPage";
import OAuthRedirectPage from "./pages/OauthRedirectPage";
import LeaguesSelectionPage from "./pages/LeagueSelectionPage";
import ManageLeague from "./pages/ManageLeaguePage";
import { AuthProvider } from "./components/providers&context/AuthContext";
import { MissingBetsProvider } from "./components/providers&context/MissingBetsContext";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfUsePage from "./pages/TermsOfUsePage";
import AboutUsPage from "./pages/AboutUsPage";
import GuessStatsPage from "./pages/GuessStatsPage";
import AccountPage from "./pages/AccountPage";
import AdminPage from "./pages/AdminPage";
import AdminHubView from "./pages/admin/AdminHubView";
import AdminSetupPage from "./pages/admin/AdminSetupPage";
import ChampionsClosePage from "./pages/admin/ChampionsClosePage";
import SeriesWorkbenchPage from "./pages/admin/SeriesWorkbenchPage";
import RequireAdmin from "./components/common/RequireAdmin";
import { TournamentProvider } from "./components/providers&context/TournamentContext";
import { LeagueStandingsPreviewProvider } from "./components/providers&context/LeagueStandingsPreviewContext";
import InstallAppButton from "./components/pwa/InstallAppButton";
import HomeLeagueStandingsPreview from "./components/forPages/HomeLeagueStandingsPreview";
import MaintenancePage from "./pages/MaintenancePage";
import BottomNav from "./components/Layout/BottomNav";
import { useShowBottomNav } from "./hooks/useShowBottomNav";

const MAINTENANCE_BYPASS_KEY = "btb_bypass_maintenance";

function shouldBypassMaintenance(): boolean {
  const params = new URLSearchParams(window.location.search);
  if (params.has("preview")) {
    sessionStorage.setItem(MAINTENANCE_BYPASS_KEY, "1");
    return true;
  }
  return sessionStorage.getItem(MAINTENANCE_BYPASS_KEY) === "1";
}

function AppShell() {
  const { pathname } = useLocation();
  const showBottomNav = useShowBottomNav();

  return (
    <MissingBetsProvider>
      {/* <PageBackground imageSrc={Logo}/> */}
      <div
        className={`flex flex-col min-h-screen bg-gray-100 ${
          showBottomNav ? "pb-nav-offset xl:pb-0" : ""
        }`}
      >
        <Navbar />
        {pathname === "/home" && (
          <div className="md:hidden mt-1">
            <HomeLeagueStandingsPreview variant="mobile" />
          </div>
        )}
        <main className="flex-grow  p-4">
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/updateBets" element={<Navigate to="/admin" replace />} />
            <Route
              path="/admin"
              element={
                <RequireAdmin>
                  <AdminPage />
                </RequireAdmin>
              }
            >
              <Route index element={<AdminHubView />} />
              <Route path="series" element={<SeriesWorkbenchPage />} />
              <Route
                path="series/:seriesId/:tab"
                element={<SeriesWorkbenchPage />}
              />
              <Route path="setup" element={<AdminSetupPage />} />
              <Route path="champions" element={<ChampionsClosePage />} />
            </Route>
            <Route path="/leagues" element={<LeaguesSelectionPage />} />
            <Route path="/league" element={<LeaguesPage />} />
            <Route path="/comparing" element={<ComparingPage />} />
            <Route path="/guess-stats" element={<GuessStatsPage />} />
            <Route path="/HowtoPlay" element={<HowToPlayPage />} />
            <Route path="/redirect" element={<OAuthRedirectPage />} />
            <Route path="/manageLeague" element={<ManageLeague />} />
            <Route path="/privacyPolicy" element={<PrivacyPolicyPage />} />
            <Route path="/TermsOfuse" element={<TermsOfUsePage />} />
            <Route path="/AboutUs" element={<AboutUsPage />} />
            <Route path="/account" element={<AccountPage />} />
          </Routes>
        </main>
        <Footer />
        <InstallAppButton />
        <BottomNav />
      </div>
    </MissingBetsProvider>
  );
}

function App() {
  const isMaintenance =
    window.RUNTIME_CONFIG?.MAINTENANCE_MODE === "true";

  if (isMaintenance && !shouldBypassMaintenance()) {
    return <MaintenancePage />;
  }

  return (
    <Router>
      <NotificationProvider>
        <UserProvider>
          <AuthProvider>
            <TournamentProvider>
              <LeagueStandingsPreviewProvider>
                <AppShell />
              </LeagueStandingsPreviewProvider>
            </TournamentProvider>
          </AuthProvider>
        </UserProvider>
      </NotificationProvider>
    </Router>
  );
}

export default App;
