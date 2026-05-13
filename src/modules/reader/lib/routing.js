export function getInitialRoute(paragraphs) {
  const params = new URLSearchParams(window.location.search);
  const paragraph = params.get('p');
  const mode = params.get('mode');
  const view = params.get('view');

  return {
    paragraphId: paragraphs.some(item => item.id === paragraph) ? paragraph : paragraphs[0]?.id,
    mode: ['english', 'latin', 'parallel'].includes(mode) ? mode : 'english',
    view: view === 'authorities' ? 'authorities' : 'reader'
  };
}

export function updateRoute({ paragraphId, mode, view }) {
  const params = new URLSearchParams();
  if (view && view !== 'reader') params.set('view', view);
  if (paragraphId) params.set('p', paragraphId);
  if (mode && mode !== 'english') params.set('mode', mode);
  const url = `${window.location.pathname}${params.toString() ? `?${params}` : ''}`;
  window.history.pushState({}, '', url);
}
