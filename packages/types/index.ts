// Blog and Video Types
export interface BlogPost {
  _id: string;
  title: string;
  excerpt: string;
  content?: string;
  image: string;
  author: string;
  readTime: number;
  createdAt: string;
  category: string;
}

export interface VideoHighlight {
  id: string;
  title: string;
  thumbnail: string;
  views: number;
  duration: string;
  createdAt: string;
  teams: string[];
  description?: string;
}

// Football Types
export interface Team {
  id: number;
  name: string;
  logo: string;
  winner?: boolean | null;
}

export interface League {
  id: number;
  name: string;
  country: string;
  logo: string;
  flag: string;
  season: number;
  round?: string;
}

export interface Score {
  halftime: { home: number | null; away: number | null };
  fulltime: { home: number | null; away: number | null };
  extratime: { home: number | null; away: number | null };
  penalty: { home: number | null; away: number | null };
}

export interface Fixture {
  fixture: {
    id: number;
    referee: string | null;
    timezone: string;
    date: string;
    timestamp: number;
    venue: {
      id: number | null;
      name: string | null;
      city: string | null;
    };
    status: {
      long: string;
      short: string;
      elapsed: number | null;
    };
  };
  league: League;
  teams: {
    home: Team;
    away: Team;
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score: Score;
}

export interface Standing {
  rank: number;
  team: Team;
  points: number;
  goalsDiff: number;
  group: string;
  form: string;
  status: string;
  description: string | null;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
  home: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
  away: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
  update: string;
}

export interface MatchEvent {
  time: {
    elapsed: number;
    extra: number | null;
  };
  team: Team;
  player: {
    id: number;
    name: string;
  };
  assist: {
    id: number | null;
    name: string | null;
  };
  type: string;
  detail: string;
  comments: string | null;
}

export interface LineupPlayer {
  player: {
    id: number;
    name: string;
    number: number;
    pos: string;
    grid: string | null;
  };
}

export interface Lineup {
  team: Team;
  formation: string;
  startXI: LineupPlayer[];
  substitutes: LineupPlayer[];
  coach: {
    id: number;
    name: string;
    photo: string;
  };
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export type SportType = 'football' | 'cricket' | 'tennis' | 'basketball' | 'baseball' | 'hockey';
