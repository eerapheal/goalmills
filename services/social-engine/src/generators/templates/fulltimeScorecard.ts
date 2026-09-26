/**
 * GoalMills Social Engine — Fulltime Scorecard Template
 *
 * Generates an automated Full-Time scorecard graphic with final score,
 * halftime score indicator, goalscorers, and complete visual stat comparison bars.
 * Dimensions: 1200 x 675 (16:9)
 */

export interface FulltimeScorer {
  team: 'home' | 'away';
  player: string;
  minute: string;
}

export interface MatchStatsBreakdown {
  possession?: [number, number]; // e.g. [58, 42]
  shots?: [number, number]; // e.g. [14, 8]
  shotsOnTarget?: [number, number]; // e.g. [6, 3]
  corners?: [number, number]; // e.g. [8, 4]
  fouls?: [number, number]; // e.g. [11, 15]
  yellowCards?: [number, number]; // e.g. [2, 3]
}

export interface FulltimeScorecardData {
  homeTeam: string;
  awayTeam: string;
  homeScore: number | string;
  awayScore: number | string;
  halfTimeScore?: string; // e.g. "1 - 0"
  leagueName: string;
  leagueColor?: string;
  scorers?: FulltimeScorer[];
  stats?: MatchStatsBreakdown;
}

export function renderFulltimeScorecardSvg(
  data: FulltimeScorecardData,
  width = 1200,
  height = 675
): string {
  const primaryColor = data.leagueColor || '#10b981';
  const homeScoreNum = data.homeScore ?? 0;
  const awayScoreNum = data.awayScore ?? 0;

  const homeScorers = (data.scorers || [])
    .filter((s) => s.team === 'home')
    .slice(0, 3)
    .map((s) => `⚽ ${escapeXml(s.player)} ${s.minute}'`)
    .join('  •  ');

  const awayScorers = (data.scorers || [])
    .filter((s) => s.team === 'away')
    .slice(0, 3)
    .map((s) => `⚽ ${escapeXml(s.player)} ${s.minute}'`)
    .join('  •  ');

  const stats = data.stats || {};
  const possession = stats.possession || [52, 48];
  const shots = stats.shots || [12, 9];
  const onTarget = stats.shotsOnTarget || [5, 4];
  const corners = stats.corners || [6, 4];
  const fouls = stats.fouls || [10, 13];
  const cards = stats.yellowCards || [1, 2];

  const renderStatRow = (label: string, homeVal: number, awayVal: number, y: number) => {
    const total = homeVal + awayVal || 1;
    const homePercent = Math.max(12, Math.min(88, Math.round((homeVal / total) * 100)));
    const barWidth = 320;
    const homeBarW = (barWidth * homePercent) / 100;

    return `
    <g transform="translate(440, ${y})">
      <text x="-30" y="14" font-family="'Inter', sans-serif" font-weight="800" font-size="15" fill="#f8fafc" text-anchor="end">${homeVal}</text>
      
      <!-- Comparison Track -->
      <rect x="0" y="3" width="${barWidth}" height="12" rx="6" fill="#1e293b" />
      <rect x="0" y="3" width="${homeBarW}" height="12" rx="6" fill="${primaryColor}" />
      
      <text x="${barWidth + 30}" y="14" font-family="'Inter', sans-serif" font-weight="800" font-size="15" fill="#f8fafc" text-anchor="start">${awayVal}</text>
      <text x="${barWidth / 2}" y="-4" font-family="'Inter', sans-serif" font-weight="700" font-size="11" fill="#94a3b8" text-anchor="middle" letter-spacing="0.5">${label.toUpperCase()}</text>
    </g>
    `;
  };

  return `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&amp;display=swap');
      text { font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    </style>

    <!-- Header Badge -->
    <g transform="translate(600, 48)">
      <rect x="-140" y="0" width="280" height="34" rx="17" fill="#10b981" fill-opacity="0.2" stroke="#10b981" stroke-width="1.5" />
      <text x="0" y="23" font-size="14" font-weight="800" fill="#f8fafc" letter-spacing="2" text-anchor="middle">
        🏁 FULL-TIME
      </text>
    </g>

    <!-- League Subtitle -->
    <text x="600" y="105" font-size="15" font-weight="800" fill="${primaryColor}" letter-spacing="1.5" text-anchor="middle">
      ${escapeXml(data.leagueName.toUpperCase())}
    </text>

    <!-- Scoreboard Hero Card -->
    <g transform="translate(100, 120)">
      <rect x="0" y="0" width="1000" height="210" rx="20" fill="#0f172a" fill-opacity="0.9" stroke="#334155" stroke-width="1.5" />

      <!-- Home Team -->
      <g transform="translate(200, 80)">
        <circle cx="0" cy="0" r="42" fill="#1e293b" stroke="#475569" stroke-width="2" />
        <text x="0" y="10" font-size="24" font-weight="900" fill="#f8fafc" text-anchor="middle">${escapeXml(
          data.homeTeam.slice(0, 3).toUpperCase()
        )}</text>
        <text x="0" y="65" font-size="22" font-weight="800" fill="#f8fafc" text-anchor="middle">${escapeXml(
          data.homeTeam
        )}</text>
      </g>

      <!-- Center Big Score & HT Pill -->
      <g transform="translate(500, 95)">
        <text x="-55" y="20" font-size="80" font-weight="900" fill="#f8fafc" text-anchor="middle">${homeScoreNum}</text>
        <text x="0" y="15" font-size="48" font-weight="800" fill="#64748b" text-anchor="middle">-</text>
        <text x="55" y="20" font-size="80" font-weight="900" fill="#f8fafc" text-anchor="middle">${awayScoreNum}</text>
        
        <!-- HT Score Pill -->
        ${
          data.halfTimeScore
            ? `
          <rect x="-45" y="42" width="90" height="22" rx="11" fill="#1e293b" />
          <text x="0" y="57" font-size="11" font-weight="700" fill="#94a3b8" text-anchor="middle">HT: ${escapeXml(
            data.halfTimeScore
          )}</text>
          `
            : ''
        }
      </g>

      <!-- Away Team -->
      <g transform="translate(800, 80)">
        <circle cx="0" cy="0" r="42" fill="#1e293b" stroke="#475569" stroke-width="2" />
        <text x="0" y="10" font-size="24" font-weight="900" fill="#f8fafc" text-anchor="middle">${escapeXml(
          data.awayTeam.slice(0, 3).toUpperCase()
        )}</text>
        <text x="0" y="65" font-size="22" font-weight="800" fill="#f8fafc" text-anchor="middle">${escapeXml(
          data.awayTeam
        )}</text>
      </g>

      <!-- Scorers Row -->
      <line x1="60" y1="168" x2="940" y2="168" stroke="#1e293b" stroke-width="1" />
      <text x="200" y="194" font-size="12" font-weight="600" fill="#94a3b8" text-anchor="middle">${homeScorers || 'No scorers'}</text>
      <text x="800" y="194" font-size="12" font-weight="600" fill="#94a3b8" text-anchor="middle">${awayScorers || 'No scorers'}</text>
    </g>

    <!-- Comprehensive Match Stats Grid (6 Stats) -->
    <g transform="translate(0, 345)">
      ${renderStatRow('Possession (%)', possession[0], possession[1], 20)}
      ${renderStatRow('Total Shots', shots[0], shots[1], 62)}
      ${renderStatRow('Shots on Target', onTarget[0], onTarget[1], 104)}
      ${renderStatRow('Corner Kicks', corners[0], corners[1], 146)}
      ${renderStatRow('Fouls Committed', fouls[0], fouls[1], 188)}
      ${renderStatRow('Yellow Cards', cards[0], cards[1], 230)}
    </g>

    <!-- Footer Branding -->
    <g transform="translate(100, 640)">
      <line x1="0" y1="0" x2="1000" y2="0" stroke="#334155" stroke-width="1" stroke-opacity="0.6" />
      <text x="0" y="20" font-size="13" font-weight="800" fill="#10b981">GOALMILLS STATS</text>
      <text x="500" y="20" font-size="13" font-weight="700" fill="#f8fafc" text-anchor="middle">Detailed player heatmaps on goalmills.com</text>
      <text x="1000" y="20" font-size="13" font-weight="600" fill="#64748b" text-anchor="end">#GoalMills #FullTime</text>
    </g>
  </svg>
  `;
}

function escapeXml(unsafe: string): string {
  return (unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
