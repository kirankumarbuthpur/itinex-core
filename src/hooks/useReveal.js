import { useEffect, useRef, useState } from "react";

export function useReveal({ threshold = 0.15, rootMargin = "0px 0px -10% 0px" } = {}) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || shown) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [shown, threshold, rootMargin]);

  return { ref, shown };
}
