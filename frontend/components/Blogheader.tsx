import React from "react";

const Blogheader = () => {
  return (
    <div className="flex flex-col items-center justify-center mt-20 text-center">
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
        Be the change.{" "}
        <span className="text-green-600">Earn Your Impact</span>
      </h1>
      <p className="mt-4 text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 max-w-2xl">
        Join our community of volunteers, complete challenges, and see the real-world impact you are making.
      </p>
    </div>
  );
};

export default Blogheader;
