/**
 * GoalMills Social Engine — AI Text Generator
 *
 * Generates engaging, professional sports journalism captions and reports
 * using the Google Gemini API (free tier).
 *
 * Includes robust fallback template generators to ensure publishing
 * NEVER fails even when rate-limited or if an API key is missing.
 */

import axios from 'axios';
import { logger } from '../utils/logger';

const GEMINI_API_KEY = () => process.env.GEMINI_API_KEY || '';
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

/**
 * Call the Gemini 1.5 Flash API with custom prompt.
 */
async function callGemini(prompt: string): Promise<string | null> {
  const apiKey = GEMINI_API_KEY();
  if (!apiKey) {
    return null;
  }

  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${apiKey}`,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        },
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 12000,
      }
    );

    const candidates = response.data?.candidates;
    if (candidates && candidates.length > 0) {
      const generatedText = candidates[0].content?.parts?.[0]?.text;
      if (generatedText) {
        return generatedText.trim();
      }
    }
    return null;
  } catch (err: any) {
    logger.warn('Gemini API call failed, falling back to journalistic template engine', {
      error: err.response?.data?.error?.message || err.message,
    });
    return null;
  }
}

/**
 * Generate weekly fixtures social post preview.
 */
export async function generateWeeklyFixturesPreview(
  leagueName: string,
  fixtures: Array<{ homeTeam: string; awayTeam: string; date: string; time: string }>
): Promise<string> {
  const fixtureListText = fixtures
    .slice(0, 6)
    .map((f) => `• ${f.homeTeam} vs ${f.awayTeam} (${f.date} ${f.time})`)
    .join('\n');

  const prompt = `
You are a senior sports journalist for GoalMills.
Write an energetic and engaging social media post (under 180 words) announcing this week's ${leagueName} fixtures.
Key matches:
${fixtureListText}

Requirements:
- Highlight the biggest headline clash
- Encourage fans to share predictions in comments
- Keep formatting clean with sports emojis (⚽, 🔥, 🏆)
- End with 3-4 popular hashtags including #GoalMills and #${leagueName.replace(/\s+/g, '')}
`;

  const aiText = await callGemini(prompt);
  if (aiText) return aiText;

  // Fallback template
  return (
    `📅 MATCHWEEK PREVIEW | ${leagueName.toUpperCase()}\n\n` +
    `Another thrilling round of ${leagueName} action awaits! Here are the headline fixtures to watch:\n\n` +
    fixtures
      .slice(0, 5)
      .map((f) => `⚔️ ${f.homeTeam} vs ${f.awayTeam} — ${f.date} (${f.time} GMT)`)
      .join('\n') +
    `\n\n💬 Who are you backing this weekend? Drop your predictions below!\n\n` +
    `#GoalMills #${leagueName.replace(/\s+/g, '')} #Football #PremierLeague #Matchday`
  );
}

/**
 * Generate Pre-Match Preview (2 days before kickoff).
 */
export async function generatePreMatchReport(data: {
  homeTeam: string;
  awayTeam: string;
  league: string;
  h2hRecord?: any;
  standings?: any;
  eventDate?: string;
  eventTime?: string;
}): Promise<string> {
  const prompt = `
You are an expert football analyst for GoalMills.
Write a concise, compelling pre-match analysis (max 180 words) for:
${data.homeTeam} vs ${data.awayTeam} in the ${data.league}.
Match Date: ${data.eventDate || 'Upcoming'} ${data.eventTime ? `at ${data.eventTime} GMT` : ''}.
${data.h2hRecord ? `H2H context: ${JSON.stringify(data.h2hRecord).slice(0, 200)}` : ''}

Guidelines:
- Discuss tactical stakes and current team momentum
- Give an informed score prediction
- Use a punchy, professional sports journalism voice
- Include relevant hashtags: #GoalMills #${data.homeTeam.replace(/\s+/g, '')} #${data.awayTeam.replace(/\s+/g, '')}
`;

  const aiText = await callGemini(prompt);
  if (aiText) return aiText;

  // Deterministic fallback
  return (
    `⚔️ PRE-MATCH PREVIEW | ${data.homeTeam} vs ${data.awayTeam}\n\n` +
    `All eyes are on this monumental ${data.league} showdown! ${data.homeTeam} host ${data.awayTeam} in a clash where points are at an absolute premium.\n\n` +
    `Both managers know that tactical discipline and clinical finishing in front of goal will decide the contest.\n\n` +
    `🔮 Prediction: A tense, high-intensity battle with fine margins separating the two sides.\n\n` +
    `#GoalMills #${data.homeTeam.replace(/\s+/g, '')} #${data.awayTeam.replace(/\s+/g, '')} #${data.league.replace(/\s+/g, '')}`
  );
}

/**
 * Generate Halftime Tactical Analysis & Reaction.
 */
export async function generateHalftimeAnalysis(data: {
  homeTeam: string;
  awayTeam: string;
  score: string;
  scorers?: any[];
  stats?: any[];
  league: string;
}): Promise<string> {
  const scorersText =
    data.scorers && data.scorers.length > 0
      ? data.scorers.map((s) => `${s.player || s.score} (${s.time}')`).join(', ')
      : 'None';

  const prompt = `
You are a live football commentator for GoalMills.
Write a fast, sharp halftime reaction (under 120 words) for:
${data.homeTeam} ${data.score} ${data.awayTeam} (${data.league}).
Goals so far: ${scorersText}.

Tone: High energy, urgent, tactical insight into what the losing or trailing team must adjust in the second half.
Include #GoalMills and match hashtags.
`;

  const aiText = await callGemini(prompt);
  if (aiText) return aiText;

  return (
    `⏱️ HALF-TIME | ${data.homeTeam} ${data.score} ${data.awayTeam}\n\n` +
    `The referee blows for the interval! 45 minutes of breathless football in the ${data.league}.\n\n` +
    (data.score !== '0 - 0'
      ? `Goal action has electrified the stadium, and the second half promises even more drama!`
      : `Deadlocked at the break, but both sides have had their moments. Who will make the decisive tactical substitution?`) +
    `\n\n💬 What changes does your team need to make in the 2nd half?\n\n` +
    `#GoalMills #HalfTime #${data.homeTeam.replace(/\s+/g, '')} #${data.awayTeam.replace(/\s+/g, '')}`
  );
}

/**
 * Generate Fulltime Scorecard Recap.
 */
export async function generateFulltimeRecap(data: {
  homeTeam: string;
  awayTeam: string;
  score: string;
  halfTimeScore?: string;
  scorers?: any[];
  stats?: any[];
  league: string;
}): Promise<string> {
  const prompt = `
You are a senior sports journalist for GoalMills.
Write a captivating fulltime match summary (under 140 words) for:
${data.homeTeam} ${data.score} ${data.awayTeam} (${data.league}).
Half-time was: ${data.halfTimeScore || 'N/A'}.

Requirements:
- Summarize the final verdict and what this means for both teams
- Emphasize player heroics or defensive grit
- Include final scoreline prominently
- Add 3-4 hashtags including #GoalMills #FullTime
`;

  const aiText = await callGemini(prompt);
  if (aiText) return aiText;

  return (
    `🏁 FULL-TIME | ${data.homeTeam} ${data.score} ${data.awayTeam}\n\n` +
    `It's all over! The final whistle sounds on a captivating 90 minutes of ${data.league} football.\n\n` +
    `A crucial result with massive implications for the league standings. Both squads gave everything on the pitch today.\n\n` +
    `📊 Check out the full match stats and breakdown on goalmills.com!\n\n` +
    `#GoalMills #FullTime #${data.homeTeam.replace(/\s+/g, '')} #${data.awayTeam.replace(/\s+/g, '')} #${data.league.replace(/\s+/g, '')}`
  );
}

/**
 * Generate Comprehensive Post-Match Tactical Report (30 mins after FT).
 */
export async function generatePostMatchReport(data: {
  homeTeam: string;
  awayTeam: string;
  score: string;
  halfTimeScore?: string;
  scorers?: any[];
  stats?: any[];
  league: string;
}): Promise<string> {
  const prompt = `
You are the chief football correspondent for GoalMills.
Write an authoritative, analytical post-match match report (200-240 words) for:
${data.homeTeam} ${data.score} ${data.awayTeam} (${data.league}).

Structure:
1. Opening sentence summarizing the drama and significance of the outcome.
2. Tactical analysis: How the winning team dismantled the opposition or why the draw was fair.
3. Man of the Match recognition.
4. League table impact.
5. GoalMills call-to-action: "Read the full in-depth tactical analysis on goalmills.com".
Include #GoalMills and team tags.
`;

  const aiText = await callGemini(prompt);
  if (aiText) return aiText;

  return (
    `📰 POST-MATCH TACTICAL REPORT | ${data.homeTeam} vs ${data.awayTeam}\n\n` +
    `A fiercely contested encounter concluded with ${data.homeTeam} ${data.score} ${data.awayTeam} in what was a tactical masterclass in the ${data.league}.\n\n` +
    `From the opening exchanges, the tempo was relentless. The key battles in midfield dictated the rhythm of play, while clinical decision-making in the final third proved decisive.\n\n` +
    `This result reshapes the top-flight landscape as the race for European spots and silverware heats up.\n\n` +
    `🔗 Dive deeper into the tactical chalkboard, player ratings, and heatmaps on goalmills.com.\n\n` +
    `#GoalMills #MatchReport #${data.homeTeam.replace(/\s+/g, '')} #${data.awayTeam.replace(/\s+/g, '')} #${data.league.replace(/\s+/g, '')}`
  );
}
