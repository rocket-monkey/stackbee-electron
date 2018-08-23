import React from "react";

const Display = props => (
  <svg width={32} height={32} {...props}>
    <path d="M0 2v20h32V2H0zm30 18H2V4h28v16zm-9 4H11l-1 4-2 2h16l-2-2z" />
  </svg>
);

export default Display;
