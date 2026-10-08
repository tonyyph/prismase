/** The art only touches Easing through the theme; give it inert curves. */
const curve = () => (t: number) => t;
export const Easing = {
  bezier: curve,
  out: curve,
  in: curve,
  inOut: curve,
  quad: curve,
  cubic: curve,
  sin: curve,
};
export default {};
