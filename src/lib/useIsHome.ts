import { useEffect, useState } from 'react';

export function useIsHome() {
  const [home, setHome] = useState<boolean>(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    const path = typeof window !== 'undefined' ? window.location.pathname : '/';
    return hash === '' || hash === '#/' || path === '/';
  });

  useEffect(() => {
    const update = () => {
      const hash = window.location.hash;
      const path = window.location.pathname;
      setHome(hash === '' || hash === '#/' || path === '/');
    };

    update();
    window.addEventListener('hashchange', update);
    window.addEventListener('popstate', update);

    return () => {
      window.removeEventListener('hashchange', update);
      window.removeEventListener('popstate', update);
    };
  }, []);

  return home;
}
