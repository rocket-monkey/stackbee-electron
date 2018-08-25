import React from "react";

const Shrink = props => (
  <svg width={32} height={32} {...props}>
    <path d="M18 14h13l-5-5 6-6-3-3-6 6-5-5zM18 18v13l5-5 6 6 3-3-6-6 5-5zM14 18H1l5 5-6 6 3 3 6-6 5 5zM14 14V1L9 6 3 0 0 3l6 6-5 5z" />
  </svg>
);

export default Shrink;
