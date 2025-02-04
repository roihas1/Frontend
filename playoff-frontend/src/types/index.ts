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
  export enum PlayerMatchupType {
    UNDEROVER = "UNDER/OVER",
    PLAYERMATCHUP = "PLAYERMATCHUP",
  }
  
  // Enum for matchup categories
  export enum MatchupCategory {
    POINTS = "Points",
    REBOUNDS = "Rebounds",
    ASSISTS = "Assists",
    STEALS = "Steals",
    BLOCKS = "Blocks",
    THREE_POINT_SHOTS_MADE = "3-Point Shots Made",
    TURNOVERS = "Turnovers",
  }
  export const nbaTeamsList = [
    { teamName: "Atlanta Hawks", conference: "East" },
    { teamName: "Boston Celtics", conference: "East" },
    { teamName: "Brooklyn Nets", conference: "East" },
    { teamName: "Charlotte Hornets", conference: "East" },
    { teamName: "Chicago Bulls", conference: "East" },
    { teamName: "Cleveland Cavaliers", conference: "East" },
    { teamName: "Dallas Mavericks", conference: "West" },
    { teamName: "Denver Nuggets", conference: "West" },
    { teamName: "Detroit Pistons", conference: "East" },
    { teamName: "Golden State Warriors", conference: "West" },
    { teamName: "Houston Rockets", conference: "West" },
    { teamName: "Indiana Pacers", conference: "East" },
    { teamName: "Los Angeles Clippers", conference: "West" },
    { teamName: "Los Angeles Lakers", conference: "West" },
    { teamName: "Memphis Grizzlies", conference: "West" },
    { teamName: "Miami Heat", conference: "East" },
    { teamName: "Milwaukee Bucks", conference: "East" },
    { teamName: "Minnesota Timberwolves", conference: "West" },
    { teamName: "New Orleans Pelicans", conference: "West" },
    { teamName: "New York Knicks", conference: "East" },
    { teamName: "Oklahoma City Thunder", conference: "West" },
    { teamName: "Orlando Magic", conference: "East" },
    { teamName: "Phoenix Suns", conference: "West" },
    { teamName: "Philadelphia 76ers", conference: "East" },
    { teamName: "Portland Trail Blazers", conference: "West" },
    { teamName: "Sacramento Kings", conference: "West" },
    { teamName: "San Antonio Spurs", conference: "West" },
    { teamName: "Toronto Raptors", conference: "East" },
    { teamName: "Utah Jazz", conference: "West" },
    { teamName: "Washington Wizards", conference: "East" },
  ];