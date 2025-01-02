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

function App() {
  // const location = useLocation();
  // const excludeNavBar =
  //   location.pathname === "/" || location.pathname === "/signup";
  return (
    <Router>
      <ErrorProvider>
        <SuccessMessageProvider>
          <UserProvider>
            <div className="flex flex-col min-h-screen overflow-auto bg-gray-100">
              <Navbar />
              <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path='/updateBets' element={<UpdateBetsPage />} />
              </Routes>
            </div>
          </UserProvider>
        </SuccessMessageProvider>
      </ErrorProvider>
    </Router>
  );
}

export default App;
