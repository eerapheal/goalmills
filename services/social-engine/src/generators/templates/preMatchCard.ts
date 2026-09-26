/**
 * GoalMills Social Engine — Pre-Match Preview Card Template
 *
 * Generates a pre-match clash graphic 2 days before kickoff.
 * Dimensions: 1200 x 675 (16:9)
 */

export interface PreMatchData {
  homeTeam: string;
  awayTeam: string;
  leagueName: string;
  leagueColor?: string;
  eventDate: string;
  eventTime: string;
  venue?: string;
  h2hSummary?: string;
  homeForm?: string[]; // e.g. ['W', 'W', 'D', 'L', 'W']
  awayForm?: string[]; // e.g. ['L', 'W', 'W', 'D', 'W']
}

export function renderPreMatchCardSvg(
  data: PreMatchData,
  width = 1200,
  height = 675
): string {
  const primaryColor = data.leagueColor || '#3b82f6';

  const renderFormPills = (form: string[] = ['W', 'D', 'W', 'L', 'W'], startX: number, y: number) => {
    return form
      .slice(0, 5)
      .map((res, i) => {
        const bg = res === 'W' ? '#10b981' : res === 'D' ? '#f59e0b' : '#ef4444';
        const x = startX + i * 28;
        return `
        <rect x="${x}" y="${y}" width="22" height="22" rx="4" fill="${bg}" fill-opacity="0.9" />
        <text x="${x + 11}" y="${y + 16}" font-family="'Inter', sans-serif" font-weight="800" font-size="12" fill="#ffffff" text-anchor="middle">${res}</text>
      `;
      })
      .join('\n');
  };

  return `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&amp;display=swap');
      text { font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    </style>

    <!-- Top League & Match Tag -->
    <g transform="translate(600, 65)">
      <rect x="-180" y="0" width="360" height="36" rx="18" fill="#1e293b" fill-opacity="0.9" stroke="${primaryColor}" stroke-width="1.5" />
      <text x="0" y="24" font-size="14" font-weight="800" fill="#f8fafc" letter-spacing="1.5" text-anchor="middle">
        ⚽ ${escapeXml(data.leagueName.toUpperCase())} • PRE-MATCH
      </text>
    </g>

    <!-- Central Clash Block -->
    <!-- Home Team Panel -->
    <g transform="translate(100, 140)">
      <rect x="0" y="0" width="440" height="280" rx="20" fill="#0f172a" fill-opacity="0.85" stroke="#334155" stroke-width="1.5" />
      
      <!-- Home Badge Circle -->
      <circle cx="220" cy="85" r="50" fill="#1e293b" stroke="#475569" stroke-width="2" />
      <text x="220" y="98" font-size="32" font-weight="900" fill="${primaryColor}" text-anchor="middle">${escapeXml(
        data.homeTeam.slice(0, 3).toUpperCase()
      )}</text>
      
      <!-- Home Team Name -->
      <text x="220" y="175" font-size="26" font-weight="800" fill="#f8fafc" text-anchor="middle">${escapeXml(
        data.homeTeam
      )}</text>
      <text x="220" y="202" font-size="14" font-weight="600" fill="#94a3b8" text-anchor="middle">HOME</text>

      <!-- Form Guide -->
      <text x="220" y="235" font-size="12" font-weight="700" fill="#64748b" text-anchor="middle">RECENT FORM</text>
      <g transform="translate(0, 10)">
        ${renderFormPills(data.homeForm, 150, 235)}
      </g>
    </g>

    <!-- VS Divider Circle -->
    <g transform="translate(600, 280)">
      <circle cx="0" cy="0" r="42" fill="#0f172a" stroke="${primaryColor}" stroke-width="2.5" />
      <text x="0" y="10" font-size="24" font-weight="900" fill="#f8fafc" text-anchor="middle">VS</text>
    </g>

    <!-- Away Team Panel -->
    <g transform="translate(660, 140)">
      <rect x="0" y="0" width="440" height="280" rx="20" fill="#0f172a" fill-opacity="0.85" stroke="#334155" stroke-width="1.5" />
      
      <!-- Away Badge Circle -->
      <circle cx="220" cy="85" r="50" fill="#1e293b" stroke="#475569" stroke-width="2" />
      <text x="220" y="98" font-size="32" font-weight="900" fill="${primaryColor}" text-anchor="middle">${escapeXml(
        data.awayTeam.slice(0, 3).toUpperCase()
      )}</text>
      
      <!-- Away Team Name -->
      <text x="220" y="175" font-size="26" font-weight="800" fill="#f8fafc" text-anchor="middle">${escapeXml(
        data.awayTeam
      )}</text>
      <text x="220" y="202" font-size="14" font-weight="600" fill="#94a3b8" text-anchor="middle">AWAY</text>

      <!-- Form Guide -->
      <text x="220" y="235" font-size="12" font-weight="700" fill="#64748b" text-anchor="middle">RECENT FORM</text>
      <g transform="translate(0, 10)">
        ${renderFormPills(data.awayForm, 150, 235)}
      </g>
    </g>

    <!-- Match Information Card -->
    <g transform="translate(250, 460)">
      <rect x="0" y="0" width="700" height="95" rx="16" fill="#0f172a" fill-opacity="0.9" stroke="#334155" stroke-width="1" />
      
      <!-- Kickoff Date -->
      <g transform="translate(130, 35)">
        <text x="0" y="0" font-size="12" font-weight="700" fill="#64748b" text-anchor="middle">MATCH DATE</text>
        <text x="0" y="28" font-size="20" font-weight="800" fill="#f8fafc" text-anchor="middle">${escapeXml(
          data.eventDate
        )}</text>
      </g>

      <line x1="260" y1="20" x2="260" y2="75" stroke="#334155" stroke-width="1" />

      <!-- Kickoff Time -->
      <g transform="translate(350, 35)">
        <text x="0" y="0" font-size="12" font-weight="700" fill="#64748b" text-anchor="middle">KICK-OFF</text>
        <text x="0" y="28" font-size="20" font-weight="800" fill="${primaryColor}" text-anchor="middle">${escapeXml(
          data.eventTime
        )} GMT</text>
      </g>

      <line x1="440" y1="20" x2="440" y2="75" stroke="#334155" stroke-width="1" />

      <!-- Venue -->
      <g transform="translate(560, 35)">
        <text x="0" y="0" font-size="12" font-weight="700" fill="#64748b" text-anchor="middle">VENUE</text>
        <text x="0" y="28" font-size="17" font-weight="700" fill="#f8fafc" text-anchor="middle">${escapeXml(
          data.venue || 'Stadium'
        )}</text>
      </g>
    </g>

    <!-- Footer Branding -->
    <g transform="translate(100, 620)">
      <text x="0" y="20" font-size="14" font-weight="800" fill="#10b981">GOALMILLS</text>
      <text x="500" y="20" font-size="14" font-weight="700" fill="#94a3b8" text-anchor="middle">Full H2H &amp; Tactical Analysis at goalmills.com</text>
      <text x="1000" y="20" font-size="13" font-weight="600" fill="#64748b" text-anchor="end">#GoalMills #${data.homeTeam.replace(
        /\s+/g,
        ''
      )}vs${data.awayTeam.replace(/\s+/g, '')}</text>
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
