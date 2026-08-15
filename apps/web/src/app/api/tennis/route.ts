import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'https://apiv2.allsportsapi.com/tennis';
const API_KEY = process.env.ALLSPORTS_API_KEY;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const method = searchParams.get('met');

    if (!method) {
      return NextResponse.json(
        { error: 'Method parameter (met) is required' },
        { status: 400 }
      );
    }

    // Build the API URL with all query parameters
    const apiUrl = new URL(API_BASE_URL);
    apiUrl.searchParams.append('met', method);

    // Some endpoints in Tennis API require mandatory parameters other than APIkey
    // OddsLive and Odds usually require matchId, leagueId, or a date range.
    // If called without any of these, they often return 500.
    if ((method === 'OddsLive' || method === 'Odds') && 
        !searchParams.get('matchId') && 
        !searchParams.get('leagueId') && 
        !searchParams.get('from')) {
      console.warn(`Tennis API: Skipping ${method} due to missing mandatory parameters (matchId, leagueId, or date range)`);
      return NextResponse.json(
        { success: 1, result: method === 'Odds' ? {} : [], message: 'Mandatory parameters missing, skipping external call' },
        { status: 200 }
      );
    }

    if (!API_KEY) {
      return NextResponse.json(
        { error: 'API Key is not configured' },
        { status: 500 }
      );
    }
    apiUrl.searchParams.append('APIkey', API_KEY);

    // Copy all other query parameters
    searchParams.forEach((value, key) => {
      if (key !== 'met' && value) {
        apiUrl.searchParams.append(key, value);
      }
    });

    console.log('Proxying tennis request to:', apiUrl.toString());

    // Make the request to the external API with retries
    let response;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        attempts++;
        response = await fetch(apiUrl.toString(), {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          cache: 'no-store',
        });

        if (response.ok) break;
        
        // If 500, wait and retry
        if (response.status >= 500 && attempts < maxAttempts) {
          console.warn(`Tennis API retry ${attempts}/${maxAttempts} for ${method} due to ${response.status}`);
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
          continue;
        }
        
        break; // Don't retry 4xx errors
      } catch (err) {
        if (attempts >= maxAttempts) throw err;
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }
    }

    if (!response || !response.ok) {
      const status = response ? response.status : 500;
      const statusText = response ? response.statusText : 'Fetch failed';
      console.error('Tennis API Error:', status, statusText);
      
      // If the external API fails with 500, return a graceful empty response
      // to avoid crashing the whole frontend screen.
      if (status >= 500) {
        return NextResponse.json(
          { success: 1, result: [], message: 'External API error (graceful fallback)' },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { error: `API request failed: ${status} ${statusText}` },
        { status: status }
      );
    }

    const data = await response.json();
    
    // Return the data with CORS headers
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Tennis Proxy error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
