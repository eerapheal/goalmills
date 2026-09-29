/**
 * GoalMills Football Competition Architecture & Data Models
 * Canonical types, enums, and interfaces for multi-tier football taxonomy.
 */

// ── Controlled Enums & Scalar Types ──────────────────────────────────────────

export type CompetitionGender = 'MALE' | 'FEMALE' | 'MIXED' | 'UNKNOWN';

export type CompetitionAgeCategory =
  | 'U15'
  | 'U16'
  | 'U17'
  | 'U18'
  | 'U19'
  | 'U20'
  | 'U21'
  | 'U23'
  | 'SENIOR'
  | 'ALL_AGES';

export type CompetitionType =
  | 'LEAGUE'
  | 'CUP'
  | 'SUPER_CUP'
  | 'CHAMPIONSHIP'
  | 'QUALIFIER'
  | 'TOURNAMENT'
  | 'NATIONS_LEAGUE'
  | 'WORLD_CUP'
  | 'CONTINENTAL_CLUB'
  | 'CONTINENTAL_NATIONAL'
  | 'FRIENDLY'
  | 'OTHER';

export type CompetitionLevel =
  | 'GLOBAL'
  | 'CONFEDERATION'
  | 'NATIONAL'
  | 'DOMESTIC'
  | 'REGIONAL';

export type CompetitionTier = 1 | 2 | 3 | 4 | 5 | 6;

export type ConfederationCode =
  | 'FIFA'
  | 'UEFA'
  | 'CAF'
  | 'AFC'
  | 'CONMEBOL'
  | 'CONCACAF'
  | 'OFC';

export type CompetitionStatus =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'ARCHIVED'
  | 'PROVIDER_UNAVAILABLE'
  | 'PENDING_VERIFICATION';

export type FixtureClassificationStatus =
  | 'RESOLVED'
  | 'UNRESOLVED'
  | 'LOW_CONFIDENCE'
  | 'QUARANTINED';

// ── Canonical Competition ────────────────────────────────────────────────────

export interface CanonicalCompetition {
  /** GoalMills canonical ID, e.g. "ENG-PREMIER-LEAGUE" */
  id: string;

  /** AllSportsAPI league_key (0 or -1 if provider unavailable) */
  providerId: number;
  providerName: 'allsportsapi';

  /** API-Football league ID (for logos/alternative provider) */
  apiSportsId?: number;

  /** URL slug, e.g. "premier-league" */
  slug: string;

  /** Full display name */
  name: string;

  /** Abbreviated name for UI chips */
  shortName: string;

  /** Country ISO 3166-1 alpha-2 / FIFA code, e.g. "GB-ENG" */
  countryCode: string;
  countryName: string;

  /** Confederation membership */
  confederationCode: ConfederationCode;

  sport: 'football';
  gender: CompetitionGender;
  ageCategory: CompetitionAgeCategory;
  competitionType: CompetitionType;
  level: CompetitionLevel;
  tier: CompetitionTier;

  season: string;
  status: CompetitionStatus;

  // Classification booleans for high-speed deterministic filtering
  isDomestic: boolean;
  isContinental: boolean;
  isInternational: boolean;
  isNationalTeam: boolean;
  isYouth: boolean;
  isSenior: boolean;
  isWomens: boolean;
  isMens: boolean;

  // Display & SEO
  isFeatured: boolean;
  isIndexable: boolean;
  priorityRank: number;
  displayOrder: number;

  // Media
  logoUrl: string;
  countryFlagUrl: string;

  // SEO
  canonicalSlug: string;

  // Hierarchy
  parentCompetitionId?: string;

  createdAt: string;
  updatedAt: string;
}

// ── Normalized Fixture ───────────────────────────────────────────────────────

export interface NormalizedFixture {
  /** GoalMills internal fixture ID */
  fixtureId: string;

  /** Provider's original fixture ID */
  providerFixtureId: string;

  /** GoalMills canonical competition ID */
  competitionId: string;

  seasonId: string;

  homeTeamId: string;
  homeTeamName: string;
  homeTeamLogo: string;

  awayTeamId: string;
  awayTeamName: string;
  awayTeamLogo: string;

  countryCode: string;
  confederationCode: ConfederationCode;

  gender: CompetitionGender;
  ageCategory: CompetitionAgeCategory;

  status: string;
  classificationStatus: FixtureClassificationStatus;

  scheduledAt: string;
  startedAt?: string;
  finishedAt?: string;

  homeScore?: number;
  awayScore?: number;
  htHomeScore?: number;
  htAwayScore?: number;
  penaltyResult?: string;

  round?: string;
  stage?: string;
  group?: string;
  venue?: string;
  referee?: string;

  priorityRank: number;
  isFeatured: boolean;
  lastUpdatedAt: string;

  /** Original provider data preserved for backward compatibility */
  _raw?: Record<string, unknown>;
}

// ── Country & Confederation Hierarchy ────────────────────────────────────────

export interface CountryRecord {
  code: string; // ISO alpha-2 or internal code (e.g., "NG", "GB-ENG")
  name: string;
  confederationCode: ConfederationCode;
  flagUrl: string;
  priorityRank: number;
  isFeatured: boolean;
  /** Priority domestic competition IDs */
  priorityCompetitions: string[];
}

export interface ConfederationRecord {
  code: ConfederationCode;
  name: string;
  slug: string;
  logoUrl: string;
  displayOrder: number;
}

// ── Priority Club Model ──────────────────────────────────────────────────────

export interface PriorityClub {
  id: string;
  providerId: string;
  providerName: 'allsportsapi';
  name: string;
  shortName: string;
  slug: string;

  competitionId: string;
  countryCode: string;
  confederationCode: ConfederationCode;

  logoUrl: string;
  stadium?: string;
  founded?: number;

  globalRank: number;
  countryRank: number;
  competitionRank: number;
  continentalPriority: number;

  isFeatured: boolean;
  isPopular: boolean;
  isAfrican: boolean;
  isNationalTeam: boolean;
  isWomens: boolean;

  priorityRank: number;
}

// ── Africa Priority Registry Model ───────────────────────────────────────────

export interface AfricaPriorityEntry {
  countryCode: string;
  countryName: string;
  competitionId: string;
  competitionName: string;
  tier: CompetitionTier;
  gender: CompetitionGender;
  ageCategory: CompetitionAgeCategory;
  priorityRank: number;
  providerId: number;
  isActive: boolean;
}

// ── Filter and Sort Types ────────────────────────────────────────────────────

export interface FixtureFilterCriteria {
  competitionId?: string;
  countryCode?: string;
  confederationCode?: ConfederationCode;
  gender?: CompetitionGender;
  isLive?: boolean;
  date?: string;
  status?: string;
}

export type CompetitionSortOption = 'priority' | 'name' | 'tier' | 'country';

// ── Competition Format & Standings Engine Types (Phase 1) ───────────────────

export type CompetitionFormatType =
  | 'LEAGUE'
  | 'GROUP_STAGE'
  | 'LEAGUE_PHASE'
  | 'KNOCKOUT'
  | 'HYBRID'
  | 'ROUND_ROBIN'
  | 'QUALIFICATION'
  | 'PLAYOFF';

export type StageType =
  | 'LEAGUE'
  | 'GROUP_STAGE'
  | 'LEAGUE_PHASE'
  | 'KNOCKOUT'
  | 'QUALIFICATION'
  | 'PLAYOFF'
  | 'ROUND_ROBIN';

export type StageStatus = 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface StageGroupSummary {
  id: string;
  stageId: string;
  name: string;
  shortName: string;
  slug: string;
  displayOrder: number;
  status: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED';
  teamsCount?: number;
  advancingTeamsCount?: number;
}

export interface StageKnockoutRoundSummary {
  id: string;
  stageId: string;
  name: string;
  slug: string;
  order: number;
  matchCount: number;
  legType: 'SINGLE' | 'TWO_LEGGED';
  status: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface CompetitionStage {
  id: string;
  competitionId: string;
  seasonId: string;
  name: string;
  slug: string;
  type: StageType;
  order: number;
  status: StageStatus;
  startDate?: string;
  endDate?: string;
  isGroupStage: boolean;
  isLeaguePhase: boolean;
  isKnockout: boolean;
  isQualification: boolean;
  rulesetId?: string;
  groupsCount?: number;
  advancingTeamsCount?: number;
  groups?: StageGroupSummary[];
  knockoutRounds?: StageKnockoutRoundSummary[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CompetitionFormatConfig {
  id: string;
  competitionId: string;
  seasonId: string;
  formatType: CompetitionFormatType;
  name: string;
  description?: string;
  stages: CompetitionStage[];
  defaultStageId?: string;
  hasGroups: boolean;
  hasKnockout: boolean;
  hasLeagueTable: boolean;
  rulesetId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type TiebreakerRule =
  | 'POINTS'
  | 'GOAL_DIFFERENCE'
  | 'GOALS_FOR'
  | 'HEAD_TO_HEAD'
  | 'HEAD_TO_HEAD_GOAL_DIFFERENCE'
  | 'HEAD_TO_HEAD_AWAY_GOALS'
  | 'AWAY_GOALS'
  | 'WINS'
  | 'DISCIPLINARY_POINTS'
  | 'PLAYOFF'
  | 'DRAWING_OF_LOTS';

export interface StandingsRuleset {
  id: string;
  name: string;
  winPoints: number;
  drawPoints: number;
  lossPoints: number;
  tiebreakers: TiebreakerRule[];
  rankingDirection: 'ASC' | 'DESC';
}

// ── Groups & Standings Architecture Models (Phase 3) ─────────────────────────

export interface CompetitionGroup {
  id: string;
  stageId: string;
  name: string;
  shortName: string;
  slug: string;
  displayOrder: number;
  status: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED';
  teamsCount?: number;
  advancingTeamsCount?: number;
}

export type StandingTableType = 'LEAGUE' | 'GROUP' | 'LEAGUE_PHASE';

export interface StandingEntry {
  id: string;
  standingTableId: string;
  teamId: string;
  teamName: string;
  teamLogo?: string;
  teamBadge?: string;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form?: ('W' | 'D' | 'L')[];
  rankChange?: number;
  qualificationStatus?: 'QUALIFIED' | 'PLAYOFF' | 'ELIMINATED' | 'PENDING';
  promotionStatus?: 'PROMOTED' | 'PROMOTION_PLAYOFF' | 'NONE';
  relegationStatus?: 'RELEGATED' | 'RELEGATION_PLAYOFF' | 'NONE';
  gamesRemaining?: number;
  updatedAt?: string;
}

export interface StandingTable {
  id: string;
  competitionId: string;
  seasonId: string;
  stageId: string;
  groupId?: string;
  type: StandingTableType;
  name: string;
  slug: string;
  rulesetId: string;
  displayOrder: number;
  status: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED';
  entries: StandingEntry[];
  createdAt?: string;
  updatedAt?: string;
}

export interface GroupWithStandings {
  group: CompetitionGroup;
  table: StandingTable;
}

// ── Qualification & Knockout Engine Models (Phase 4) ─────────────────────────

export interface QualificationRule {
  targetPosition: number;
  ruleType: 'AUTOMATIC_QUALIFICATION' | 'PLAYOFF' | 'RELEGATION' | 'PROMOTION';
  destinationStageId?: string;
  destinationRoundSlug?: string;
  label: string;
  isWildcardThirdPlace?: boolean;
}

export interface KnockoutParticipant {
  teamId?: string;
  teamName: string;
  teamLogo?: string;
  score?: number;
  homeScore?: number;
  awayScore?: number;
  penaltyScore?: number;
  isWinner?: boolean;
  seedSource?: string;
}

export interface KnockoutMatchNode {
  id: string;
  roundId: string;
  roundSlug: string;
  matchNumber: number;
  homeTeam: KnockoutParticipant;
  awayTeam: KnockoutParticipant;
  winnerTeamId?: string;
  winnerTeamName?: string;
  status: 'SCHEDULED' | 'LIVE' | 'FT' | 'AET' | 'PEN';
  scheduledAt?: string;
  nextMatchId?: string;
  nextMatchSlot?: 'home' | 'away';
  legType: 'SINGLE' | 'TWO_LEGGED';
  legs?: {
    leg1Score?: { home: number; away: number };
    leg2Score?: { home: number; away: number };
    aggregateScore?: { home: number; away: number };
  };
}

export interface KnockoutRound {
  id: string;
  stageId: string;
  name: string;
  slug: string;
  order: number;
  matchCount: number;
  legType: 'SINGLE' | 'TWO_LEGGED';
  status: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED';
  matches?: KnockoutMatchNode[];
}

export interface TournamentBracket {
  competitionId: string;
  seasonId: string;
  stageId: string;
  name: string;
  rounds: KnockoutRound[];
  championTeam?: KnockoutParticipant;
  runnerUpTeam?: KnockoutParticipant;
  thirdPlaceTeam?: KnockoutParticipant;
}
