import { jsxs as i, jsx as n } from "react/jsx-runtime";
import { createRoot as C } from "react-dom/client";
import { useState as y } from "react";
import { ui as w, theme as t } from "@plugboard/sdk";
const { Pane: S } = w, g = { display: "flex", justifyContent: "space-between", gap: 16, padding: "6px 0", fontSize: 14 }, z = { color: t.muted }, b = { color: t.ink, textAlign: "right" };
function T({ proposal: r, onDecide: o, agentTitle: d, onClose: l }) {
  const [a, f] = y(!1), [s, x] = y(null), e = r, p = (s == null ? void 0 : s.state) || (e == null ? void 0 : e.state), v = (s == null ? void 0 : s.result) || (e == null ? void 0 : e.result), k = ((e == null ? void 0 : e.amount) || "").toLowerCase().startsWith("refund"), m = async (c) => {
    if (!(a || !e)) {
      f(!0);
      try {
        const h = await (o == null ? void 0 : o(e.id, c));
        h && x(h);
      } finally {
        f(!1);
      }
    }
  };
  return /* @__PURE__ */ i(S, { title: "Checkout", subtitle: d ? `${d} · Hotel Aurora` : "Hotel Aurora", onClose: typeof l == "function" ? l : void 0, children: [
    !e && /* @__PURE__ */ n("div", { style: { padding: "16px 20px", color: t.muted, fontSize: 14 }, children: "Nothing to confirm right now." }),
    e && /* @__PURE__ */ i("div", { style: { padding: "8px 20px 20px", maxWidth: 520 }, children: [
      /* @__PURE__ */ n("div", { style: { fontSize: 17, fontWeight: 600, color: t.ink, margin: "8px 0 14px" }, children: e.prompt }),
      /* @__PURE__ */ i("div", { style: { border: `1px solid ${t.line}`, borderRadius: 10, background: t.paper, padding: "8px 14px" }, children: [
        (e.lines || []).map((c) => /* @__PURE__ */ i("div", { style: g, children: [
          /* @__PURE__ */ n("span", { style: z, children: c.label }),
          /* @__PURE__ */ n("span", { style: b, children: c.value })
        ] }, c.label)),
        e.amount && /* @__PURE__ */ i("div", { style: { ...g, borderTop: `1px solid ${t.line}`, marginTop: 6, paddingTop: 10, fontWeight: 600 }, children: [
          /* @__PURE__ */ i("span", { style: { color: t.ink }, children: [
            k ? "Refund to" : "Charge to",
            " ",
            e.card || "your card on file"
          ] }),
          /* @__PURE__ */ n("span", { style: { ...b, fontVariantNumeric: "tabular-nums" }, children: e.amount })
        ] })
      ] }),
      a && /* @__PURE__ */ i("div", { style: { marginTop: 14, display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: t.muted }, children: [
        /* @__PURE__ */ n("span", { style: { width: 14, height: 14, borderRadius: "50%", border: `2px solid ${t.line}`, borderTopColor: t.accent, animation: "pb-spin 0.8s linear infinite" } }),
        "Contacting the payment provider…",
        /* @__PURE__ */ n("style", { children: "@keyframes pb-spin { to { transform: rotate(360deg) } }" })
      ] }),
      p === "pending" ? /* @__PURE__ */ i("div", { style: { display: "flex", gap: 10, marginTop: 16 }, children: [
        /* @__PURE__ */ n(
          "button",
          {
            type: "button",
            onClick: () => m("confirm"),
            disabled: a,
            style: { flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid transparent", background: t.accent, color: t.accentInk, fontSize: 14, fontWeight: 600, cursor: "pointer", opacity: a ? 0.6 : 1 },
            children: a ? "Processing payment…" : e.confirm_label || "Confirm"
          }
        ),
        /* @__PURE__ */ n(
          "button",
          {
            type: "button",
            onClick: () => m("decline"),
            disabled: a,
            style: { padding: "10px 14px", borderRadius: 8, border: `1px solid ${t.line}`, background: t.surface, color: t.ink, fontSize: 14, cursor: "pointer", opacity: a ? 0.5 : 1 },
            children: e.cancel_label || "Not now"
          }
        )
      ] }) : /* @__PURE__ */ n("div", { style: { marginTop: 16, fontSize: 14, color: p === "executed" ? t.ok : p === "declined" ? t.muted : t.bad }, children: v || p }),
      /* @__PURE__ */ n("div", { style: { marginTop: 14, fontSize: 12, color: t.muted }, children: "Payments are taken by the hotel's payment provider; the card on file is never shown in full and never leaves the hotel's systems. Nothing happens until you confirm here, and you can come back to this later." })
    ] })
  ] });
}
const N = { CheckoutPane: T }, u = /* @__PURE__ */ new WeakMap();
function j(r, o) {
  const d = N[o.component];
  let l = u.get(r);
  l || (l = C(r), u.set(r, l)), l.render(d ? /* @__PURE__ */ n(d, { ...o }) : /* @__PURE__ */ i("div", { style: { padding: 16 }, children: [
    "Unknown component ",
    o.component
  ] }));
}
function A(r) {
  const o = u.get(r);
  o && (o.unmount(), u.delete(r));
}
export {
  j as mount,
  A as unmount
};
