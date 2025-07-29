import React, { useEffect } from 'react';

export const useMinSquareSize = (ref: React.RefObject<HTMLElement | null>) => {
  const [size, setSize] = React.useState(0);

  useEffect(() => {
    if (!ref.current) return;

    const resizeObserver = new ResizeObserver(([entry]) => {
      const { width, height } = entry!.contentRect;
      setSize(Math.min(width, height));
    });

    resizeObserver.observe(ref.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [ref]);
  return size;
};
