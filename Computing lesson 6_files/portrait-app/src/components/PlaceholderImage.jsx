import React from 'react';

const PlaceholderImage = ({ text, className = "" }) => {
  return (
    <div className={`relative w-full h-full bg-[#1a1a1a] flex items-center justify-center corner-brackets ${className}`}>
      <span className="mono text-xs text-muted">{text || 'Image Placeholder'}</span>
    </div>
  );
};

export default PlaceholderImage;
