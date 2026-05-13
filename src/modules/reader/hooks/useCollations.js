import { useEffect, useState } from 'react';

export function useCollations() {
  const [state, setState] = useState({ data: null, error: null });

  useEffect(() => {
    let active = true;

    async function loadCollations() {
      try {
        const response = await fetch('/data/collations.json');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (active) setState({ data, error: null });
      } catch (error) {
        if (active) setState({ data: null, error });
      }
    }

    loadCollations();
    return () => {
      active = false;
    };
  }, []);

  return state;
}
