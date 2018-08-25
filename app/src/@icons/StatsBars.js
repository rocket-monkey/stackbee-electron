import React from "react";

const StatsBars = props => (
  <svg width={32} height={32} {...props}>
    <path d="M0 26h32v4H0zm4-8h4v6H4zm6-8h4v14h-4zm6 6h4v8h-4zm6-12h4v20h-4z" />
  </svg>
);

export default StatsBars;
