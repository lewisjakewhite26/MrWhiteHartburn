import React, { useState, useEffect, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './App.css';

// Components
import CircularDial from './components/CircularDial';
import Breadcrumbs from './components/Breadcrumbs';
import UIOverlay from './components/UIOverlay';
import HeroSection from './components/sections/HeroSection';
import ToolkitSection from './components/sections/ToolkitSection';
import FamousPortraitsSection from './components/sections/FamousPortraitsSection';
import TaskSection from './components/sections/TaskSection';
import SuccessCriteriaSection from './components/sections/SuccessCriteriaSection';

gsap.registerPlugin(ScrollTrigger);

function getSectionElements() {
  return gsap.utils.toArray('main > section');
}

function getIndexFromScrollCenter(sectionEls) {
  if (!sectionEls.length) return 0;
  const centerY = window.scrollY + window.innerHeight / 2;
  let best = 0;
  let bestDist = Infinity;

  sectionEls.forEach((section, i) => {
    const top = section.offsetTop;
    const bottom = top + section.offsetHeight;
    if (centerY >= top && centerY <= bottom) {
      const mid = (top + bottom) / 2;
      const d = Math.abs(centerY - mid);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    }
  });

  if (bestDist !== Infinity) return best;

  const first = sectionEls[0];
  const last = sectionEls[sectionEls.length - 1];
  if (centerY < first.offsetTop) return 0;
  if (centerY > last.offsetTop + last.offsetHeight) return sectionEls.length - 1;

  sectionEls.forEach((section, i) => {
    const mid = section.offsetTop + section.offsetHeight / 2;
    const d = Math.abs(centerY - mid);
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  });
  return best;
}

function App() {
  const [currentSection, setCurrentSection] = useState(0);
  const sections = [
    { title: 'Introduction', component: HeroSection },
    { title: 'The Toolkit', component: ToolkitSection },
    { title: 'Famous Portraits', component: FamousPortraitsSection },
    { title: 'The Task', component: TaskSection },
    { title: 'Success Criteria', component: SuccessCriteriaSection },
  ];

  const clampSection = useCallback(
    (i) => Math.max(0, Math.min(sections.length - 1, i)),
    [sections.length]
  );

  const syncSectionFromScroll = useCallback(() => {
    const els = getSectionElements();
    if (!els.length) return;
    setCurrentSection((prev) => {
      const next = getIndexFromScrollCenter(els);
      return next === prev ? prev : next;
    });
  }, []);

  useEffect(() => {
    gsap.defaults({
      ease: 'power3.out',
      duration: 0.8,
    });

    const sectionEls = getSectionElements();
    const triggers = sectionEls.map((section, i) =>
      ScrollTrigger.create({
        trigger: section,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => setCurrentSection(clampSection(i)),
        onEnterBack: () => setCurrentSection(clampSection(i)),
      })
    );

    const onRefresh = () => syncSectionFromScroll();
    ScrollTrigger.addEventListener('refresh', onRefresh);

    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      syncSectionFromScroll();
    });

    return () => {
      ScrollTrigger.removeEventListener('refresh', onRefresh);
      triggers.forEach((t) => t.kill());
    };
  }, [clampSection, syncSectionFromScroll]);

  const handleDialClick = useCallback(() => {
    const sectionEls = getSectionElements();
    if (!sectionEls.length) return;
    const next = (currentSection + 1) % sectionEls.length;
    sectionEls[next].scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [currentSection]);

  const safeIndex = clampSection(currentSection);

  return (
    <div className="app-container">
      <CircularDial
        currentSection={safeIndex}
        totalSections={sections.length}
        onDialClick={handleDialClick}
      />
      <Breadcrumbs sectionTitle={sections[safeIndex].title} />
      <UIOverlay classLabel="YEAR 4" />

      <main>
        {sections.map((S, i) => (
          <S.component key={i} />
        ))}
      </main>
    </div>
  );
}

export default App;
