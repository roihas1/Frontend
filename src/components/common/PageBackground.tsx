import React from "react";

interface PageBackgroundProps {
  imageSrc: string;
}

const PageBackground: React.FC<PageBackgroundProps> = ({ imageSrc }) => (
  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0 flex items-center justify-center w-full h-full">
    <img src={imageSrc} alt="Background" className="w-full max-w-2xl opacity-20 object-contain" />
  </div>
);

export default PageBackground;
