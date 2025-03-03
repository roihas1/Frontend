import React from "react";

interface PageBackgroundProps {
  imageSrc: string;
}

const PageBackground: React.FC<PageBackgroundProps> = ({ imageSrc }) => (
  <div className="absolute  inset-0 z-0 bg-cover bg-center h-full mt-4">
    <img src={imageSrc} alt="Background" className="w-full h-full object-contain opacity-40" />
  </div>
);

export default PageBackground;
