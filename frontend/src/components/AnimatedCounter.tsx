import React, { useEffect, useState } from 'react';

interface AnimatedCounterProps {
  to: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  decimals?: number;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  to,
  suffix = '',
  prefix = '',
  duration = 1400,
  decimals = 0
}) => {
  const [val, setVal] = useState(0);

  useEffect(() => {
    let animId = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      // Cubic ease-out
      const easeVal = 1 - Math.pow(1 - progress, 3);
      const current = to * easeVal;
      setVal(Number(current.toFixed(decimals)));

      if (progress < 1) {
        animId = requestAnimationFrame(tick);
      }
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [to, duration, decimals]);

  return (
    <span>
      {prefix}
      {decimals > 0 ? val.toFixed(decimals) : Math.round(val).toLocaleString()}
      {suffix}
    </span>
  );
};
