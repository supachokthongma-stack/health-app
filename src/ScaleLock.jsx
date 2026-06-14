import { useEffect, useRef, useState } from 'react';

const DESIGN_WIDTH = 1440;
const DESIGN_HEIGHT = 900;

export default function ScaleLock({ children }) {
  const stageRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [stageHeight, setStageHeight] = useState(DESIGN_HEIGHT);

  useEffect(() => {
    document.documentElement.classList.add('scale-locked');

    const updateScale = () => {
      setScale(Math.min(window.innerWidth / DESIGN_WIDTH, 1));
    };

    updateScale();
    window.addEventListener('resize', updateScale);

    return () => {
      window.removeEventListener('resize', updateScale);
      document.documentElement.classList.remove('scale-locked');
    };
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const updateHeight = () => {
      setStageHeight(Math.max(DESIGN_HEIGHT, stage.scrollHeight));
    };

    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(stage);

    return () => observer.disconnect();
  }, [children, scale]);

  const frameWidth = DESIGN_WIDTH * scale;
  const frameHeight = stageHeight * scale;

  return (
    <div className="scale-lock-viewport">
      <div
        className="scale-lock-frame"
        style={{ width: frameWidth, height: frameHeight }}
      >
        <div
          ref={stageRef}
          className="scale-lock-stage"
          style={{
            width: DESIGN_WIDTH,
            minHeight: DESIGN_HEIGHT,
            transform: `scale(${scale})`,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
