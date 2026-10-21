import { jsxs as r, jsx as i } from "react/jsx-runtime";
import { createRoot as S } from "react-dom/client";
import { useState as x, useEffect as z } from "react";
import { ui as T, theme as e } from "@plugboard/sdk";
const { Pane: R } = T, k = { display: "flex", justifyContent: "space-between", gap: 16, padding: "6px 0", fontSize: 14 }, W = { color: e.muted }, v = { color: e.ink, textAlign: "right" };
function N({ pending: t, onAnswer: n, agentTitle: s, onClose: l }) {
  var g;
  const [d, f] = x(null), [u, h] = x(!1), o = t;
  z(() => {
    t && f(null);
  }, [t == null ? void 0 : t.id]);
  const m = async (a) => {
    if (!u) {
      h(!0);
      try {
        await (n == null ? void 0 : n(a)), f(a);
      } finally {
        h(!1);
      }
    }
  }, C = (g = o == null ? void 0 : o.options) != null && g.length ? o.options : [(o == null ? void 0 : o.confirm_label) || "Confirm", (o == null ? void 0 : o.cancel_label) || "Cancel"], [c, y] = C, b = ((o == null ? void 0 : o.amount) || "").toLowerCase().startsWith("refund");
  return /* @__PURE__ */ r(R, { title: "Checkout", subtitle: s ? `${s} · Hotel Aurora` : "Hotel Aurora", onClose: typeof l == "function" ? l : void 0, children: [
    !o && !d && /* @__PURE__ */ i("div", { style: { padding: "16px 20px", color: e.muted, fontSize: 14 }, children: "Nothing to confirm right now." }),
    (o || d) && /* @__PURE__ */ r("div", { style: { padding: "8px 20px 20px", maxWidth: 520 }, children: [
      /* @__PURE__ */ i("div", { style: { fontSize: 17, fontWeight: 600, color: e.ink, margin: "8px 0 14px" }, children: o == null ? void 0 : o.prompt }),
      /* @__PURE__ */ r("div", { style: { border: `1px solid ${e.line}`, borderRadius: 10, background: e.paper, padding: "8px 14px" }, children: [
        ((o == null ? void 0 : o.lines) || []).map((a) => /* @__PURE__ */ r("div", { style: k, children: [
          /* @__PURE__ */ i("span", { style: W, children: a.label }),
          /* @__PURE__ */ i("span", { style: v, children: a.value })
        ] }, a.label)),
        (o == null ? void 0 : o.amount) && /* @__PURE__ */ r("div", { style: { ...k, borderTop: `1px solid ${e.line}`, marginTop: 6, paddingTop: 10, fontWeight: 600 }, children: [
          /* @__PURE__ */ r("span", { style: { color: e.ink }, children: [
            b ? "Refund to" : "Charge to",
            " ",
            o.card || "your card on file"
          ] }),
          /* @__PURE__ */ i("span", { style: { ...v, fontVariantNumeric: "tabular-nums" }, children: o.amount })
        ] })
      ] }),
      d ? /* @__PURE__ */ i("div", { style: { marginTop: 16, fontSize: 14, color: d === c ? e.ok : e.muted }, children: d === c ? b ? "Refund on its way." : "Paid. Thank you." : "Nothing was charged." }) : /* @__PURE__ */ r("div", { style: { display: "flex", gap: 10, marginTop: 16 }, children: [
        /* @__PURE__ */ i(
          "button",
          {
            type: "button",
            onClick: () => m(c),
            disabled: u,
            style: { flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid transparent", background: e.accent, color: e.accentInk, fontSize: 14, fontWeight: 600, cursor: "pointer" },
            children: c
          }
        ),
        /* @__PURE__ */ i(
          "button",
          {
            type: "button",
            onClick: () => m(y),
            disabled: u,
            style: { padding: "10px 14px", borderRadius: 8, border: `1px solid ${e.line}`, background: e.surface, color: e.ink, fontSize: 14, cursor: "pointer" },
            children: y
          }
        )
      ] }),
      /* @__PURE__ */ i("div", { style: { marginTop: 14, fontSize: 12, color: e.muted }, children: "Payments are taken by the hotel's payment provider; the card on file is never shown in full and never leaves the hotel's systems." })
    ] })
  ] });
}
const P = { CheckoutPane: N }, p = /* @__PURE__ */ new WeakMap();
function M(t, n) {
  const s = P[n.component];
  let l = p.get(t);
  l || (l = S(t), p.set(t, l)), l.render(s ? /* @__PURE__ */ i(s, { ...n }) : /* @__PURE__ */ r("div", { style: { padding: 16 }, children: [
    "Unknown component ",
    n.component
  ] }));
}
function O(t) {
  const n = p.get(t);
  n && (n.unmount(), p.delete(t));
}
export {
  M as mount,
  O as unmount
};
