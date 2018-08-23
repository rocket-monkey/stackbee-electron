import React from "react";

const Pilcrow = props => (
  <svg width={32} height={32} {...props}>
    <path d="M12 0h16v4h-4v28h-4V4h-4v28h-4V16a8 8 0 0 1 0-16z" />
  </svg>
);

export default Pilcrow;
