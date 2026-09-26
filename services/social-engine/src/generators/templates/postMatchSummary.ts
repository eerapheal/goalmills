/**
 * GoalMills Social Engine — Post-Match Summary Card Template
 *
 * Generates an analytical post-match summary card 30 mins after fulltime,
 * highlighting the final result, Man of the Match, and key tactical stats.
 * Dimensions: 1200 x 675 (16:9)
 */

export interface PostMatchSummaryData {
  homeTeam: string;
  awayTeam: string;
  score: string;
  leagueName: string;
  leagueColor?: string;
  manOfTheMatch?: string;
  headline?: string;
  keyTakeaway?: string;
}

export function renderPostMatchSummarySvg(
  data: PostMatchSummaryData,
  width = 1200,
  height = 675
): string {
  const primaryColor = data.leagueColor || '#f59e0b';
  const headline = data.headline || `${data.homeTeam} vs ${data.awayTeam} Match Verdict`;
  const takeaway =
    data.keyTakeaway ||
    `A high-stakes tactical showdown ends with an impactful result that shifts momentum in the ${data.leagueName} table.`;

  return `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&amp;display=swap');
      text { font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    </style>

    <!-- Header Badge -->
    <g transform="translate(100, 50)">
      <rect x="0" y="0" width="180" height="32" rx="16" fill="#f59e0b" fill-opacity="0.15" stroke="#f59e0b" stroke-width="1.5" />
      <text x="90" y="21" font-size="13" font-weight="800" fill="#f59e0b" letter-spacing="1.5" text-anchor="middle">
        POST-MATCH REPORT
      </text>

      <text x="0" y="70" font-size="32" font-weight="900" fill="#f8fafc" letter-spacing="-0.5">
        ${escapeXml(headline)}
      </text>
      <text x="0" y="98" font-size="16" font-weight="700" fill="${primaryColor}" letter-spacing="1">
        ${escapeXml(data.leagueName.toUpperCase())} • FINAL VERDICT
      </text>
    </g>

    <!-- Score Card Block -->
    <g transform="translate(100, 175)">
      <rect x="0" y="0" width="1000" height="150" rx="18" fill="#0f172a" fill-opacity="0.88" stroke="#334155" stroke-width="1.5" />
      
      <!-- Home Team -->
      <text x="320" y="88" font-size="28" font-weight="800" fill="#f8fafc" text-anchor="end">${escapeXml(
        data.homeTeam
      )}</text>

      <!-- Center Score -->
      <g transform="translate(500, 88)">
        <rect x="-80" y="-45" width="160" height="60" rx="12" fill="#1e293b" />
        <text x="0" y="-3" font-size="34" font-weight="900" fill="#f8fafc" text-anchor="middle">${escapeXml(
          data.score
        )}</text>
      </g>

      <!-- Away Team -->
      <text x="680" y="88" font-size="28" font-weight="800" fill="#f8fafc" text-anchor="start">${escapeXml(
        data.awayTeam
      )}</text>
    </g>

    <!-- MOTM & Takeaway Grid -->
    <g transform="translate(100, 350)">
      <!-- MOTM Card -->
      <g transform="translate(0, 0)">
        <rect x="0" y="0" width="340" height="230" rx="18" fill="#0f172a" fill-opacity="0.85" stroke="#f59e0b" stroke-width="1.5" />
        <g transform="translate(170, 45)">
          <circle cx="0" cy="0" r="28" fill="#f59e0b" fill-opacity="0.2" />
          <text x="0" y="8" font-size="24" text-anchor="middle">⭐</text>
        </g>
        <text x="170" y="105" font-size="13" font-weight="800" fill="#f59e0b" letter-spacing="1.5" text-anchor="middle">MAN OF THE MATCH</text>
        <text x="170" y="145" font-size="22" font-weight="800" fill="#f8fafc" text-anchor="middle">${escapeXml(
          data.manOfTheMatch || 'Star Performer'
        )}</text>
        <text x="170" y="178" font-size="13" font-weight="600" fill="#94a3b8" text-anchor="middle">Dominant performance on the pitch</text>
      </g>

      <!-- Tactical Takeaway Panel -->
      <g transform="translate(370, 0)">
        <rect x="0" y="0" width="630" height="230" rx="18" fill="#0f172a" fill-opacity="0.85" stroke="#334155" stroke-width="1.5" />
        <text x="40" y="45" font-size="14" font-weight="800" fill="#10b981" letter-spacing="1">KEY TACTICAL TAKEAWAY</text>
        
        <!-- Multi-line summary snippet -->
        <text x="40" y="85" font-size="16" font-weight="600" fill="#f8fafc" width="550">
          ${escapeXml(takeaway.slice(0, 160))}...
        </text>

        <!-- CTA pill -->
        <g transform="translate(40, 150)">
          <rect x="0" y="0" width="280" height="42" rx="21" fill="#10b981" />
          <text x="140" y="26" font-size="13" font-weight="800" fill="#0f172a" text-anchor="middle">READ FULL ANALYSIS ON GOALMILLS</text>
        </g>
      </g>
    </g>

    <!-- Footer -->
    <g transform="translate(100, 640)">
      <line x1="0" y1="0" x2="1000" y2="0" stroke="#334155" stroke-width="1" stroke-opacity="0.6" />
      <text x="0" y="20" font-size="13" font-weight="800" fill="#10b981">GOALMILLS EDITORIAL</text>
      <text x="500" y="20" font-size="13" font-weight="700" fill="#94a3b8" text-anchor="middle">goalmills.com</text>
      <text x="1000" y="20" font-size="13" font-weight="600" fill="#64748b" text-anchor="end">#GoalMills #MatchReport</text>
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
