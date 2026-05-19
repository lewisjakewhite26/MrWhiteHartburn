import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Lock, Sun, Move, Maximize, X } from 'lucide-react';
import PlaceholderImage from '../PlaceholderImage';

const AEAFDemo = () => {
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [locked, setLocked] = useState(false);

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPos({ x, y });
    setLocked(true);
    setTimeout(() => setLocked(false), 2000);
  };

  return (
    <div className="relative aspect-video rounded-xl overflow-hidden cursor-crosshair" onClick={handleClick}>
      <PlaceholderImage text="Tap to focus" className={locked ? '' : 'blur-sm'} />
      <div 
        className="absolute border-2 border-yellow-400 w-12 h-12 -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
        style={{ left: `${pos.x}%`, top: `${pos.y}%`, opacity: locked ? 1 : 0.3 }}
      >
        {locked && <div className="absolute -top-6 left-0 mono text-[10px] text-yellow-400 font-bold">AE/AF LOCK</div>}
      </div>
    </div>
  );
};

const ExposureDemo = () => {
  const [exposure, setExposure] = useState(1);
  return (
    <div className="relative aspect-video rounded-xl overflow-hidden">
      <div 
        className="absolute inset-0 transition-all duration-300" 
        style={{ filter: `brightness(${1 + exposure * 0.5})` }}
      >
        <PlaceholderImage text="Adjust brightness" />
      </div>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 bg-black/60 p-2 rounded-full backdrop-blur-md">
        <Sun size={16} className="text-[#FF9500]" />
        <input 
          type="range" 
          min="-1" max="1" step="0.1" 
          value={exposure} 
          onChange={(e) => setExposure(parseFloat(e.target.value))}
          className="h-32 accent-[#FF9500]"
          style={{ appearance: 'slider-vertical', writingMode: 'bt' }}
        />
        <div className="mono text-[10px] text-white/60">{exposure > 0 ? `+${exposure}` : exposure}</div>
      </div>
    </div>
  );
};

const HeadroomDemo = () => {
  const [grid, setGrid] = useState(true);
  return (
    <div className="relative aspect-video rounded-xl overflow-hidden">
      <PlaceholderImage text="Framing demo" />
      {grid && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="border border-white/20"></div>
            ))}
          </div>
          <div className="absolute top-1/3 left-0 w-full h-[1px] bg-[#0066ff] shadow-[0_0_10px_#0066ff]"></div>
        </div>
      )}
      <button 
        onClick={() => setGrid(!grid)}
        className="absolute bottom-4 right-4 glass p-2 text-xs mono text-[#0066ff]"
      >
        TOGGLE GRID
      </button>
    </div>
  );
};

const ToolkitSection = () => {
  const sectionRef = useRef(null);
  const cardsRef = useRef(null);

  useEffect(() => {
    gsap.from(cardsRef.current.children, {
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top center",
      },
      y: 100,
      opacity: 0,
      stagger: 0.15,
      duration: 0.8,
      ease: "power3.out"
    });

    gsap.from(".toolkit-heading", {
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top center",
      },
      clipPath: "inset(0 100% 0 0)",
      duration: 1,
      ease: "power3.out"
    });
  }, []);

  return (
    <section ref={sectionRef} className="bg-[#0a0a0a] section-padding px-6">
      <div className="container">
        <div className="mb-16 text-center">
          <div className="mono text-sm text-[#0066ff] mb-4">PART 1 / THE CAPTURE</div>
          <h2 className="toolkit-heading text-5xl md:text-6xl font-black mb-4">THE TOOLKIT</h2>
          <p className="text-white/60 max-w-2xl mx-auto">Three essential iPad camera controls to master professional portrait photography.</p>
        </div>

        <div ref={cardsRef} className="grid md:grid-cols-3 gap-8">
          {/* AE/AF Card */}
          <div className="glass p-8 hover:border-[#0066ff]/50 transition-all group">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-[#0066ff]/20 text-[#0066ff] group-hover:scale-110 transition-transform">
              <Lock size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-2">AE/AF LOCK</h3>
            <p className="mono text-xs text-[#FF9500] mb-4">Focus & Exposure Lock</p>
            <p className="text-sm text-white/70 mb-6 leading-relaxed">Tap and hold on your subject's eyes to keep them sharp and clear. Look for the yellow box!</p>
            <AEAFDemo />
            <div className="mt-4 p-3 rounded bg-[#0066ff]/5 border border-[#0066ff]/20 mono text-[10px] text-[#0066ff]">
              THIS KEEPS YOUR PHOTO FROM GETTING BLURRY
            </div>
          </div>

          {/* Exposure Card */}
          <div className="glass p-8 hover:border-[#0066ff]/50 transition-all group">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-[#0066ff] text-white shadow-lg shadow-[#0066ff]/50 group-hover:scale-110 transition-transform">
              <Sun size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-2">BRIGHTNESS</h3>
            <p className="mono text-xs text-[#FF9500] mb-4">Exposure Slider</p>
            <p className="text-sm text-white/70 mb-6 leading-relaxed">Slide the sun icon up to make your picture brighter, or down to make it darker and moody.</p>
            <ExposureDemo />
            <div className="mt-4 p-3 rounded bg-[#0066ff]/5 border border-[#0066ff]/20 mono text-[10px] text-[#0066ff]">
              MATCH THE LIGHT TO THE MOOD
            </div>
          </div>

          {/* Headroom Card */}
          <div className="glass p-8 hover:border-[#0066ff]/50 transition-all group">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-[#0066ff]/20 text-[#0066ff] group-hover:scale-110 transition-transform">
              <Move size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-2">HEADROOM</h3>
            <p className="mono text-xs text-[#FF9500] mb-4">Framing & Composition</p>
            <p className="text-sm text-white/70 mb-6 leading-relaxed">Leave space above the head. Try to put eyes in the top third of your picture.</p>
            <HeadroomDemo />
            <div className="mt-4 p-3 rounded bg-[#0066ff]/5 border border-[#0066ff]/20 mono text-[10px] text-[#0066ff]">
              GOOD SPACING MAKES PHOTOS LOOK PROFESSIONAL
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ToolkitSection;
