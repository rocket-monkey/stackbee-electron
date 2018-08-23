import React from "react";

const Compass = props => (
  <svg width={32} height={32} {...props}>
    <path d="M17 32a1 1 0 0 1-1-1V16H1a1 1 0 0 1-.423-1.906l30-14a1 1 0 0 1 1.329 1.329l-14 30A1 1 0 0 1 17 32zM5.508 14H17a1 1 0 0 1 1 1v11.492L28.931 3.069 5.508 14z" />
  </svg>
);

export default Compass;
