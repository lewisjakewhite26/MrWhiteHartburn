import React from 'react';
import { ChevronLeft } from 'lucide-react';

const UIOverlay = ({ classLabel = "YEAR 4" }) => {
  return (
    <div className="fixed top-8 right-8 z-50 flex items-center gap-4">
      <button className="glass px-4 py-2 flex items-center gap-2 mono text-sm font-semibold text-[#0066ff] hover:bg-[#0066ff]/10 transition-colors">
        <ChevronLeft size={16} />
        BACK
      </button>
      <div className="glass px-4 py-2 mono text-sm font-semibold text-[#0066ff]">
        {classLabel}
      </div>
    </div>
  );
};

export default UIOverlay;
