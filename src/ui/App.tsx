import { useRoute } from '../lib/router';
import { Kit } from './screens/Kit';

export default function App() {
  const { path } = useRoute();
  if (path.startsWith('/kit')) return <Kit />;
  return <Kit />;
}
