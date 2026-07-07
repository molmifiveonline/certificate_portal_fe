import React, { useEffect, useRef } from "react";

const AnimatedCounter = ({ value, duration = 1500 }) => {
  const nodeRef = useRef(null);
  const prevValueRef = useRef(0);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const start = prevValueRef.current;
    const end = typeof value === "number" ? value : parseInt(value, 10);
    
    if (isNaN(end)) {
      node.textContent = value;
      return;
    }

    if (start === end) {
      node.textContent = end;
      return;
    }

    let startTimestamp = null;
    let animationFrameId;
    
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing: easeOutExpo (starts fast, ends slow and extremely smooth)
      const easedProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      const currentValue = Math.floor(start + easedProgress * (end - start));
      
      if (nodeRef.current) {
        nodeRef.current.textContent = currentValue;
      }
      
      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      } else {
        prevValueRef.current = end;
      }
    };
    
    animationFrameId = window.requestAnimationFrame(step);
    
    return () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, [value, duration]);

  return <span ref={nodeRef}>{prevValueRef.current}</span>;
};

export default AnimatedCounter;
