import { useEffect, useState } from 'react';

/**
 * Whether content is scrolled under the top bar, and whether there is more
 * content under the bottom bar. Used to show a scroll-edge line only where
 * floating chrome actually overlaps content.
 */
export function useScrollEdges() {
  const [edges, setEdges] = useState({ top: false, bottom: true });
  useEffect(() => {
    let frame = 0;
    const read = () => {
      frame = 0;
      const doc = document.documentElement;
      const top = window.scrollY > 2;
      const bottom = window.scrollY + window.innerHeight < doc.scrollHeight - 2;
      setEdges((e) => (e.top === top && e.bottom === bottom ? e : { top, bottom }));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    const ro = new ResizeObserver(onScroll);
    ro.observe(document.body);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      ro.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);
  return edges;
}
