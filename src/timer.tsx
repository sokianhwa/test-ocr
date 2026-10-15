import { useEffect, useRef, useState } from "react";

export default function Timer({ shouldStart = false }) {
  const [time, setTime] = useState(0);
  const intervalRef = useRef<number | null>(null);

  const start = () => {
    if (intervalRef.current !== null) return;

    intervalRef.current = window.setInterval(() => {
      setTime((t) => t + 1);
    }, 1000);
  };

  const stop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    if (shouldStart) {
      setTime(0);
      start();
    } else {
      stop();
    }
  }, [shouldStart]);

  return <h2>{time}s</h2>;
}
