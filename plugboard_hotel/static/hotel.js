import { jsxs as r, jsx as i } from "react/jsx-runtime";
import { createRoot as T } from "react-dom/client";
import { useState as f, useEffect as R } from "react";
import { ui as W, theme as t } from "@plugboard/sdk";
const { Pane: N } = W, k = { display: "flex", justifyContent: "space-between", gap: 16, padding: "6px 0", fontSize: 14 }, P = { color: t.muted }, v = { color: t.ink, textAlign: "right" };
function $({ pending: e, onAnswer: n, agentTitle: a, onClose: l }) {
  var g;
  const [d, h] = f(null), [u, m] = f(!1), [C, S] = f(e);
  R(() => {
    e && (S(e), h(null));
  }, [e == null ? void 0 : e.id]);
  const o = e || C, y = async (s) => {
    if (!u) {
      m(!0);
      try {
        await (n == null ? void 0 : n(s)), h(s);
      } finally {
        m(!1);
      }
    }
  }, z = (g = o == null ? void 0 : o.options) != null && g.length ? o.options : [(o == null ? void 0 : o.confirm_label) || "Confirm", (o == null ? void 0 : o.cancel_label) || "Cancel"], [c, b] = z, x = ((o == null ? void 0 : o.amount) || "").toLowerCase().startsWith("refund");
  return /* @__PURE__ */ r(N, { title: "Checkout", subtitle: a ? `${a} · Hotel Aurora` : "Hotel Aurora", onClose: typeof l == "function" ? l : void 0, children: [
    !o && !d && /* @__PURE__ */ i("div", { style: { padding: "16px 20px", color: t.muted, fontSize: 14 }, children: "Nothing to confirm right now." }),
    (o || d) && /* @__PURE__ */ r("div", { style: { padding: "8px 20px 20px", maxWidth: 520 }, children: [
      /* @__PURE__ */ i("div", { style: { fontSize: 17, fontWeight: 600, color: t.ink, margin: "8px 0 14px" }, children: o == null ? void 0 : o.prompt }),
      /* @__PURE__ */ r("div", { style: { border: `1px solid ${t.line}`, borderRadius: 10, background: t.paper, padding: "8px 14px" }, children: [
        ((o == null ? void 0 : o.lines) || []).map((s) => /* @__PURE__ */ r("div", { style: k, children: [
          /* @__PURE__ */ i("span", { style: P, children: s.label }),
          /* @__PURE__ */ i("span", { style: v, children: s.value })
        ] }, s.label)),
        (o == null ? void 0 : o.amount) && /* @__PURE__ */ r("div", { style: { ...k, borderTop: `1px solid ${t.line}`, marginTop: 6, paddingTop: 10, fontWeight: 600 }, children: [
          /* @__PURE__ */ r("span", { style: { color: t.ink }, children: [
            x ? "Refund to" : "Charge to",
            " ",
            o.card || "your card on file"
          ] }),
          /* @__PURE__ */ i("span", { style: { ...v, fontVariantNumeric: "tabular-nums" }, children: o.amount })
        ] })
      ] }),
      d ? /* @__PURE__ */ i("div", { style: { marginTop: 16, fontSize: 14, color: d === c ? t.ok : t.muted }, children: d === c ? x ? "Refund on its way." : "Paid. Thank you." : "Nothing was charged." }) : /* @__PURE__ */ r("div", { style: { display: "flex", gap: 10, marginTop: 16 }, children: [
        /* @__PURE__ */ i(
          "button",
          {
            type: "button",
            onClick: () => y(c),
            disabled: u,
            style: { flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid transparent", background: t.accent, color: t.accentInk, fontSize: 14, fontWeight: 600, cursor: "pointer" },
            children: c
          }
        ),
        /* @__PURE__ */ i(
          "button",
          {
            type: "button",
            onClick: () => y(b),
            disabled: u,
            style: { padding: "10px 14px", borderRadius: 8, border: `1px solid ${t.line}`, background: t.surface, color: t.ink, fontSize: 14, cursor: "pointer" },
            children: b
          }
        )
      ] }),
      /* @__PURE__ */ i("div", { style: { marginTop: 14, fontSize: 12, color: t.muted }, children: "Payments are taken by the hotel's payment provider; the card on file is never shown in full and never leaves the hotel's systems." })
    ] })
  ] });
}
const j = { CheckoutPane: $ }, p = /* @__PURE__ */ new WeakMap();
function O(e, n) {
  const a = j[n.component];
  let l = p.get(e);
  l || (l = T(e), p.set(e, l)), l.render(a ? /* @__PURE__ */ i(a, { ...n }) : /* @__PURE__ */ r("div", { style: { padding: 16 }, children: [
    "Unknown component ",
    n.component
  ] }));
}
function _(e) {
  const n = p.get(e);
  n && (n.unmount(), p.delete(e));
}
export {
  O as mount,
  _ as unmount
};
