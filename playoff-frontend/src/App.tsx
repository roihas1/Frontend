// import { useState } from 'react'

import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import { ErrorProvider } from "./components/ErrorProvider";
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


function App() {
 
  return (
    <Router>
      <ErrorProvider>
        <SuccessMessageProvider>
          <UserProvider>
          {/* <PageBackground imageSrc={NBALogo}/> */}
            <div className="flex flex-col min-h-screen p-2 overflow-auto bg-gray-100">
              
              <Navbar />
              <main className="flex-1 p-4">
              <Routes>
                <Route path='/' element= {<WelcomePage/>}/>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path='/updateBets' element={<UpdateBetsPage />} />
                <Route path="/leagues" element={<LeaguesPage/>}/>
                <Route path="/comparing" element= {<ComparingPage/>} />
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
