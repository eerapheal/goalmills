/**
 * GoalMills Social Engine — Upcoming Fixtures Card Template
 *
 * Generates a weekly fixtures graphic for any of the Top 5 European leagues.
 * Dimensions: 1200 x 675 (16:9 social share standard)
 */

export interface UpcomingFixtureItem {
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
}

export interface UpcomingFixturesData {
  leagueName: string;
  leagueColor?: string;
  matchweek?: string;
  fixtures: UpcomingFixtureItem[];
}

export function renderUpcomingFixturesSvg(
  data: UpcomingFixturesData,
  width = 1200,
  height = 675
): string {
  const primaryColor = data.leagueColor || '#10b981';
  const displayFixtures = data.fixtures.slice(0, 6);

  const fixtureRowsSvg = displayFixtures
    .map((fix, idx) => {
      const y = 190 + idx * 72;
      return `
      <!-- Fixture Row ${idx + 1} -->
      <g transform="translate(100, ${y})">
        <!-- Glass card row background -->
        <rect x="0" y="0" width="1000" height="60" rx="12" fill="#0f172a" fill-opacity="0.75" stroke="#334155" stroke-width="1" />
        
        <!-- Home Team -->
        <text x="360" y="38" font-family="'Inter', sans-serif" font-weight="700" font-size="20" fill="#f8fafc" text-anchor="end">${escapeXml(
          fix.homeTeam
        )}</text>
        
        <!-- VS Pill -->
        <rect x="470" y="15" width="60" height="30" rx="15" fill="${primaryColor}" fill-opacity="0.2" stroke="${primaryColor}" stroke-width="1.5" />
        <text x="500" y="36" font-family="'Inter', sans-serif" font-weight="800" font-size="14" fill="${primaryColor}" text-anchor="middle">VS</text>
        
        <!-- Away Team -->
        <text x="640" y="38" font-family="'Inter', sans-serif" font-weight="700" font-size="20" fill="#f8fafc" text-anchor="start">${escapeXml(
          fix.awayTeam
        )}</text>
        
        <!-- Kickoff Date & Time Badge -->
        <g transform="translate(850, 18)">
          <rect x="0" y="0" width="125" height="24" rx="6" fill="#1e293b" />
          <text x="62" y="17" font-family="'Inter', sans-serif" font-weight="600" font-size="12" fill="#94a3b8" text-anchor="middle">${escapeXml(
            fix.date
          )} • ${escapeXml(fix.time)}</text>
        </g>
      </g>
    `;
    })
    .join('\n');

  return `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&amp;display=swap');
      text { font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    </style>

    <!-- Header Section -->
    <g transform="translate(100, 50)">
      <!-- GoalMills Brand pill -->
      <rect x="0" y="0" width="160" height="32" rx="16" fill="#10b981" fill-opacity="0.15" stroke="#10b981" stroke-width="1" />
      <circle cx="20" cy="16" r="6" fill="#10b981" />
      <text x="36" y="21" font-size="13" font-weight="800" fill="#10b981" letter-spacing="1.5">GOALMILLS</text>

      <!-- League Title & Matchweek -->
      <text x="0" y="75" font-size="34" font-weight="900" fill="#f8fafc" letter-spacing="-0.5">${escapeXml(
        data.leagueName.toUpperCase()
      )}</text>
      <text x="0" y="105" font-size="16" font-weight="600" fill="#94a3b8" letter-spacing="0.5">${escapeXml(
        data.matchweek || 'UPCOMING FIXTURES'
      )}</text>
    </g>

    <!-- Fixture List Rows -->
    ${fixtureRowsSvg}

    <!-- Footer Branding -->
    <g transform="translate(100, 630)">
      <line x1="0" y1="0" x2="1000" y2="0" stroke="#334155" stroke-width="1" stroke-opacity="0.6" />
      <text x="0" y="24" font-size="13" font-weight="600" fill="#64748b">LIVE SCORES &amp; ANALYTICS</text>
      <text x="500" y="24" font-size="13" font-weight="700" fill="#10b981" text-anchor="middle">goalmills.com</text>
      <text x="1000" y="24" font-size="13" font-weight="700" fill="#64748b" text-anchor="end">#GoalMills #${data.leagueName.replace(
        /\s+/g,
        ''
      )}</text>
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
