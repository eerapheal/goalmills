/**
 * GoalMills Bot & Crawler Filtering Heuristics
 * Filters automated traffic from contaminating advertiser metrics and read statistics.
 */

const KNOWN_BOT_PATTERNS = [
  /googlebot/i,
  /bingbot/i,
  /yandexbot/i,
  /duckduckbot/i,
  /baiduspider/i,
  /twitterbot/i,
  /facebookexternalhit/i,
  /rogerbot/i,
  /linkedinbot/i,
  /embedly/i,
  /quora link preview/i,
  /showyoubot/i,
  /outbrain/i,
  /pinterest\/0\./i,
  /developers\.google\.com\/\+\/web\/snippet/i,
  /slackbot/i,
  /vkshare/i,
  /w3c_validator/i,
  /redditbot/i,
  /applebot/i,
  /whatsapp/i,
  /flipboard/i,
  /tumblr/i,
  /bitlybot/i,
  /skypeuripreview/i,
  /nuzzel/i,
  /discordbot/i,
  /qwantify/i,
  /pinterestbot/i,
  /bitrix link preview/i,
  /xing-content/i,
  /chrome-lighthouse/i,
  /headlesschrome/i,
  /phantomjs/i,
  /selenium/i,
  /puppeteer/i,
  /cypress/i,
  /playwright/i,
  /axios/i,
  /curl/i,
  /python-requests/i,
  /postmanruntime/i,
];

export interface BotCheckResult {
  isBot: boolean;
  botPattern?: string;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Evaluates whether a User-Agent string represents an automated crawler or bot.
 */
export function isCrawlerOrBot(userAgent?: string): BotCheckResult {
  if (!userAgent || typeof userAgent !== 'string' || userAgent.trim().length === 0) {
    return {
      isBot: true,
      botPattern: 'empty_user_agent',
      confidence: 'medium',
    };
  }

  const cleanUA = userAgent.trim();

  for (const pattern of KNOWN_BOT_PATTERNS) {
    if (pattern.test(cleanUA)) {
      return {
        isBot: true,
        botPattern: pattern.source,
        confidence: 'high',
      };
    }
  }

  return {
    isBot: false,
    confidence: 'high',
  };
}
