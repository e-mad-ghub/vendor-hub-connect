import React from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollToTop: React.FC = () => {
  const location = useLocation();
  const prevPathnameRef = React.useRef(location.pathname);

  React.useEffect(() => {
    if (prevPathnameRef.current === location.pathname) {
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    prevPathnameRef.current = location.pathname;
  }, [location.pathname]);

  return null;
};
