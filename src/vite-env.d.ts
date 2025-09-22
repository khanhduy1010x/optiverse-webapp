/*eslint-disable @typescript-eslint/no-require-imports*/
/// <reference types="vite/client" />

declare module "*.svg" {
  import React = require("react");
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

// Support importing binary assets as URLs via Vite's ?url suffix
declare module "*.xlsx?url" {
  const src: string;
  export default src;
}
