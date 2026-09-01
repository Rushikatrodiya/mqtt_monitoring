import React, { useEffect, useRef } from 'react';

/**
 * SVG ring that fills as time passes since lastSeenAt relative to expectedIntervalMs.
 * Green -> Amber -> Red. All math is trivial frontend arithmetic, not heavy computation.
 */
const FreshnessRing = ({ lastSeenAt, expectedIntervalMs, status }) => {
  const size = 40;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const [progress, setProgress] = React.useState(0);

  useEffect(() => {
    if (!lastSeenAt || !expectedIntervalMs || status === 'UNKNOWN') {
      setProgress(1); // Full red ring for unknown
      return;
    }

    const update = () => {
      const elapsed = Date.now() - new Date(lastSeenAt).getTime();
      const ratio = Math.min(elapsed / expectedIntervalMs, 1);
      setProgress(ratio);
    };

    update();
    const id = setInterval(update, 500);
    return () => clearInterval(id);
  }, [lastSeenAt, expectedIntervalMs, status]);

  // Color logic mirrors the watchdog: green < 50%, amber 50-100%, red >= 100%
  let color = '#3fb950'; // green
  if (status === 'OFFLINE' || status === 'UNKNOWN' || progress >= 1) {
    color = '#f85149'; // red
  } else if (progress >= 0.5) {
    color = '#d29922'; // amber
  }

  const dashOffset = circumference * (1 - progress);

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#21262d"
        strokeWidth={strokeWidth}
      />
      {/* Progress arc */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.5s linear, stroke 0.5s ease' }}
      />
    </svg>
  );
};

export default FreshnessRing;
