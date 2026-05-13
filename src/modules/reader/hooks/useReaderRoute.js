import { useEffect, useMemo, useState } from 'react';
import { getInitialRoute, updateRoute } from '../lib/routing.js';

export function useReaderRoute(paragraphs) {
  const initialRoute = useMemo(() => getInitialRoute(paragraphs), [paragraphs]);
  const [paragraphId, setParagraphId] = useState(initialRoute.paragraphId);
  const [mode, setMode] = useState(initialRoute.mode);
  const [view, setView] = useState(initialRoute.view);

  useEffect(() => {
    function handlePopState() {
      const nextRoute = getInitialRoute(paragraphs);
      setParagraphId(nextRoute.paragraphId);
      setMode(nextRoute.mode);
      setView(nextRoute.view);
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [paragraphs]);

  function navigate(nextParagraphId) {
    setParagraphId(nextParagraphId);
    setView('reader');
    updateRoute({ paragraphId: nextParagraphId, mode, view: 'reader' });
  }

  function changeMode(nextMode) {
    setMode(nextMode);
    updateRoute({ paragraphId, mode: nextMode, view });
  }

  function changeView(nextView) {
    setView(nextView);
    updateRoute({ paragraphId, mode, view: nextView });
  }

  return { paragraphId, mode, view, navigate, changeMode, changeView };
}
