import React, { useRef } from 'react';
import Spline from '@splinetool/react-spline';

const SplineVisualization = () => {
  const splineContainerRef = useRef(null);

  return (
    <div className="w-[40%] relative h-full" ref={splineContainerRef}>
      <Spline
        className="absolute inset-0 h-full w-full"
        scene="https://prod.spline.design/wbGSEgtIeXYtBDkR/scene.splinecode"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent pointer-events-none"></div>
    </div>
  );
};

export default SplineVisualization;