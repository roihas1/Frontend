// import { useState } from 'react'

import "./App.css";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import {
  ErrorProvider,
  useError,
} from "./components/providers&context/ErrorProvider";
import Navbar from "./components/Layout/NavBar";
import HomePage from "./pages/HomePage";
import { SuccessMessageProvider } from "./components/providers&context/successMassageProvider";
import { UserProvider } from "./components/providers&context/userContext";
import UpdateBetsPage from "./pages/UpdateBetsPage";
// import PageBackground from "./components/Layout/PageBackground";

import LeaguesPage from "./pages/LeaguesPage";
import WelcomePage from "./pages/WelcomePage";
import Footer from "./components/common/Footer";
import ComparingPage from "./pages/ComparingPage";
import PageBackground from "./components/common/PageBackground";
import Logo from "../src/assets/siteLogo/gray_only_ball.png";
import HowToPlayPage from "./pages/HowToPlayPage";
import OAuthRedirectPage from "./pages/OauthRedirectPage";
import LeaguesSelectionPage from "./pages/LeagueSelectionPage";
import ManageLeague from "./pages/ManageLeaguePage";

function App() {
  return (
    <Router>
      <ErrorProvider>
        <SuccessMessageProvider>
          <UserProvider>
            {/* <PageBackground imageSrc={Logo}/> */}
            <div className="flex flex-col min-h-screen   bg-gray-100">
              <Navbar />
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
                  <Route path="/HowtoPlay" element={<HowToPlayPage />} />
                  <Route path="/redirect" element={<OAuthRedirectPage />} />
                  <Route path="/manageLeague" element={<ManageLeague />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </UserProvider>
        </SuccessMessageProvider>
      </ErrorProvider>
    </Router>
  );
}

export default App;
