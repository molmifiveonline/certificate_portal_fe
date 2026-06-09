import React, { useEffect, useState, useRef } from "react";

const AnimatedCounter = ({ value, duration = 1500 }) => {
  const [count, setCount] = useState(0);
  const prevValueRef = useRef(0);

  useEffect(() => {
    const start = prevValueRef.current;
    const end = typeof value === "number" ? value : parseInt(value, 10);
    
    if (isNaN(end)) {
      setCount(value);
      return;
    }

    if (start === end) {
      setCount(end);
      return;
    }

    let startTimestamp = null;
    
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing: easeOutExpo (starts fast, ends slow and extremely smooth)
      const easedProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      const currentValue = Math.floor(start + easedProgress * (end - start));
      setCount(currentValue);
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        prevValueRef.current = end;
      }
    };
    
    const animationFrameId = window.requestAnimationFrame(step);
    
    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [value, duration]);

  return <>{count}</>;
};

export default AnimatedCounter;
