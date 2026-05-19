import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { CheckCircle2, MessageSquare } from 'lucide-react';

const SuccessCriteriaSection = () => {
  const [checked, setChecked] = useState([false, false, false, false, false]);
  const sectionRef = useRef(null);

  const criteria = [
    { label: "Framing", description: "Did I think about where to position my subject in the frame?" },
    { label: "Focus", description: "Did I tap and hold on the eyes to lock focus?" },
    { label: "Light", description: "Did I think about where the light was coming from?" },
    { label: "Expression", description: "Did I direct my subject — did I tell them how to look?" },
    { label: "Background", description: "Did I check what was behind my subject before I shot?" }
  ];

  const toggleCheck = (i) => {
    const newChecked = [...checked];
    newChecked[i] = !newChecked[i];
    setChecked(newChecked);
  };

  const progress = (checked.filter(c => c).length / criteria.length) * 100;

  useEffect(() => {
    gsap.from(".criteria-card", {
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top center",
      },
      y: 50,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out"
    });

    gsap.from(".success-heading", {
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
    <section ref={sectionRef} className="bg-[#0a0a0a] section-padding px-6 pb-32">
      <div className="container max-w-4xl">
        <div className="mb-16 text-center">
          <div className="mono text-sm text-[#0066ff] mb-4">QUALITY ASSURANCE</div>
          <h2 className="success-heading text-5xl md:text-6xl font-black mb-4">SUCCESS CRITERIA</h2>
          <p className="text-white/60">The professional photographer's checklist</p>
        </div>

        <div className="criteria-card glass p-8 mb-12">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2 mono text-xs tracking-widest text-white/70">
              <span>COMPLETION STATUS</span>
              <span className="text-[#0066ff]">{checked.filter(c => c).length} / 5</span>
            </div>
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#0066ff] to-[#FF9500] transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-4">
            {criteria.map((c, i) => (
              <button 
                key={i}
                onClick={() => toggleCheck(i)}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-4 group ${checked[i] ? 'bg-[#0066ff]/10 border-[#0066ff]/50' : 'bg-white/5 border-white/10 hover:border-[#0066ff]/30'}`}
              >
                <CheckCircle2 
                  className={`shrink-0 transition-colors ${checked[i] ? 'text-[#0066ff]' : 'text-white/20 group-hover:text-[#0066ff]/50'}`} 
                />
                <div>
                  <div className={`mono text-sm font-semibold mb-1 ${checked[i] ? 'text-[#0066ff]' : 'text-white'}`}>{c.label}</div>
                  <p className="text-sm text-white/60">{c.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="glass p-8 border-[#FF9500]/30 bg-[#FF9500]/5 flex gap-6 items-start">
          <MessageSquare className="text-[#FF9500] shrink-0" size={32} />
          <div>
            <h3 className="text-xl font-bold mb-3">Discussion</h3>
            <p className="text-white/80 leading-relaxed">
              How can editing change the mood and feeling an image gives us? What emotions do different effects create?
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SuccessCriteriaSection;
