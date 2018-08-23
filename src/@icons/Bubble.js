import React from "react";

const Bubble = props => (
  <svg width={32} height={32} {...props}>
    <path d="M16 2c8.837 0 16 5.82 16 13s-7.163 13-16 13a19.66 19.66 0 0 1-2.495-.158C10.068 31.279 5.966 31.895 2 31.986v-.841C4.142 30.096 6 28.184 6 26c0-.305-.024-.604-.068-.897C2.313 22.72 0 19.079 0 15 0 7.82 7.163 2 16 2z" />
  </svg>
);

export default Bubble;