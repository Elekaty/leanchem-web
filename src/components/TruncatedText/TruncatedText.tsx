import { useEffect, useRef, useState } from 'react';
import './TruncatedText.css';

interface TruncatedTextProps {
  text: string;
  className?: string;
  as?: 'span' | 'p' | 'div';
}

export function TruncatedText({ text, className = '', as: Tag = 'span' }: TruncatedTextProps) {
  const ref = useRef<HTMLElement>(null);
  const [truncated, setTruncated] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setTruncated(el.scrollWidth > el.clientWidth + 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text]);

  const onEnter = () => {
    if (!truncated) return;
    timer.current = window.setTimeout(() => setShowTip(true), 400);
  };

  const onLeave = () => {
    if (timer.current) window.clearTimeout(timer.current);
    setShowTip(false);
  };

  return (
    <span className="truncated-wrap" onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <Tag ref={ref as never} className={`truncated-text ${className}`.trim()}>
        {text}
      </Tag>
      {showTip ? (
        <span role="tooltip" className="truncated-tooltip">
          {text}
        </span>
      ) : null}
    </span>
  );
}
