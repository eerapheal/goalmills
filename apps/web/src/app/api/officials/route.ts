import { NextResponse } from 'next/server';

export async function GET() {
  const officials = [
    {
      name: 'Michael Oliver',
      country: 'England',
      matches: 245,
      image: 'https://ui-avatars.com/api/?name=Michael+Oliver&background=random&size=200',
      yellowCards: 1234,
      redCards: 89,
    },
    {
      name: 'Anthony Taylor',
      country: 'England',
      matches: 198,
      image: 'https://ui-avatars.com/api/?name=Anthony+Taylor&background=random&size=200',
      yellowCards: 987,
      redCards: 67,
    },
    {
      name: 'Björn Kuipers',
      country: 'Netherlands',
      matches: 312,
      image: 'https://ui-avatars.com/api/?name=Bjorn+Kuipers&background=random&size=200',
      yellowCards: 1567,
      redCards: 102,
    },
    {
      name: 'Daniele Orsato',
      country: 'Italy',
      matches: 267,
      image: 'https://ui-avatars.com/api/?name=Daniele+Orsato&background=random&size=200',
      yellowCards: 1345,
      redCards: 95,
    },
    {
      name: 'Clément Turpin',
      country: 'France',
      matches: 189,
      image: 'https://ui-avatars.com/api/?name=Clement+Turpin&background=random&size=200',
      yellowCards: 876,
      redCards: 54,
    },
  ];
  return NextResponse.json({ success: 1, result: officials });
}
