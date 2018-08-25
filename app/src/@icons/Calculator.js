import React from "react";

const Calculator = props => (
  <svg width={32} height={32} {...props}>
    <path d="M12 2H2C.9 2 0 2.9 0 4v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 8H2V8h10v2zm16-8H18c-1.1 0-2 .9-2 2v26c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H18v-2h10v2zm0-6H18v-2h10v2zm-16 4H2c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V20c0-1.1-.9-2-2-2zm0 8H8v4H6v-4H2v-2h4v-4h2v4h4v2z" />
  </svg>
);

export default Calculator;
