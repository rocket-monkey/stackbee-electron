import React from "react";

const Enlarge = props => (
  <svg width={32} height={32} {...props}>
    <path d="M32 0H19l5 5-6 6 3 3 6-6 5 5zM32 32V19l-5 5-6-6-3 3 6 6-5 5zM0 32h13l-5-5 6-6-3-3-6 6-5-5zM0 0v13l5-5 6 6 3-3-6-6 5-5z" />
  </svg>
);

export default Enlarge;
