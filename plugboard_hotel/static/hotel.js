import { jsxs as i, jsx as o } from "react/jsx-runtime";
import { createRoot as C } from "react-dom/client";
import { useState as y } from "react";
import { ui as w, theme as n } from "@plugboard/sdk";
const { Pane: S } = w, g = { display: "flex", justifyContent: "space-between", gap: 16, padding: "6px 0", fontSize: 14 }, z = { color: n.muted }, b = { color: n.ink, textAlign: "right" };
function W({ proposal: r, onDecide: t, agentTitle: a, onClose: l }) {
  const [d, f] = y(!1), [s, x] = y(null), e = r, p = (s == null ? void 0 : s.state) || (e == null ? void 0 : e.state), k = (s == null ? void 0 : s.result) || (e == null ? void 0 : e.result), v = ((e == null ? void 0 : e.amount) || "").toLowerCase().startsWith("refund"), h = async (c) => {
    if (!(d || !e)) {
      f(!0);
      try {
        const m = await (t == null ? void 0 : t(e.id, c));
        m && x(m);
      } finally {
        f(!1);
      }
    }
  };
  return /* @__PURE__ */ i(S, { title: "Checkout", subtitle: a ? `${a} · Hotel Aurora` : "Hotel Aurora", onClose: typeof l == "function" ? l : void 0, children: [
    !e && /* @__PURE__ */ o("div", { style: { padding: "16px 20px", color: n.muted, fontSize: 14 }, children: "Nothing to confirm right now." }),
    e && /* @__PURE__ */ i("div", { style: { padding: "8px 20px 20px", maxWidth: 520 }, children: [
      /* @__PURE__ */ o("div", { style: { fontSize: 17, fontWeight: 600, color: n.ink, margin: "8px 0 14px" }, children: e.prompt }),
      /* @__PURE__ */ i("div", { style: { border: `1px solid ${n.line}`, borderRadius: 10, background: n.paper, padding: "8px 14px" }, children: [
        (e.lines || []).map((c) => /* @__PURE__ */ i("div", { style: g, children: [
          /* @__PURE__ */ o("span", { style: z, children: c.label }),
          /* @__PURE__ */ o("span", { style: b, children: c.value })
        ] }, c.label)),
        e.amount && /* @__PURE__ */ i("div", { style: { ...g, borderTop: `1px solid ${n.line}`, marginTop: 6, paddingTop: 10, fontWeight: 600 }, children: [
          /* @__PURE__ */ i("span", { style: { color: n.ink }, children: [
            v ? "Refund to" : "Charge to",
            " ",
            e.card || "your card on file"
          ] }),
          /* @__PURE__ */ o("span", { style: { ...b, fontVariantNumeric: "tabular-nums" }, children: e.amount })
        ] })
      ] }),
      p === "pending" ? /* @__PURE__ */ i("div", { style: { display: "flex", gap: 10, marginTop: 16 }, children: [
        /* @__PURE__ */ o(
          "button",
          {
            type: "button",
            onClick: () => h("confirm"),
            disabled: d,
            style: { flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid transparent", background: n.accent, color: n.accentInk, fontSize: 14, fontWeight: 600, cursor: "pointer", opacity: d ? 0.6 : 1 },
            children: d ? "Working…" : e.confirm_label || "Confirm"
          }
        ),
        /* @__PURE__ */ o(
          "button",
          {
            type: "button",
            onClick: () => h("decline"),
            disabled: d,
            style: { padding: "10px 14px", borderRadius: 8, border: `1px solid ${n.line}`, background: n.surface, color: n.ink, fontSize: 14, cursor: "pointer" },
            children: e.cancel_label || "Not now"
          }
        )
      ] }) : /* @__PURE__ */ o("div", { style: { marginTop: 16, fontSize: 14, color: p === "executed" ? n.ok : p === "declined" ? n.muted : n.bad }, children: k || p }),
      /* @__PURE__ */ o("div", { style: { marginTop: 14, fontSize: 12, color: n.muted }, children: "Payments are taken by the hotel's payment provider; the card on file is never shown in full and never leaves the hotel's systems. Nothing happens until you confirm here, and you can come back to this later." })
    ] })
  ] });
}
const N = { CheckoutPane: W }, u = /* @__PURE__ */ new WeakMap();
function j(r, t) {
  const a = N[t.component];
  let l = u.get(r);
  l || (l = C(r), u.set(r, l)), l.render(a ? /* @__PURE__ */ o(a, { ...t }) : /* @__PURE__ */ i("div", { style: { padding: 16 }, children: [
    "Unknown component ",
    t.component
  ] }));
}
function A(r) {
  const t = u.get(r);
  t && (t.unmount(), u.delete(r));
}
export {
  j as mount,
  A as unmount
};
