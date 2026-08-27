/**
 * GoalMills OpenAPI 3.1.0 Specification Definition
 * Covers all multi-sport data feeds, news, highlights, notifications, auth, and admin endpoints.
 */

export const openApiSpec = {
  openapi: '3.1.0',
  info: {
    title: 'GoalMills Multi-Sport API',
    version: '1.0.0',
    description: `
**GoalMills API Documentation**
Enterprise multi-sport data delivery engine powering Football, Cricket, Tennis, Basketball, Video Highlights, Sports Intelligence, Push Notifications, and Editorial CMS.

### Key Capabilities:
- **Live Sports Feeds**: Real-time scores, commentary, fixtures, standings, and tournament brackets.
- **Editorial & News CMS**: Rich sports journalism, tags, view analytics, and category filters.
- **High-Definition Video Highlights**: Categorized match recaps, viral clips, and player interviews.
- **Enterprise Push Notifications**: Multi-topic push broadcasts and web/mobile subscription tracking.
- **Realtime SSE Streaming**: Live event streaming directly to connected clients.
    `,
    contact: {
      name: 'GoalMills Engineering Team',
      url: 'https://goalmills.com',
      email: 'dev@goalmills.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: '/',
      description: 'Current Environment Server',
    },
    {
      url: 'https://goalmills.com',
      description: 'Production Server',
    },
  ],
  paths: {
    '/api/football': {
      get: {
        tags: ['Football'],
        summary: 'Get Football Data',
        description:
          'Fetch live matches, league fixtures by date, standings tables, top scorers, or team profiles.',
        parameters: [
          {
            name: 'type',
            in: 'query',
            required: false,
            description:
              'Type of data to retrieve (live, fixtures, standings, scorers, match, team, league)',
            schema: {
              type: 'string',
              enum: ['live', 'fixtures', 'standings', 'scorers', 'match', 'team', 'league'],
              default: 'live',
            },
          },
          {
            name: 'date',
            in: 'query',
            required: false,
            description: 'Filter fixtures by date (YYYY-MM-DD)',
            schema: { type: 'string', format: 'date' },
          },
          {
            name: 'leagueId',
            in: 'query',
            required: false,
            description: 'Filter by specific League ID (e.g. 39 for Premier League)',
            schema: { type: 'string' },
          },
          {
            name: 'teamId',
            in: 'query',
            required: false,
            description: 'Filter by specific Team ID',
            schema: { type: 'string' },
          },
          {
            name: 'matchId',
            in: 'query',
            required: false,
            description: 'Retrieve detailed match statistics by Match ID',
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Successful sports payload',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/FootballMatch' },
                    },
                    meta: {
                      type: 'object',
                      properties: {
                        timestamp: { type: 'string' },
                        source: { type: 'string', example: 'redis_cache' },
                      },
                    },
                  },
                },
              },
            },
          },
          '500': {
            description: 'Internal server error with fallback response',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },

    '/api/cricket': {
      get: {
        tags: ['Cricket'],
        summary: 'Get Cricket Match Data & Scores',
        description:
          'Fetch international & domestic cricket matches, live scorecard details, ball-by-ball commentary, and ICC rankings.',
        parameters: [
          {
            name: 'type',
            in: 'query',
            required: false,
            description:
              'Feed category (live, upcoming, recent, scorecard, commentary, rankings, player)',
            schema: {
              type: 'string',
              enum: ['live', 'upcoming', 'recent', 'scorecard', 'commentary', 'rankings', 'player'],
              default: 'live',
            },
          },
          {
            name: 'matchId',
            in: 'query',
            required: false,
            description: 'Cricket match key/id for detailed scorecard',
            schema: { type: 'string' },
          },
          {
            name: 'format',
            in: 'query',
            required: false,
            description: 'Match format filter (TEST, ODI, T20I)',
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Cricket data response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    matches: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/CricketMatch' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    '/api/tennis': {
      get: {
        tags: ['Tennis'],
        summary: 'Get Tennis Tournaments & Matches',
        description:
          'Retrieve ATP, WTA, and Grand Slam live matches, fixtures, and official world rankings.',
        parameters: [
          {
            name: 'type',
            in: 'query',
            description: 'Category (live, fixtures, results, rankings)',
            schema: { type: 'string', default: 'live' },
          },
          {
            name: 'date',
            in: 'query',
            description: 'Filter matches by date (YYYY-MM-DD)',
            schema: { type: 'string', format: 'date' },
          },
        ],
        responses: {
          '200': {
            description: 'Tennis data returned successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    matches: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/TennisMatch' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    '/api/basketball': {
      get: {
        tags: ['Basketball'],
        summary: 'Get Basketball & NBA Data',
        description:
          'Fetch live scores, game schedules, and conference standings for NBA and international basketball leagues.',
        parameters: [
          {
            name: 'type',
            in: 'query',
            description: 'Type of data (live, fixtures, standings)',
            schema: { type: 'string', default: 'live' },
          },
        ],
        responses: {
          '200': {
            description: 'Basketball match and tournament data',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { type: 'object' } },
                  },
                },
              },
            },
          },
        },
      },
    },

    '/api/news': {
      get: {
        tags: ['News & Editorial'],
        summary: 'List News Articles',
        description:
          'Search and filter editorial sports news with full-text search, categories, and tag filtering.',
        parameters: [
          {
            name: 'category',
            in: 'query',
            description: 'Filter by category name or slug (e.g. Football, Cricket, Transfers)',
            schema: { type: 'string' },
          },
          {
            name: 'search',
            in: 'query',
            description: 'Full-text keyword search across titles and article bodies',
            schema: { type: 'string' },
          },
          {
            name: 'filter',
            in: 'query',
            description: 'Special filter tab (trending, breaking, latest, popular)',
            schema: { type: 'string', default: 'all' },
          },
          {
            name: 'limit',
            in: 'query',
            description: 'Number of articles to return per page',
            schema: { type: 'integer', default: 20 },
          },
          {
            name: 'page',
            in: 'query',
            description: 'Page index for pagination',
            schema: { type: 'integer', default: 1 },
          },
        ],
        responses: {
          '200': {
            description: 'List of articles with pagination metadata',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    news: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/NewsArticle' },
                    },
                    total: { type: 'integer' },
                    page: { type: 'integer' },
                    pages: { type: 'integer' },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['News & Editorial'],
        summary: 'Create News Article',
        description:
          'Publish a new sports editorial post. Requires authenticated admin/editor role.',
        security: [{ BearerAuth: [] }, { SessionAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/NewsArticleInput' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Article published successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/NewsArticle' },
              },
            },
          },
          '401': { description: 'Unauthorized' },
        },
      },
    },

    '/api/news/{id}': {
      get: {
        tags: ['News & Editorial'],
        summary: 'Get News Article By ID / Slug',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'MongoDB ObjectId or URL slug of the article',
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Single article detail',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/NewsArticle' },
              },
            },
          },
          '404': { description: 'Article not found' },
        },
      },
      put: {
        tags: ['News & Editorial'],
        summary: 'Update News Article',
        security: [{ BearerAuth: [] }, { SessionAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/NewsArticleInput' },
            },
          },
        },
        responses: {
          '200': { description: 'Article updated successfully' },
          '401': { description: 'Unauthorized' },
        },
      },
      delete: {
        tags: ['News & Editorial'],
        summary: 'Delete News Article',
        security: [{ BearerAuth: [] }, { SessionAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': { description: 'Article deleted successfully' },
          '401': { description: 'Unauthorized' },
        },
      },
    },

    '/api/news/{id}/view': {
      post: {
        tags: ['News & Editorial'],
        summary: 'Increment Article View Count',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'View recorded',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    views: { type: 'integer', example: 1420 },
                  },
                },
              },
            },
          },
        },
      },
    },

    '/api/videos': {
      get: {
        tags: ['Video Highlights'],
        summary: 'List Video Highlights',
        description: 'Fetch video highlight reels and clips with sport filtering.',
        parameters: [
          {
            name: 'sport',
            in: 'query',
            description: 'Sport filter (football, cricket, tennis, basketball)',
            schema: { type: 'string' },
          },
          {
            name: 'featured',
            in: 'query',
            description: 'Filter only featured highlight videos',
            schema: { type: 'boolean' },
          },
        ],
        responses: {
          '200': {
            description: 'List of video highlights',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/VideoHighlight' },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Video Highlights'],
        summary: 'Add Video Highlight',
        security: [{ BearerAuth: [] }, { SessionAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/VideoHighlightInput' },
            },
          },
        },
        responses: {
          '201': { description: 'Video created' },
          '401': { description: 'Unauthorized' },
        },
      },
    },

    '/api/videos/{id}/view': {
      post: {
        tags: ['Video Highlights'],
        summary: 'Increment Video Play Count',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': { description: 'Video view logged' },
        },
      },
    },

    '/api/notifications/register': {
      post: {
        tags: ['Notifications'],
        summary: 'Register Device / Web Push Token',
        description:
          'Register Expo push token or Web Push subscription for targeted sports alerts.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['token', 'platform'],
                properties: {
                  token: { type: 'string', example: 'ExponentPushToken[xxxxxxxx]' },
                  platform: { type: 'string', enum: ['web', 'ios', 'android'] },
                  topics: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['breaking_news', 'live_matches'],
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Subscription saved successfully' },
        },
      },
    },

    '/api/notifications/history': {
      get: {
        tags: ['Notifications'],
        summary: 'Get Notification Feed',
        description: 'Retrieve recently broadcasted alerts and breaking sports bulletins.',
        responses: {
          '200': {
            description: 'Notification items',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    notifications: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/NotificationItem' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    '/api/notifications/send': {
      post: {
        tags: ['Notifications'],
        summary: 'Broadcast Push Notification',
        security: [{ BearerAuth: [] }, { SessionAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'body'],
                properties: {
                  title: { type: 'string', example: 'Goal Alert! ⚽' },
                  body: { type: 'string', example: "Arsenal 1 - 0 Chelsea (Saka 23')" },
                  topic: { type: 'string', example: 'live_matches' },
                  data: { type: 'object' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Broadcast sent' },
          '401': { description: 'Unauthorized' },
        },
      },
    },

    '/api/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'User Registration',
        description: 'Register a new GoalMills user account with email and password.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Alex Smith' },
                  email: { type: 'string', format: 'email', example: 'alex@example.com' },
                  password: { type: 'string', format: 'password', example: 'SecurePass123!' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    user: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        email: { type: 'string' },
                        role: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          '400': { description: 'Validation error or duplicate email' },
        },
      },
    },

    '/api/realtime/stream': {
      get: {
        tags: ['Realtime'],
        summary: 'Server-Sent Events (SSE) Stream',
        description:
          'Subscribe to live real-time score updates, match goals, and instant breaking news pushes.',
        responses: {
          '200': {
            description: 'Continuous text/event-stream connection',
            content: {
              'text/event-stream': {
                schema: { type: 'string' },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      SessionAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'next-auth.session-token',
      },
    },
    schemas: {
      FootballMatch: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          event_home_team: { type: 'string', example: 'Real Madrid' },
          event_away_team: { type: 'string', example: 'Barcelona' },
          event_home_team_logo: { type: 'string', format: 'uri' },
          event_away_team_logo: { type: 'string', format: 'uri' },
          event_final_result: { type: 'string', example: '2 - 1' },
          event_status: { type: 'string', example: "72'" },
          event_live: { type: 'string', example: '1' },
          league_name: { type: 'string', example: 'La Liga' },
          league_logo: { type: 'string', format: 'uri' },
          event_date: { type: 'string', format: 'date' },
          event_time: { type: 'string' },
        },
      },
      CricketMatch: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          event_home_team: { type: 'string', example: 'India' },
          event_away_team: { type: 'string', example: 'Australia' },
          event_home_final_result: { type: 'string', example: '320/6 (50 ov)' },
          event_away_final_result: { type: 'string', example: '280/9 (48.2 ov)' },
          event_status: { type: 'string', example: 'In Progress' },
          event_status_info: { type: 'string', example: 'Australia need 41 runs in 10 balls' },
          league_name: { type: 'string', example: 'ICC World Cup' },
        },
      },
      TennisMatch: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          player1: { type: 'string', example: 'Carlos Alcaraz' },
          player2: { type: 'string', example: 'Novak Djokovic' },
          score: { type: 'string', example: '6-4, 3-6, 7-6' },
          status: { type: 'string', example: 'Set 3' },
          tournament: { type: 'string', example: 'Wimbledon Final' },
        },
      },
      NewsArticle: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          title: { type: 'string', example: 'Champions League Quarterfinal Draw Announced' },
          slug: { type: 'string', example: 'champions-league-quarterfinal-draw' },
          content: { type: 'string' },
          summary: { type: 'string' },
          featuredImage: { type: 'string', format: 'uri' },
          category: { type: 'string', example: 'Football' },
          tags: { type: 'array', items: { type: 'string' } },
          readTime: { type: 'integer', example: 4 },
          views: { type: 'integer', example: 5400 },
          publishedAt: { type: 'string', format: 'date-time' },
          isBreaking: { type: 'boolean' },
          isFeatured: { type: 'boolean' },
        },
      },
      NewsArticleInput: {
        type: 'object',
        required: ['title', 'content', 'category'],
        properties: {
          title: { type: 'string' },
          content: { type: 'string' },
          summary: { type: 'string' },
          featuredImage: { type: 'string' },
          category: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
          isBreaking: { type: 'boolean' },
          isFeatured: { type: 'boolean' },
        },
      },
      VideoHighlight: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          title: {
            type: 'string',
            example: 'Manchester City vs Liverpool | All Goals & Highlights',
          },
          videoUrl: { type: 'string', format: 'uri' },
          thumbnail: { type: 'string', format: 'uri' },
          duration: { type: 'string', example: '10:24' },
          sport: { type: 'string', example: 'football' },
          views: { type: 'integer', example: 24000 },
          featured: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      VideoHighlightInput: {
        type: 'object',
        required: ['title', 'videoUrl', 'thumbnail', 'sport'],
        properties: {
          title: { type: 'string' },
          videoUrl: { type: 'string' },
          thumbnail: { type: 'string' },
          duration: { type: 'string' },
          sport: { type: 'string' },
          featured: { type: 'boolean' },
        },
      },
      NotificationItem: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          body: { type: 'string' },
          type: { type: 'string' },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: { type: 'string', example: 'Failed to fetch match records' },
        },
      },
    },
  },
};
