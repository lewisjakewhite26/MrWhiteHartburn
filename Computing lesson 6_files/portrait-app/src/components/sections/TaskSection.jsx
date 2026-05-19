import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Eye, Zap, Palette } from 'lucide-react';
import PlaceholderImage from '../PlaceholderImage';

const TaskSection = () => {
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

    gsap.from(".task-heading", {
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top center",
      },
      clipPath: "inset(0 100% 0 0)",
      duration: 1,
      ease: "power3.out"
    });
  }, []);

  const styles = [
    {
      title: "The Direct Link",
      subtitle: "THE 'STARE'",
      icon: <Eye size={24} className="text-[#0066ff]" />,
      pose: "Your subject should look straight at the camera. Try a calm face or a small smile—no big 'cheese' smiles!",
      technical: "Remember to lock the focus on the eyes (tap and hold).",
      framing: "Put the eyes in the top third of your photo. Make sure there's good space above the head."
    },
    {
      title: "The Story Scene",
      subtitle: "THE 'CONTEXT'",
      icon: <Zap size={24} className="text-[#FF9500]" />,
      pose: "Take a photo of your subject in a place that shows what they like (playground, classroom, library, art area).",
      technical: "Move closer or further away to get the right distance. Include things in the background that help tell the story.",
      framing: "Think about what's behind your subject—the background helps tell their story."
    },
    {
      title: "The Artistic Emotion",
      subtitle: "THE 'MOOD'",
      icon: <Palette size={24} className="text-[#0066ff]" />,
      pose: "Ask your subject to show a strong feeling just with their face—happy, curious, mysterious, or serious.",
      technical: "Use the brightness slider (sun icon). Slide down for dark and mysterious, up for bright and happy.",
      framing: "Let the brightness help show the feeling."
    }
  ];

  return (
    <section ref={sectionRef} className="bg-[#0a0a0a] section-padding px-6">
      <div className="container">
        <div className="mb-16 text-center">
          <div className="mono text-sm text-[#0066ff] mb-4">YOUR MISSION</div>
          <h2 className="task-heading text-5xl md:text-6xl font-black mb-4">CHOOSE YOUR STYLE</h2>
          <p className="text-white/60 max-w-2xl mx-auto">Choose one portrait style. You are the photographer. Your subject is someone in this room.</p>
        </div>

        <div ref={cardsRef} className="grid md:grid-cols-3 gap-8">
          {styles.map((s, i) => (
            <div key={i} className="glass group overflow-hidden flex flex-col">
              <div className="aspect-[3/4] relative">
                <PlaceholderImage text={s.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent"></div>
              </div>
              <div className="p-8 pt-4 flex-1">
                <div className="flex items-center gap-3 mb-6">
                  {s.icon}
                  <div>
                    <h3 className="text-xl font-bold">{s.title}</h3>
                    <p className="mono text-[10px] text-[#0066ff]">{s.subtitle}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="mono text-[10px] text-white/40 mb-1">THE POSE</p>
                    <p className="text-sm text-white/80">{s.pose}</p>
                  </div>
                  <div>
                    <p className="mono text-[10px] text-white/40 mb-1">TECHNICAL</p>
                    <p className="text-sm text-white/80">{s.technical}</p>
                  </div>
                  <div>
                    <p className="mono text-[10px] text-white/40 mb-1">FRAMING</p>
                    <p className="text-sm text-white/80">{s.framing}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TaskSection;
