'use client'

import React from "react";

const NeonBackground: React.FC = () => {
  return (
    <div className="neon-ambient">
      {/* Rings */}
      <div className="neon-ring" />
      <div className="neon-ring ring-primary" />
      <div className="neon-ring ring-accent" />

      {/* Grid */}
      <div className="neon-grid" />

      {/* Light beams */}
      <div
        className="neon-beam primary"
        style={{
          left: "50%",
          "--beam-start": "80vh",
          "--beam-end": "0vh",
          "--beam-delay": "0s",
          animationDuration: "16s",
        } as React.CSSProperties}
      />
      <div
        className="neon-beam info"
        style={{
          left: "25%",
          "--beam-start": "95vh",
          "--beam-end": "0vh",
          "--beam-delay": "0.6s",
          animationDuration: "16s",
        } as React.CSSProperties}
      />
      <div
        className="neon-beam info"
        style={{
          left: "75%",
          "--beam-start": "105vh",
          "--beam-end": "0vh",
          "--beam-delay": "1.2s",
          animationDuration: "16s",
        } as React.CSSProperties}
      />

      {/* Stars */}
      <div className="neon-star" style={{ left: "70%", top: "15%" }} />
      <div className="neon-star star-primary" style={{ left: "20%", top: "30%" }} />
      <div className="neon-star star-accent" style={{ left: "40%", top: "60%" }} />
      <div className="neon-star" style={{ left: "60%", top: "90%" }} />
      <div className="neon-star star-primary" style={{ left: "80%", top: "20%" }} />
      <div className="neon-star star-accent" style={{ left: "0%", top: "50%" }} />
      <div className="neon-star" style={{ left: "20%", top: "80%" }} />
      <div className="neon-star star-primary" style={{ left: "40%", top: "10%" }} />

    </div>
  );
};

export default NeonBackground;

