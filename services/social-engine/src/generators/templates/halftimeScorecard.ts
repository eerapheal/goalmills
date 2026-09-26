/**
 * GoalMills Social Engine — Halftime Scorecard Template
 *
 * Generates an automated Half-Time scorecard graphic with live scores,
 * goalscorers, and key interval stats.
 * Dimensions: 1200 x 675 (16:9)
 */

export interface HalftimeScorer {
  team: 'home' | 'away';
  player: string;
  minute: string;
}

export interface HalftimeScorecardData {
  homeTeam: string;
  awayTeam: string;
  homeScore: number | string;
  awayScore: number | string;
  leagueName: string;
  leagueColor?: string;
  scorers?: HalftimeScorer[];
  stats?: {
    possession?: [number, number]; // e.g. [58, 42]
    shots?: [number, number]; // e.g. [7, 4]
    shotsOnTarget?: [number, number]; // e.g. [3, 1]
  };
}

export function renderHalftimeScorecardSvg(
  data: HalftimeScorecardData,
  width = 1200,
  height = 675
): string {
  const primaryColor = data.leagueColor || '#38bdf8';
  const homeScoreNum = data.homeScore ?? 0;
  const awayScoreNum = data.awayScore ?? 0;

  const homeScorers = (data.scorers || [])
    .filter((s) => s.team === 'home')
    .map((s) => `⚽ ${escapeXml(s.player)} ${s.minute}'`)
    .join('  •  ');

  const awayScorers = (data.scorers || [])
    .filter((s) => s.team === 'away')
    .map((s) => `⚽ ${escapeXml(s.player)} ${s.minute}'`)
    .join('  •  ');

  const possession = data.stats?.possession || [50, 50];
  const shots = data.stats?.shots || [5, 4];
  const shotsOnTarget = data.stats?.shotsOnTarget || [2, 2];

  const renderStatBar = (label: string, homeVal: number, awayVal: number, y: number) => {
    const total = homeVal + awayVal || 1;
    const homePercent = Math.max(10, Math.min(90, Math.round((homeVal / total) * 100)));
    const awayPercent = 100 - homePercent;
    const barWidth = 360;
    const homeBarW = (barWidth * homePercent) / 100;

    return `
    <g transform="translate(420, ${y})">
      <text x="-40" y="16" font-family="'Inter', sans-serif" font-weight="700" font-size="16" fill="#f8fafc" text-anchor="end">${homeVal}</text>
      
      <rect x="0" y="4" width="${barWidth}" height="14" rx="7" fill="#1e293b" />
      <rect x="0" y="4" width="${homeBarW}" height="14" rx="7" fill="${primaryColor}" />
      
      <text x="${barWidth + 40}" y="16" font-family="'Inter', sans-serif" font-weight="700" font-size="16" fill="#f8fafc" text-anchor="start">${awayVal}</text>
      <text x="${barWidth / 2}" y="-4" font-family="'Inter', sans-serif" font-weight="600" font-size="12" fill="#94a3b8" text-anchor="middle">${label.toUpperCase()}</text>
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
    <g transform="translate(600, 55)">
      <rect x="-140" y="0" width="280" height="34" rx="17" fill="#ef4444" fill-opacity="0.2" stroke="#ef4444" stroke-width="1.5" />
      <circle cx="-100" cy="17" r="5" fill="#ef4444" />
      <text x="5" y="23" font-size="14" font-weight="800" fill="#f8fafc" letter-spacing="2" text-anchor="middle">
        ⏱️ HALF-TIME
      </text>
    </g>

    <!-- League Subheader -->
    <text x="600" y="120" font-size="16" font-weight="800" fill="${primaryColor}" letter-spacing="1.5" text-anchor="middle">
      ${escapeXml(data.leagueName.toUpperCase())}
    </text>

    <!-- Main Scoreboard Hero Block -->
    <g transform="translate(100, 140)">
      <rect x="0" y="0" width="1000" height="230" rx="24" fill="#0f172a" fill-opacity="0.88" stroke="#334155" stroke-width="1.5" />

      <!-- Home Team -->
      <g transform="translate(200, 90)">
        <circle cx="0" cy="0" r="42" fill="#1e293b" stroke="#475569" stroke-width="2" />
        <text x="0" y="10" font-size="24" font-weight="900" fill="#f8fafc" text-anchor="middle">${escapeXml(
          data.homeTeam.slice(0, 3).toUpperCase()
        )}</text>
        <text x="0" y="70" font-size="24" font-weight="800" fill="#f8fafc" text-anchor="middle">${escapeXml(
          data.homeTeam
        )}</text>
      </g>

      <!-- Center Big Score -->
      <g transform="translate(500, 105)">
        <text x="-50" y="25" font-size="82" font-weight="900" fill="#f8fafc" text-anchor="middle">${homeScoreNum}</text>
        <text x="0" y="20" font-size="52" font-weight="800" fill="#64748b" text-anchor="middle">-</text>
        <text x="50" y="25" font-size="82" font-weight="900" fill="#f8fafc" text-anchor="middle">${awayScoreNum}</text>
      </g>

      <!-- Away Team -->
      <g transform="translate(800, 90)">
        <circle cx="0" cy="0" r="42" fill="#1e293b" stroke="#475569" stroke-width="2" />
        <text x="0" y="10" font-size="24" font-weight="900" fill="#f8fafc" text-anchor="middle">${escapeXml(
          data.awayTeam.slice(0, 3).toUpperCase()
        )}</text>
        <text x="0" y="70" font-size="24" font-weight="800" fill="#f8fafc" text-anchor="middle">${escapeXml(
          data.awayTeam
        )}</text>
      </g>

      <!-- Goal Scorers Row -->
      <line x1="60" y1="185" x2="940" y2="185" stroke="#1e293b" stroke-width="1" />
      <text x="200" y="210" font-size="13" font-weight="600" fill="#94a3b8" text-anchor="middle">${homeScorers || 'No goals'}</text>
      <text x="800" y="210" font-size="13" font-weight="600" fill="#94a3b8" text-anchor="middle">${awayScorers || 'No goals'}</text>
    </g>

    <!-- Half-Time Key Stats Section -->
    <g transform="translate(0, 395)">
      ${renderStatBar('Possession (%)', possession[0], possession[1], 25)}
      ${renderStatBar('Total Shots', shots[0], shots[1], 75)}
      ${renderStatBar('Shots on Target', shotsOnTarget[0], shotsOnTarget[1], 125)}
    </g>

    <!-- Footer Branding -->
    <g transform="translate(100, 630)">
      <line x1="0" y1="0" x2="1000" y2="0" stroke="#334155" stroke-width="1" stroke-opacity="0.6" />
      <text x="0" y="22" font-size="13" font-weight="800" fill="#10b981">GOALMILLS LIVE</text>
      <text x="500" y="22" font-size="13" font-weight="700" fill="#f8fafc" text-anchor="middle">goalmills.com</text>
      <text x="1000" y="22" font-size="13" font-weight="600" fill="#64748b" text-anchor="end">#GoalMills #HalfTime</text>
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
