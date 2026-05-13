import { useEffect, useState } from 'react';

export function useBible() {
  const [state, setState] = useState({ data: null, error: null });

  useEffect(() => {
    let active = true;

    async function loadBible() {
      try {
        const bibles = await Promise.all([
          fetchBible('/data/nrsv.json'),
          fetchBible('/data/kjv-1611.json')
        ]);

        if (active) setState({ data: { bibles: bibles.filter(Boolean) }, error: null });
      } catch (error) {
        if (active) setState({ data: null, error });
      }
    }

    loadBible();
    return () => {
      active = false;
    };
  }, []);

  return state;
}

async function fetchBible(url) {
  const response = await fetch(url);
  if (!response.ok) return null;
  return response.json();
}
