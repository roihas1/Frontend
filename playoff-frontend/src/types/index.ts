// src/types/index.ts
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
export interface Guess {
    id: string;
    guess: number;
    createdById: string;
}
export interface BestOf7Bet {
    id: string;
    fantasyPoints: number;
    seriesScore: number[];
    result: number;
    guesses: Guess[];
  }
  
  export interface TeamWinBet {
    id: string;
    fantasyPoints: number;
    result: number;
    guesses: Guess[];
  }
  
  export interface PlayerMatchupBet {
    id: string;
    typeOfMatchup: string;
    categories: string[];
    fantasyPoints: number;
    player1: string;
    player2: string;
    differential: number;
    result: number | null;
    currentStats: number[];
    guesses: Guess[];
  }
  
  export interface SeriesBets {
    team1: string;
    team2: string;
    round: string;
    conference: "West"|"East"|"Finals"
    startDate: Date;
    bestOf7Bet: BestOf7Bet;
    teamWinBet: TeamWinBet;
    playerMatchupBets: PlayerMatchupBet[];
  }
  
  export interface AllSeriesBets {
    [key: string]: SeriesBets;
  }
  
  export interface BestOf7Guess {
    id: string;
    guess: number;
    createdById: string;
  }
  
  export interface TeamWinGuess {
    id: string;
    guess: number;
    createdById: string;
  }
  
  export interface PlayerMatchupGuess {
    id: string;
    guess: number;
    createdById: string;
  }
  
  export interface User {
    id: string;
    username: string;
    fantasyPoints: number;
    role: string;
    firstName: string;
    lastName: string;
    email: string;
    isActive: boolean;
    bestOf7Guesses: BestOf7Guess[];
    teamWinGuesses: TeamWinGuess[];
    playerMatchupGuesses: PlayerMatchupGuess[];
  }
  
  export const checkTokenExpiration = () => {
    
    const tokenExpiry = Cookies.get("tokenExpiry");
    if (tokenExpiry && Date.now() > parseInt(tokenExpiry)) {
      // Token has expired
      Cookies.remove("token");
      Cookies.remove("tokenExpiry");

      alert("Your session has expired. Please log in again.");
      
      handleLogout();
       // Redirect to login page
    }
  };
  export const handleLogout = async () => {
    try {
      await axiosInstance.patch("/auth/logout", {
        username: localStorage.getItem("username"),
      });
      Cookies.remove("token");
      Cookies.remove("tokenExpiry");
      localStorage.removeItem('username');
      localStorage.removeItem('role');
      localStorage.removeItem('token');
      
      window.location.href = '/login';
    } catch (error) {
      alert("Failed to logout.Please try again later.");
    }
  };