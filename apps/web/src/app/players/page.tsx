import { permanentRedirect } from 'next/navigation';

export default function PlayersRedirectPage() {
  permanentRedirect('/football/players');
}
