// import { useState } from 'react'

import "./App.css";
import { BrowserRouter as Router, Route, Routes, useNavigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import { ErrorProvider, useError } from "./components/ErrorProvider";
import Navbar from "./components/NavBar";
import HomePage from "./pages/HomePage";
import { SuccessMessageProvider } from "./components/successMassageProvider";
import { UserProvider } from "./components/userContext";
import UpdateBetsPage from "./pages/UpdateBetsPage";
// import PageBackground from "./components/Layout/PageBackground";
// import NBALogo from "./assets/NBALogo.jpg";
import LeaguesPage from "./pages/LeaguesPage";
import WelcomePage from "./pages/WelcomePage";
import Footer from "./components/Layout/Footer";
import ComparingPage from "./pages/ComparingPage";
import PageBackground from "./components/Layout/PageBackground";
import Logo from '../src/assets/export/gray_only_ball.png'
import HowToPlayPage from "./pages/HowToPlayPage";
import OAuthRedirectPage from "./pages/OauthRedirectPage";



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
                <Route path='/' element= {<WelcomePage/>}/>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path='/updateBets' element={<UpdateBetsPage />} />
                <Route path="/leagues" element={<LeaguesPage/>}/>
                <Route path="/comparing" element= {<ComparingPage/>} />
                <Route path="/HowtoPlay" element={<HowToPlayPage/>}/>
                <Route path='/redirect' element={<OAuthRedirectPage/>}/>
              </Routes>
              </main>
              <Footer/>
            </div>
            
          </UserProvider>
        </SuccessMessageProvider>
      </ErrorProvider>
    </Router>
  );
}

export default App;
