import React from "react";

const CreditCard = props => (
  <svg width={32} height={32} {...props}>
    <path d="M29 4H3C1.35 4 0 5.35 0 7v18c0 1.65 1.35 3 3 3h26c1.65 0 3-1.35 3-3V7c0-1.65-1.35-3-3-3zM3 6h26c.542 0 1 .458 1 1v3H2V7c0-.542.458-1 1-1zm26 20H3c-.542 0-1-.458-1-1v-9h28v9c0 .542-.458 1-1 1zM4 20h2v4H4zm4 0h2v4H8zm4 0h2v4h-2z" />
  </svg>
);

export default CreditCard;
