import React from "react";

const Printer = props => (
  <svg width={32} height={32} {...props}>
    <path d="M8 2h16v4H8V2zM30 8H2c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h6v8h16v-8h6c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM4 14a2 2 0 1 1-.001-3.999A2 2 0 0 1 4 14zm18 14H10V18h12v10z" />
  </svg>
);

export default Printer;
