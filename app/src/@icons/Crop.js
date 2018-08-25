import React from "react";

const Crop = props => (
  <svg width={32} height={32} {...props}>
    <path d="M26 8l6-6-2-2-6 6H10V0H6v6H0v4h6v16h16v6h4v-6h6v-4h-6V8zm-16 2h10L10 20V10zm2 12l10-10v10H12z" />
  </svg>
);

export default Crop;
