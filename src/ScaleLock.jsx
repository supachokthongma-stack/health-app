import { useEffect, useState } from 'react';

const DESIGN_WIDTH = 1440;
const DESIGN_HEIGHT = 900;

export default function ScaleLock({ children }) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    document.documentElement.classList.add('scale-locked');

    const updateScale = () => {
      const scaleX = window.innerWidth / DESIGN_WIDTH;
      const scaleY = window.innerHeight / DESIGN_HEIGHT;
      setScale(Math.min(scaleX, scaleY));
    };

    updateScale();
    window.addEventListener('resize', updateScale);

    return () => {
      window.removeEventListener('resize', updateScale);
      document.documentElement.classList.remove('scale-locked');
    };
  }, []);

  const frameWidth = DESIGN_WIDTH * scale;
  const frameHeight = DESIGN_HEIGHT * scale;

  return (
    <div className="scale-lock-viewport">
      <div
        className="scale-lock-frame"
        style={{ width: frameWidth, height: frameHeight }}
      >
        <div
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
