import { useState, useEffect } from 'react';

export default function LiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="font-mono text-3xl font-bold tracking-widest text-fg">
      {time.toLocaleTimeString('en-US', { hour12: false })}
    </span>
  );
}
