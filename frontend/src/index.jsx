import { createRoot } from "react-dom/client";
import CheckoutPane from "./CheckoutPane.jsx";
import StayPane from "./StayPane.jsx";

/** mount(el, ctx) / unmount(el): the whole contract with the host. */
const COMPONENTS = { CheckoutPane, StayPane };
const roots = new WeakMap();

export function mount(el, ctx) {
  const Component = COMPONENTS[ctx.component];
  let root = roots.get(el);
  if (!root) {
    root = createRoot(el);
    roots.set(el, root);
  }
  root.render(Component ? <Component {...ctx} /> : <div style={{ padding: 16 }}>Unknown component {ctx.component}</div>);
}

export function unmount(el) {
  const root = roots.get(el);
  if (root) {
    root.unmount();
    roots.delete(el);
  }
}
