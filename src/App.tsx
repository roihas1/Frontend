// import { useState } from 'react'
import "./App.css";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import { ErrorProvider } from "./components/providers&context/ErrorProvider";
import Navbar from "./components/Layout/NavBar";
import HomePage from "./pages/HomePage";
import { SuccessMessageProvider } from "./components/providers&context/successMassageProvider";
import { UserProvider } from "./components/providers&context/userContext";
import UpdateBetsPage from "./pages/UpdateBetsPage";
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
import { TournamentProvider } from "./components/providers&context/TournamentContext";
import { LeagueStandingsPreviewProvider } from "./components/providers&context/LeagueStandingsPreviewContext";
import InstallAppButton from "./components/pwa/InstallAppButton";
import HomeLeagueStandingsPreview from "./components/forPages/HomeLeagueStandingsPreview";
import MaintenancePage from "./pages/MaintenancePage";

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

  return (
    <MissingBetsProvider>
      {/* <PageBackground imageSrc={Logo}/> */}
      <div className="flex flex-col min-h-screen   bg-gray-100">
        <Navbar />
        {pathname === "/home" && (
          <div className="md:hidden px-4 mt-1">
            <HomeLeagueStandingsPreview variant="mobile" />
          </div>
        )}
        <main className="flex-grow  p-4">
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/updateBets" element={<UpdateBetsPage />} />
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
          </Routes>
        </main>
        <Footer />
        <InstallAppButton />
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
      <ErrorProvider>
        <SuccessMessageProvider>
          <UserProvider>
            <AuthProvider>
              <TournamentProvider>
                <LeagueStandingsPreviewProvider>
                  <AppShell />
                </LeagueStandingsPreviewProvider>
              </TournamentProvider>
            </AuthProvider>
          </UserProvider>
        </SuccessMessageProvider>
      </ErrorProvider>
    </Router>
  );
}

export default App;
