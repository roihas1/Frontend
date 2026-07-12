// src/types/index.ts


export interface Guess {
    id: string;
    guess: number;
    createdById: string;
}

export interface TeamRelation {
  id: string;
  name: string;
  abbreviation: string;
}

export interface PlayoffTournament {
  id: string;
  sportType: string;
  year: number;
  name: string;
}

export interface CreateTournamentDto {
  sportType: string;
  year: number;
  name: string;
}

export interface BestOf7Bet {
    id: string;
    fantasyPoints: number;
    seriesScore: number[];
    result: number;
    guesses?: Guess[];
    seriesId?: string;
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
    seriesId: string;
    categories: MatchupCategory[];
    fantasyPoints: number;
    player1: string;
    player2: string;
    differential: number;
    result: number | null;
    currentStats: number[];
    playerGames: number[];
    guesses?: Guess[];
  }
  

  export interface SpontaneousBet extends PlayerMatchupBet {
    startTime?: Date | string; 
    gameNumber?: number;
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
    spontaneousBets: SpontaneousBet[];
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
    championPoints:number;
    role: string;
    firstName: string;
    lastName: string;
    email: string;
    isActive: boolean;
    bestOf7Guesses: BestOf7Guess[];
    teamWinGuesses: TeamWinGuess[];
    playerMatchupGuesses: PlayerMatchupGuess[];
  }

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
    DOUBLE_DOUBLE = 'Double Double',
    TRIPLE_DOUBLE = 'Triple Double',
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

/** From GET /home-page/load → `leagueStandingsPreview` */
export interface LeagueStandingsPreviewGlobal {
  position: number;
  totalPoints: number;
  /** e.g. "Global" */
  label?: string;
}

export interface LeagueStandingsPreviewPrivateRow {
  id: string;
  name: string;
  position: number;
  totalPoints: number;
}

export interface LeagueStandingsPreviewData {
  global: LeagueStandingsPreviewGlobal;
  privateLeagues: LeagueStandingsPreviewPrivateRow[];
}

export interface LeagueMessage {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface JoinLeagueRequest {
  code: string;
  tournamentId?: string;
}

export interface CreatePrivateLeagueRequest {
  name: string;
  tournamentId?: string;
}

export interface LeagueMemberRef {
  id: string;
}

export interface RemoveUsersRequest {
  users: LeagueMemberRef[];
  tournamentId?: string;
}

export interface CreateLeagueMessageRequest {
  content: string;
  tournamentId?: string;
}