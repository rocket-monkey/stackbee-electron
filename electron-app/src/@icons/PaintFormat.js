import React from "react";

const PaintFormat = props => (
  <svg width={32} height={32} {...props}>
    <path d="M32 18V6h-6V4c0-1.1-.9-2-2-2H2C.9 2 0 2.9 0 4v6c0 1.1.9 2 2 2h22c1.1 0 2-.9 2-2V8h4v8H12v4h-1a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V21a1 1 0 0 0-1-1h-1v-2h18zM24 6H2V4h22v2z" />
  </svg>
);

export default PaintFormat;
