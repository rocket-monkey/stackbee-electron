import React from "react";

const Pen = props => (
  <svg width={32} height={32} {...props}>
    <path d="M31.818 9.122L22.879.183c-.292-.292-.676-.226-.855.146l-1.199 2.497 8.35 8.35 2.497-1.199c.372-.178.438-.563.146-.855zM19.231 4.231L11 4.917c-.547.068-1.002.184-1.159.899l-.001.002C7.608 16.539 0 27.001 0 27.001l1.793 1.793 8.5-8.5a3 3 0 1 1 1.414 1.414l-8.5 8.5L5 32.001s10.462-7.608 21.183-9.84l.002-.001c.714-.157.831-.612.898-1.159l.686-8.231-8.538-8.539z" />
  </svg>
);

export default Pen;
