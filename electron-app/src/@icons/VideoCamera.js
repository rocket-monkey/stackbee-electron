import React from "react";

const VideoCamera = props => (
  <svg width={32} height={32} {...props}>
    <path d="M12 9a5 5 0 1 1 10.001.001A5 5 0 0 1 12 9zM0 9a5 5 0 1 1 10.001.001A5 5 0 0 1 0 9zm24 10v-3c0-1.1-.9-2-2-2H2c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h20c1.1 0 2-.9 2-2v-3l8 5V14l-8 5zm-4 5H4v-6h16v6z" />
  </svg>
);

export default VideoCamera;
