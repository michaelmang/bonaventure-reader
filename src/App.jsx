import { ErrorBoundary } from './modules/common/components/ErrorBoundary.jsx';
import { ReaderShell } from './modules/reader/components/ReaderShell.jsx';
import { useCollations } from './modules/reader/hooks/useCollations.js';

export default function App() {
  const { data, error } = useCollations();

  return (
    <ErrorBoundary>
      {error ? <main className="reader-error"><h1>Unable to load the reader.</h1><p>{error.message}</p></main> : null}
      {!data && !error ? <main className="reader-loading">Loading Bonaventure...</main> : null}
      {data ? <ReaderShell data={data} /> : null}
    </ErrorBoundary>
  );
}
