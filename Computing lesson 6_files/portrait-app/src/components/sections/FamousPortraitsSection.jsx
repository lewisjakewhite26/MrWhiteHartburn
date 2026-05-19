import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import PlaceholderImage from '../PlaceholderImage';

const FamousPortraitsSection = () => {
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

    gsap.from(".famous-heading", {
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top center",
      },
      clipPath: "inset(0 100% 0 0)",
      duration: 1,
      ease: "power3.out"
    });
  }, []);

  const portraits = [
    {
      photographer: "STEVE McCURRY · 1984",
      title: "THE GIRL WITH THE GREEN EYES",
      description: "McCurry was walking through a refugee camp in Pakistan when he saw her. He had a few seconds. One shot. He never learned her name. The photograph ran on the cover of National Geographic and became one of the most recognised images ever taken. He did not set up the light. He did not ask her to pose. He just saw something true — and pressed the shutter."
    },
    {
      photographer: "YOUSUF KARSH · 1941",
      title: "THE SCOWL",
      description: "Churchill had just finished a speech. Karsh walked over, reached out, and took the cigar straight from his mouth. Churchill was furious. Karsh pressed the shutter in that exact moment. The anger, the defiance, the power — all real. Karsh said later: \"I would have been frightened, had I not been so busy.\""
    },
    {
      photographer: "ANNIE LEIBOVITZ",
      title: "THE STORYTELLER",
      description: "Leibovitz has photographed presidents, rock stars and athletes. But she always says the same thing: before you take the photo, talk to the person. Find out what matters to them. Then build the picture around that. The best portraits are not taken. They are earned."
    }
  ];

  return (
    <section ref={sectionRef} className="bg-[#0a0a0a] section-padding px-6">
      <div className="container">
        <div className="mb-16 text-center">
          <div className="mono text-sm text-[#FF9500] mb-4">INSPIRATION</div>
          <h2 className="famous-heading text-5xl md:text-6xl font-black mb-4">PHOTOGRAPHS THAT CHANGED THE WORLD</h2>
          <p className="text-white/60 max-w-2xl mx-auto">Before you pick up your iPad — look at what the professionals did.</p>
        </div>

        <div ref={cardsRef} className="grid md:grid-cols-3 gap-8">
          {portraits.map((p, i) => (
            <div key={i} className="glass group overflow-hidden flex flex-col">
              <div className="aspect-[3/4] relative">
                <PlaceholderImage text={p.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent"></div>
              </div>
              <div className="p-8 pt-0 flex-1">
                <p className="mono text-xs text-[#FF9500] mb-2">{p.photographer}</p>
                <h3 className="text-2xl font-bold mb-4">{p.title}</h3>
                <p className="text-sm text-white/70 leading-relaxed">{p.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FamousPortraitsSection;
