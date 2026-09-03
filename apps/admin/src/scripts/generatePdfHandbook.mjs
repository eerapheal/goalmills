import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateHandbookPdf() {
  const pdfDoc = await PDFDocument.create();
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const PAGE_WIDTH = 595.28; // A4
  const PAGE_HEIGHT = 841.89;
  const MARGIN = 50;
  const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

  // Navy & Gold Brand Colors
  const COLOR_NAVY = rgb(11 / 255, 18 / 255, 32 / 255);
  const COLOR_GOLD = rgb(245 / 255, 158 / 255, 11 / 255);
  const COLOR_WHITE = rgb(1, 1, 1);
  const COLOR_DARK = rgb(20 / 255, 30 / 255, 45 / 255);
  const COLOR_MUTED = rgb(100 / 255, 116 / 255, 139 / 255);
  const COLOR_BORDER = rgb(226 / 255, 232 / 255, 240 / 255);

  let currentPage = null;
  let y = 0;

  function addNewPage(isCover = false) {
    currentPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    if (isCover) {
      // Dark Navy Background
      currentPage.drawRectangle({
        x: 0,
        y: 0,
        width: PAGE_WIDTH,
        height: PAGE_HEIGHT,
        color: COLOR_NAVY,
      });
      y = PAGE_HEIGHT - 120;
    } else {
      // White Page
      currentPage.drawRectangle({
        x: 0,
        y: 0,
        width: PAGE_WIDTH,
        height: PAGE_HEIGHT,
        color: COLOR_WHITE,
      });

      // Top Running Header
      currentPage.drawText('GOALMILLS  |  SPORTS MEDIA TRAINING HANDBOOK & SOPs', {
        x: MARGIN,
        y: PAGE_HEIGHT - 35,
        size: 8,
        font: fontBold,
        color: COLOR_MUTED,
      });

      currentPage.drawLine({
        start: { x: MARGIN, y: PAGE_HEIGHT - 42 },
        end: { x: PAGE_WIDTH - MARGIN, y: PAGE_HEIGHT - 42 },
        thickness: 0.5,
        color: COLOR_BORDER,
      });

      // Footer
      const pageNumber = pdfDoc.getPageCount();
      currentPage.drawText(`Page ${pageNumber}  •  GoalMills Sports Media Group © 2026`, {
        x: MARGIN,
        y: 30,
        size: 8,
        font: fontRegular,
        color: COLOR_MUTED,
      });

      y = PAGE_HEIGHT - 65;
    }
  }

  function wrapText(text, maxWidth, font, size) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = font.widthOfTextAtSize(testLine, size);
      if (testWidth <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  }

  function checkPageSpace(requiredSpace) {
    if (y - requiredSpace < 55) {
      addNewPage(false);
    }
  }

  function drawHeading(text, size = 16, isSub = false) {
    checkPageSpace(size * 2 + 15);
    y -= 10;
    const font = fontBold;
    const color = isSub ? rgb(15 / 255, 23 / 255, 42 / 255) : rgb(2 / 255, 6 / 255, 23 / 255);
    
    if (!isSub) {
      // Golden Accent Pill
      currentPage.drawRectangle({
        x: MARGIN,
        y: y - 2,
        width: 4,
        height: size + 4,
        color: COLOR_GOLD,
      });
      currentPage.drawText(text, {
        x: MARGIN + 12,
        y: y,
        size,
        font,
        color,
      });
    } else {
      currentPage.drawText(text, {
        x: MARGIN,
        y: y,
        size,
        font,
        color,
      });
    }
    y -= size + 8;
  }

  function drawParagraph(text, size = 9.5, isMuted = false, indent = 0) {
    const font = fontRegular;
    const color = isMuted ? COLOR_MUTED : COLOR_DARK;
    const lines = wrapText(text, CONTENT_WIDTH - indent, font, size);
    for (const line of lines) {
      checkPageSpace(size + 4);
      currentPage.drawText(line, {
        x: MARGIN + indent,
        y,
        size,
        font,
        color,
      });
      y -= size + 4;
    }
    y -= 4;
  }

  function drawBullet(text, size = 9.5) {
    const font = fontRegular;
    const lines = wrapText(text, CONTENT_WIDTH - 20, font, size);
    checkPageSpace(lines.length * (size + 4) + 2);
    currentPage.drawCircle({
      x: MARGIN + 6,
      y: y + size / 2.5,
      size: 2.5,
      color: COLOR_GOLD,
    });
    for (let i = 0; i < lines.length; i++) {
      currentPage.drawText(lines[i], {
        x: MARGIN + 16,
        y,
        size,
        font,
        color: COLOR_DARK,
      });
      y -= size + 4;
    }
  }

  function drawBox(title, content) {
    const lines = content.split('\n');
    const boxHeight = lines.length * 12 + 28;
    checkPageSpace(boxHeight + 10);

    currentPage.drawRectangle({
      x: MARGIN,
      y: y - boxHeight + 12,
      width: CONTENT_WIDTH,
      height: boxHeight,
      color: rgb(248 / 255, 250 / 255, 252 / 255),
      borderColor: rgb(203 / 255, 213 / 255, 225 / 255),
      borderWidth: 1,
    });

    currentPage.drawText(title, {
      x: MARGIN + 12,
      y: y - 2,
      size: 9,
      font: fontBold,
      color: rgb(30 / 255, 41 / 255, 59 / 255),
    });

    let textY = y - 16;
    for (const l of lines) {
      currentPage.drawText(l, {
        x: MARGIN + 12,
        y: textY,
        size: 8,
        font: fontRegular,
        color: rgb(51 / 255, 65 / 255, 85 / 255),
      });
      textY -= 12;
    }
    y -= boxHeight + 10;
  }

  // ==========================================
  // PAGE 1: COVER PAGE
  // ==========================================
  addNewPage(true);

  // Top header in Cover
  currentPage.drawText('GOALMILLS SPORTS MEDIA ACADEMY', {
    x: MARGIN,
    y: PAGE_HEIGHT - 60,
    size: 11,
    font: fontBold,
    color: COLOR_GOLD,
  });

  currentPage.drawText('+2347084988228  |  support@goalmills.com  |  https://goalmills-web.vercel.app', {
    x: MARGIN,
    y: PAGE_HEIGHT - 75,
    size: 8,
    font: fontRegular,
    color: rgb(148 / 255, 163 / 255, 184 / 255),
  });

  currentPage.drawLine({
    start: { x: MARGIN, y: PAGE_HEIGHT - 85 },
    end: { x: PAGE_WIDTH - MARGIN, y: PAGE_HEIGHT - 85 },
    thickness: 1,
    color: rgb(255 / 255, 255 / 255, 255 / 255, 0.2),
  });

  // Cover Main Title
  y = PAGE_HEIGHT / 2 + 100;
  currentPage.drawText('GOALMILLS', {
    x: MARGIN,
    y,
    size: 38,
    font: fontBold,
    color: COLOR_WHITE,
  });

  y -= 40;
  currentPage.drawText('Training Resources & Handbooks', {
    x: MARGIN,
    y,
    size: 22,
    font: fontBold,
    color: COLOR_GOLD,
  });

  y -= 30;
  currentPage.drawText('Complete Sports Media & Publishing Master Curriculum (30-Day Onboarding)', {
    x: MARGIN,
    y,
    size: 11,
    font: fontRegular,
    color: rgb(203 / 255, 213 / 255, 225 / 255),
  });

  y -= 20;
  currentPage.drawText('Writing  •  SEO  •  Canva Graphics  •  Video Production  •  Verification  •  Newsroom Ops', {
    x: MARGIN,
    y,
    size: 9,
    font: fontBold,
    color: COLOR_GOLD,
  });

  // Bottom Author info on Cover
  currentPage.drawLine({
    start: { x: MARGIN, y: 110 },
    end: { x: PAGE_WIDTH - MARGIN, y: 110 },
    thickness: 1,
    color: rgb(255 / 255, 255 / 255, 255 / 255, 0.2),
  });

  currentPage.drawText('Author: Ekpenisi Erue Raphael', {
    x: MARGIN,
    y: 85,
    size: 11,
    font: fontBold,
    color: COLOR_WHITE,
  });

  currentPage.drawText('First Edition, 2026  •  GoalMills Sports Media Group', {
    x: MARGIN,
    y: 70,
    size: 9,
    font: fontRegular,
    color: rgb(148 / 255, 163 / 255, 184 / 255),
  });

  // ==========================================
  // SECTION 1: 30-DAY CURRICULUM
  // ==========================================
  addNewPage(false);
  drawHeading('30-Day Sports Media Employee Training Curriculum', 16);
  drawParagraph(
    'Program: GoalMills Sports Media Academy | Duration: 30 working days | Daily Stand-up: 5:00 PM–5:30 PM WAT (Google Meet)',
    9,
    true
  );
  drawParagraph(
    'Training Model: Learn -> Create -> Publish -> Submit -> Review -> Improve. This is a production-based training program, not a reading program. Every working day, staff must study assigned lessons, produce and verify original content, publish live to website and social channels, and submit daily reports before attending the 5:00 PM stand-up review.'
  );

  drawHeading('Daily Evaluation Scorecard (100 Points Total)', 12, true);
  drawBullet('Research (15 pts): Primary sourcing depth, fact verification, zero unverified claims.');
  drawBullet('Accuracy (15 pts): Correct player names, scores, statistics, competition data.');
  drawBullet('Writing (15 pts): Inverted pyramid, 3-sentence lead, active voice, zero editorial fluff.');
  drawBullet('SEO (10 pts): Search intent alignment, optimized title, meta description, clean URL slug, internal linking.');
  drawBullet('Social Media (10 pts): Platform-specific formatting, compelling hooks, relevant hashtags, comment engagement.');
  drawBullet('Graphics / Design (10 pts): Canva brand kit consistency, typography hierarchy, safe margins, high contrast.');
  drawBullet('Video Content (10 pts): 30-60s vertical scripts, clear voiceover, dynamic captions, zero pirated broadcast footage.');
  drawBullet('Discipline & Teamwork (15 pts): On-time daily report submission (5), stand-up participation (5), peer review (5).');

  drawHeading('30-Day Phased Progression', 12, true);
  drawParagraph('Week 1 (Days 1–7): Sports Journalism Foundation — Observe + Practice (100% Supervision). Basics of news writing, 5 Ws + H, inverted pyramid, fact-checking, and week 1 exam.');
  drawParagraph('Week 2 (Days 8–14): Content Strategy & Social Media — High supervision. Multi-channel syndication (X, FB, IG, TikTok), community management, 7-day content calendar, and week 2 exam.');
  drawParagraph('Week 3 (Days 15–21): Canva Visuals & Video Production — Moderate supervision. Sports graphics design, infographics, vertical video scripts (Reels/Shorts/TikTok), YouTube, and breaking news simulation.');
  drawParagraph('Week 4 (Days 22–30): Professional Newsroom & Independence — Light supervision to full independent operation. Live matchday coverage, audience retention, analytics review, final simulation, and portfolio certification.');

  drawBox('GOALMILLS DAILY REPORT FORMAT', 
`==================================================
STAFF NAME: [Your Name]      DATE: [YYYY-MM-DD]
TRAINING DAY (#1-30): [Day]  TODAY'S LESSON: [Topic]
--------------------------------------------------
WHAT I LEARNED:
1. [Core journalistic or technical takeaway]
2. [SOP rule applied]
CONTENT PRODUCED:
- ARTICLE URL: https://goalmills-web.vercel.app/news/...
- SOCIAL URL: https://x.com/goalmills/...
- CANVA GRAPHIC LINK: [Link]
SOURCES VERIFIED: [1. Club statement | 2. Tier-1 reporter]
WHAT WENT WELL: [Summary]
CHALLENGE / BLOCKER: [Notes]
IMPROVEMENT FOR TOMORROW: [Target]
==================================================`
  );

  // ==========================================
  // SECTION 2: BUSINESS & NICHE FOUNDATION
  // ==========================================
  addNewPage(false);
  drawHeading('Part 1 & 2: Sports Media Business & Niche Strategy', 15);
  drawParagraph('A successful sports platform is not simply a blog where articles are posted—it is a sports intelligence ecosystem and multi-channel content engine.');
  
  drawHeading('The 4 Core Assets GoalMills Builds', 12, true);
  drawBullet('Asset 1: Content Library (Evergreen guides, player profiles, statistics databases, match centers).');
  drawBullet('Asset 2: Audience (Engaged fans across website, app, newsletter, and social channels).');
  drawBullet('Asset 3: Brand Reputation (Recognized for Speed + Accuracy + Deep Analysis).');
  drawBullet('Asset 4: Owned Distribution (Direct visitors, WhatsApp broadcast, push notifications, email list).');

  drawHeading('Football-First Niche Model', 12, true);
  drawParagraph('GoalMills operates on a 70/30 sport distribution: 70% Football (European top leagues, UEFA Champions League, AFCON, Super Eagles, and Nigerian players abroad) and 30% Other major sports (Basketball/NBA, Cricket, Athletics, Tennis).');
  drawParagraph('Core Content Mix: 35% Breaking News & Transfers, 25% Evergreen SEO & Guides, 20% Matchday Coverage, 10% Deep Tactical Analysis, 10% Features & Fan Debates.');

  // ==========================================
  // SECTION 3: SOURCING & VERIFICATION
  // ==========================================
  drawHeading('Part 4: News Discovery & Verification Hierarchy', 15);
  drawParagraph('GoalMills enforces a strict 5-tier news sourcing pyramid to guarantee accuracy and build long-term reader trust.');
  drawBullet('Tier 1 (100% Trust): Official club websites, league portals, federations, verified player accounts, press conferences.');
  drawBullet('Tier 2 (High Credibility): Recognized specialist reporters (e.g. David Ornstein, Fabrizio Romano) and tier-1 sports outlets (BBC, Sky, The Athletic).');
  drawBullet('Tier 3 (Specialist Media): Secondary football blogs and aggregators (Must cross-check claims).');
  drawBullet('Tier 4 (Social Media): Leads on X/Instagram/TikTok (Strictly leads; requires independent verification).');
  drawBullet('Tier 5 (Fan Accounts/Forums): Unverified tips (Never publish as fact).');

  drawHeading('The Two-Source Rule', 12, true);
  drawParagraph('Major transfer or disciplinary claims require either ONE primary official source or TWO independent, highly reputable reports. Unconfirmed reports must be explicitly labelled as "Reports suggest..." or "Transfer Rumour" — never as a done deal.');

  // ==========================================
  // SECTION 4: PROFESSIONAL ARTICLE WRITING
  // ==========================================
  addNewPage(false);
  drawHeading('Part 5: How to Write Professional Sports Articles', 15);
  drawParagraph('Great sports writing answers "What happened?", "Why does it matter?", and "So what?". Follow the structured inverted pyramid approach.');

  drawHeading('The 3-Sentence Introduction Formula', 12, true);
  drawBullet('Sentence 1: What happened? (e.g. Arsenal defeated Chelsea 3-1 at the Emirates Stadium on Saturday.)');
  drawBullet('Sentence 2: What was the key factor? (e.g. Bukayo Saka played a decisive role after tactical adjustments at halftime.)');
  drawBullet('Sentence 3: Why does it matter? (e.g. The victory keeps Arsenal firmly in the Premier League title race while increasing pressure on Chelsea.)');

  drawHeading('Core Writing SOPs', 12, true);
  drawBullet('One Idea Per Paragraph: 2–4 short sentences per paragraph for mobile readability.');
  drawBullet('The Quote Sandwich: Context -> Direct Quote -> Tactical/Consequential Explanation.');
  drawBullet('Data With Purpose: Use statistics to prove a point (e.g. "Arsenal won 11 attacking third recoveries") rather than dumping raw numbers.');
  drawBullet('What Next Section: End every article with upcoming fixtures, table implications, and next steps.');

  drawBox('REUSABLE MATCH REPORT STRUCTURE',
`[HEADLINE: Arsenal 3-1 Chelsea: Saka Inspires Dramatic Comeback Victory]
[INTRODUCTION: 3-sentence lead with result, star performer, and table consequence]
[FIRST HALF: Early Chelsea dominance and tactical setup]
[TACTICAL TURNING POINT: How Arsenal altered pressing structure after interval]
[SECOND HALF & GOALS: Decisive strikes and key moments]
[NUMBERS THAT MATTER: 62% possession, 7 shots on target, 11 attacking recoveries]
[WHAT IT MEANS: League title race standings and tournament impact]
[WHAT'S NEXT: Upcoming derby fixture against Tottenham]`
  );

  // ==========================================
  // SECTION 5: CANVA & VISUAL BRAND SYSTEM
  // ==========================================
  addNewPage(false);
  drawHeading('Part 7 & 19: Canva Sports Graphic Design System', 15);
  drawParagraph('Every GoalMills graphic must be instantly recognizable in social feeds. Follow the Brand Kit specifications strictly.');

  drawHeading('Brand Specifications', 12, true);
  drawBullet('Primary Background: Deep Navy (#0B1220 or #001F3F)');
  drawBullet('Primary Accent: GoalMills Green (#10B981) | Alert: Red (#EF4444) | Gold: (#F59E0B)');
  drawBullet('Typography: Montserrat ExtraBold / Bebas Neue (Headlines), Inter / Montserrat (Body & Stats)');
  drawBullet('The 3-Second Rule: Headline, main subject, and score/topic must be clear in 3 seconds.');

  drawHeading('Core Master Templates', 12, true);
  drawBullet('01 Breaking News | 02 Transfer Watch | 03 Matchday Preview | 04 Starting XI Lineup');
  drawBullet('05 Goal Alert | 06 Half-Time Score | 07 Full-Time Result | 08 Player of the Match');
  drawBullet('09 Statistics Infographic | 10 Quote Card | 11 Instagram 6-Slide Carousel | 12 YouTube Thumbnail');

  // ==========================================
  // SECTION 6: VIDEO CREATION & COPYRIGHT
  // ==========================================
  drawHeading('Part 20: Sports Video Production & Copyright Laws', 15);
  drawParagraph('Produce faceless and presenter-led sports videos without copyright risks. Video is a core traffic driver for GoalMills.');

  drawHeading('30-Second Video Script Formula', 12, true);
  drawBullet('0–3s (Hook): "Arsenal just exposed Chelsea\'s biggest tactical problem."');
  drawBullet('3–10s (What Happened): "Arteta\'s side came from behind to win 3-1, but the key shift was after the break."');
  drawBullet('10–20s (Tactical Reason): "Arsenal pressed aggressively and forced 11 turnovers in the final third."');
  drawBullet('20–27s (Why It Matters): "This keeps the Gunners on top of the table with crucial momentum."');
  drawBullet('27–30s (CTA): "Follow GoalMills for daily football analysis."');

  drawHeading('Copyright Compliance', 12, true);
  drawParagraph('NEVER download and re-upload broadcast TV footage or pirated clips. Use official embed players, original narration, licensed stills, animated tactical boards, and copyright-cleared audio.');

  // ==========================================
  // SECTION 7: SEO, GOOGLE NEWS & DISCOVER
  // ==========================================
  addNewPage(false);
  drawHeading('Part 8, 11 & 12: Sports SEO & Discovery Engine', 15);
  drawParagraph('Build compounding organic traffic across Google Search, Google News, and Google Discover.');

  drawHeading('Key SEO Rules', 12, true);
  drawBullet('Search Intent: Answer whether users want instant scores, transfer updates, stats, or analysis.');
  drawBullet('Headlines & Metadata: Match H1 with page title (<60 chars) and craft compelling meta descriptions.');
  drawBullet('Structured Data: Embed Schema.org NewsArticle, SportsEvent, and BreadcrumbList markup.');
  drawBullet('Update Strategy: Update existing developing articles with timestamps rather than creating 10 duplicate thin pages.');
  drawBullet('Zero Keyword Stuffing: Write for football fans first; integrate keywords naturally.');

  // ==========================================
  // SECTION 8: MONETIZATION & NEWSROOM OPS
  // ==========================================
  drawHeading('Part 13 & 21: Monetization & Newsroom Operations', 15);
  drawParagraph('Turn audience attention into a sustainable digital sports media enterprise.');

  drawHeading('Revenue Architecture', 12, true);
  drawBullet('Programmatic Ads: Google Ad Manager with clean, non-intrusive placements.');
  drawBullet('Direct Sponsorships: Matchday Centre partners, Transfer Hub sponsors, Newsletter briefs.');
  drawBullet('Affiliate Commerce: Sportswear, official tickets, streaming platforms.');
  drawBullet('GoalMills Pro & Data API: Advanced sports analytics, ad-free experience, B2B data widgets.');

  drawHeading('The Newsroom Golden Rule', 12, true);
  drawParagraph('"Speed gets you noticed. Accuracy keeps you trusted. Originality makes you valuable. Consistency makes you grow. Never sacrifice accuracy just to be first."');

  // Save the PDF
  const pdfBytes = await pdfDoc.save();
  const outputPath = path.join(
    __dirname,
    '..',
    '..',
    'public',
    'downloads',
    'GOALMILLS-Training-Resources-&-Handbooks.pdf'
  );

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, pdfBytes);
  console.log(`Generated official PDF handbook successfully at: ${outputPath} (${pdfBytes.length} bytes)`);

  // Also sync to apps/web/public/downloads
  const webOutputPath = path.join(
    __dirname,
    '..',
    '..',
    '..',
    'web',
    'public',
    'downloads',
    'GOALMILLS-Training-Resources-&-Handbooks.pdf'
  );
  if (fs.existsSync(path.dirname(webOutputPath))) {
    fs.writeFileSync(webOutputPath, pdfBytes);
    console.log(`Synced PDF handbook to web at: ${webOutputPath}`);
  }
}

generateHandbookPdf().catch((err) => {
  console.error('Error generating PDF handbook:', err);
  process.exit(1);
});
