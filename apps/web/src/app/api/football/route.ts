import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'https://apiv2.allsportsapi.com/football';
const API_KEY = 'e51b922070b6a96ce765b6dd06b992a71ab36fd777acd0d744ad281cba968770';

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
    apiUrl.searchParams.append('APIkey', API_KEY);

    // Copy all other query parameters
    searchParams.forEach((value, key) => {
      if (key !== 'met' && value) {
        apiUrl.searchParams.append(key, value);
      }
    });

    console.log('Proxying request to:', apiUrl.toString());

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
          console.warn(`API retry ${attempts}/${maxAttempts} for ${method} due to ${response.status}`);
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts)); // Exponential backoff-ish
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
      console.error('API Error:', status, statusText);
      return NextResponse.json(
        { error: `API request failed: ${status} ${statusText}` },
        { status: status }
      );
    }

    const data = await response.json();
    console.log('API Response received for method:', method);

    // Return the data with CORS headers
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
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
