// NotFound.js
import React from 'react';

const NotFound = () => {
  return (
    <div className="bg-gradient-to-b from-black via-[#16263c] to-[#22272E] h-svh flex items-center justify-center">
      <div className="text-center flex flex-col items-center">
        <img src="/logo.png" className="w-32" alt="Logo" />
        <p className="bold text-[60px] text-[#E8E8E6]">404</p>
        <p className="text-[#ACAAA3] bold text-3xl">Page Not Found</p>
        <p className="text-[#ACAAA3] mt-8 bold text-base">
          Please check the URL for mistakes <br /> and try again.
        </p>
      </div>
    </div>
  );
};

export default NotFound;
