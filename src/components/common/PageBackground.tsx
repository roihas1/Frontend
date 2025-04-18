import React from "react";

interface PageBackgroundProps {
  imageSrc: string;
}

const PageBackground: React.FC<PageBackgroundProps> = ({ imageSrc }) => (
  <div className="absolute inset-0 flex items-center justify-center z-0">
    <img src={imageSrc} alt="Background" className="w-full h-full object-contain opacity-20" />
  </div>
);

export default PageBackground;
