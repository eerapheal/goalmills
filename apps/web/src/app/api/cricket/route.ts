import { NextRequest, NextResponse } from 'next/server';

function getApiBaseUrl(): string {
  let raw =
    process.env.NEXT_PUBLIC_CRICKET_BASE_URL ||
    process.env.CRICKET_BASE_URL ||
    'https://apiv2.allsportsapi.com/cricket';

  raw = raw.trim();
  if (!raw.startsWith('http://') && !raw.startsWith('https://')) {
    raw = `https://${raw}`;
  }
  return raw.replace(/\/$/, '');
}

const API_KEY =
  process.env.CRICKET_API_KEY ||
  process.env.NEXT_PUBLIC_CRICKET_API_KEY ||
  process.env.ALLSPORTS_API_KEY ||
  '';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const endpointParam = searchParams.get('endpoint') || searchParams.get('met');

    if (!endpointParam) {
      return NextResponse.json(
        { error: 'Endpoint or method parameter (endpoint/met) is required' },
        { status: 400 }
      );
    }

    const baseUrlStr = getApiBaseUrl();
    const isRapidApi = baseUrlStr.includes('rapidapi.com');
    const apiUrl = new URL(baseUrlStr);

    // Build headers
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    if (isRapidApi) {
      if (API_KEY) {
        headers['x-rapidapi-key'] = API_KEY;
      }
      headers['x-rapidapi-host'] = apiUrl.host;

      if (endpointParam.includes('/')) {
        apiUrl.pathname = `/${endpointParam.replace(/^\//, '')}`;
      } else {
        apiUrl.pathname = `/cricket/v1/${endpointParam.toLowerCase()}`;
      }
    } else {
      apiUrl.searchParams.append('met', endpointParam);
      if (API_KEY) {
        apiUrl.searchParams.append('APIkey', API_KEY);
      }
    }

    // Forward all other search params
    searchParams.forEach((value: any, key: any) => {
      if (key !== 'met' && key !== 'endpoint' && value) {
        apiUrl.searchParams.append(key, value);
      }
    });


    console.log('Proxying cricket request to:', apiUrl.toString());

    let response: Response | null = null;
    try {
      response = await fetch(apiUrl.toString(), {
        method: 'GET',
        headers,
        cache: 'no-store',
      });
    } catch (fetchErr) {
      console.warn('Cricket API direct fetch error, falling back to local dataset:', fetchErr);
    }

    if (!response || !response.ok) {
      const status = response ? response.status : 502;
      console.warn(`Cricket API status ${status} for ${endpointParam}, returning empty success to trigger client fallbacks.`);
      return NextResponse.json(
        { success: 1, result: [], message: `Live feed fallback (status ${status})` },
        { status: 200 }
      );
    }


    const data = await response.json();

    // Standardize result property if API returns list or wrapped object
    const standardized = {
      success: 1,
      result: Array.isArray(data) ? data : (data.result ?? data.typeMatches ?? data.matches ?? data),
      ...(!Array.isArray(data) ? data : {}),
    };

    return NextResponse.json(standardized, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Cricket Proxy error:', error);
    // Graceful response so UI never crashes
    return NextResponse.json(
      { success: 1, result: [], message: error instanceof Error ? error.message : 'Fallback' },
      { status: 200 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
