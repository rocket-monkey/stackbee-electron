import React from "react";

const Barcode = props => (
  <svg width={32} height={32} {...props}>
    <path d="M0 4h4v20H0zm6 0h2v20H6zm4 0h2v20h-2zm6 0h2v20h-2zm8 0h2v20h-2zm6 0h2v20h-2zM20 4h1v20h-1zm-6 0h1v20h-1zm13 0h1v20h-1zM0 26h2v2H0zm6 0h2v2H6zm4 0h2v2h-2zm10 0h2v2h-2zm10 0h2v2h-2zm-6 0h4v2h-4zm-10 0h4v2h-4z" />
  </svg>
);

export default Barcode;
