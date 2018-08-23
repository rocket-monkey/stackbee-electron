import React from "react";

const Clipboard = props => (
  <svg width={32} height={32} {...props}>
    <path d="M29 4h-9a4 4 0 0 0-8 0H3a1 1 0 0 0-1 1v26a1 1 0 0 0 1 1h26a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1zM16 2a2 2 0 1 1 .001 3.999A2 2 0 0 1 16 2zm12 28H4V6h4v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V6h4v24z" />
    <path d="M14 26.828l-6.414-7.414 1.828-1.828L14 21.172l8.586-7.586 1.829 1.828z" />
  </svg>
);

export default Clipboard;
