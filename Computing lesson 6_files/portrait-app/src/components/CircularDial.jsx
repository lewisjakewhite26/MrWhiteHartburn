import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const CircularDial = ({
  currentSection,
  totalSections,
  onDialClick,
}) => {
  const dialRef = useRef(null);
  const angleStep = totalSections > 0 ? 360 / totalSections : 360;

  useEffect(() => {
    if (!dialRef.current) return;
    // Rotate so the active section’s tick sits at the top indicator
    const rotation = -currentSection * angleStep;
    gsap.to(dialRef.current, {
      rotation,
      duration: 0.8,
      ease: 'power3.out',
    });
  }, [currentSection, angleStep]);

  const tickAngles = Array.from({ length: totalSections }, (_, i) => i * angleStep);
  const sectionNumbers = Array.from({ length: totalSections }, (_, i) => i + 1);

  const handleClick = () => {
    if (typeof onDialClick === 'function') onDialClick();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div className="fixed top-8 left-8 z-50 flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className="group relative flex h-32 w-32 cursor-pointer flex-col items-center justify-center rounded-full border-0 bg-transparent p-0 outline-none ring-offset-2 ring-offset-[#0a0a0a] focus-visible:ring-2 focus-visible:ring-[#0066ff]"
        aria-label={`Go to next section. Currently on section ${currentSection + 1} of ${totalSections}`}
      >
        <div className="relative h-full w-full">
          <div className="absolute inset-0 rounded-full border border-white/10 bg-white/5 shadow-2xl backdrop-blur-2xl" />

          {/* Fixed top tick / pointer */}
          <div className="absolute left-1/2 top-2 z-10 h-2 w-0.5 -translate-x-1/2 rounded-full bg-[#0066ff]" />

          <div
            ref={dialRef}
            className="absolute inset-0"
            style={{ transformOrigin: '50% 50%' }}
          >
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 144 144"
              aria-hidden
            >
              {tickAngles.map((deg, i) => (
                <line
                  key={i}
                  x1="72"
                  y1="10"
                  x2="72"
                  y2="18"
                  stroke={
                    i === currentSection ? '#0066ff' : 'rgba(255,255,255,0.3)'
                  }
                  strokeWidth={i === currentSection ? '3' : '2'}
                  strokeLinecap="round"
                  transform={`rotate(${deg} 72 72)`}
                />
              ))}
            </svg>

            <div className="absolute inset-0">
              {sectionNumbers.map((num, i) => {
                const deg = i * angleStep - 90;
                const radius = 45;
                const x = Math.cos((deg * Math.PI) / 180) * radius;
                const y = Math.sin((deg * Math.PI) / 180) * radius;
                return (
                  <span
                    key={num}
                    className={`absolute left-1/2 top-1/2 mono text-sm transition-colors duration-300 ${
                      i === currentSection
                        ? 'scale-125 font-bold text-[#0066ff]'
                        : 'text-white/30'
                    }`}
                    style={{
                      transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                    }}
                  >
                    {num}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="absolute left-1/2 top-1/2 z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[#0066ff]/50 bg-[#0a0a0a]">
            <span className="mono text-lg font-bold leading-none text-[#0066ff]">
              {currentSection + 1}
            </span>
          </div>
        </div>
      </button>
      <div className="mono text-[10px] tracking-widest text-white/40">
        SLIDE {currentSection + 1}/{totalSections}
      </div>
    </div>
  );
};

export default CircularDial;
