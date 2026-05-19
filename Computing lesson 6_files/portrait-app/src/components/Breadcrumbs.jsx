import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const Breadcrumbs = ({ sectionTitle }) => {
  const textRef = useRef(null);

  useEffect(() => {
    if (textRef.current) {
      gsap.fromTo(textRef.current, 
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }
      );
    }
  }, [sectionTitle]);

  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50">
      <div className="glass px-6 py-2 flex items-center gap-3 mono text-xs tracking-[0.2em]">
        <span className="text-white/40">COMPUTING</span>
        <span className="text-[#0066ff]">/</span>
        <span ref={textRef} className="text-white">{sectionTitle.toUpperCase()}</span>
      </div>
    </div>
  );
};

export default Breadcrumbs;
