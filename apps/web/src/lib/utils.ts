export const LEAGUE_RANKING = [
  39, // Premier League
  140, // La Liga
  78, // Bundesliga
  135, // Serie A
  61, // Ligue 1
  2, // UEFA Champions League
];

export function getLeagueRank(leagueId: number): number {
  const index = LEAGUE_RANKING.indexOf(leagueId);
  return index === -1 ? 999 : index;
}
