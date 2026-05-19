import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const HeroSection = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const subRef = useRef(null);
  const metaRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top center",
        toggleActions: "play none none reverse"
      }
    });

    // Animate title (words/lines stagger)
    const titleChars = titleRef.current.innerText.split(' ');
    titleRef.current.innerHTML = titleChars.map(word => `<span>${word} </span>`).join('');
    
    tl.from(titleRef.current, {
      clipPath: "inset(0 100% 0 0)",
      duration: 1,
      ease: "power3.out"
    })
    .from(titleRef.current.querySelectorAll('span'), {
      y: 60,
      opacity: 0,
      stagger: 0.1,
      duration: 0.8,
      ease: "power3.out"
    })
    .from(subRef.current, {
      y: 30,
      opacity: 0,
      duration: 0.8,
    }, "-=0.4")
    .from(metaRef.current, {
      opacity: 0,
      duration: 1,
    }, "-=0.2");

    // Parallax effect
    gsap.to(".hero-bg", {
      yPercent: 20,
      ease: "none",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });
  }, []);

  return (
    <section ref={sectionRef} className="relative overflow-hidden h-screen flex flex-col items-center justify-center text-center px-6">
      {/* Background with parallax */}
      <div className="hero-bg absolute inset-0 z-0 bg-[#121212]">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#0a0a0a]"></div>
        {/* Placeholder for background image */}
        <div className="w-full h-[120%] bg-[#1a1a1a] opacity-50"></div>
      </div>

      <div className="relative z-10">
        <div className="mb-4 mono text-sm tracking-[0.3em] text-[#0066ff]">COMPUTING / PHOTOGRAPHY</div>
        
        <h1 ref={titleRef} className="text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-tight">
          PORTRAIT<br />
          <span className="text-[#0066ff]">PHOTOGRAPHY</span>
        </h1>
        
        <p ref={subRef} className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto mb-12">
          Learn what makes a great portrait — then go and take one.
        </p>
        
        <div ref={metaRef} className="flex gap-4 mono text-xs text-white/40 justify-center">
          <span>Year 4</span>
          <span>•</span>
          <span>Computing</span>
          <span>•</span>
          <span>iPad Photography</span>
        </div>
      </div>

      {/* Decorative Brackets */}
      <div className="absolute inset-12 border-2 border-[#0066ff]/20 pointer-events-none">
        <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-[#0066ff]"></div>
        <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-[#0066ff]"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-[#0066ff]"></div>
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-[#0066ff]"></div>
      </div>
    </section>
  );
};

export default HeroSection;
