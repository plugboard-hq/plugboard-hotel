import { jsxs as r, jsx as n } from "react/jsx-runtime";
import { createRoot as E } from "react-dom/client";
import { useState as $ } from "react";
import { ui as _, theme as e } from "@plugboard/sdk";
const { Pane: A } = _, C = { display: "flex", justifyContent: "space-between", gap: 16, padding: "6px 0", fontSize: 14 }, D = { color: e.muted }, w = { color: e.ink, textAlign: "right" };
function P({ proposal: l, onDecide: a, agentTitle: s, onClose: t }) {
  const [c, f] = $(!1), [u, x] = $(null), o = l, y = (u == null ? void 0 : u.state) || (o == null ? void 0 : o.state), S = (u == null ? void 0 : u.result) || (o == null ? void 0 : o.result), i = ((o == null ? void 0 : o.amount) || "").toLowerCase().startsWith("refund"), d = async (h) => {
    if (!(c || !o)) {
      f(!0);
      try {
        const z = await (a == null ? void 0 : a(o.id, h));
        z && x(z);
      } finally {
        f(!1);
      }
    }
  };
  return /* @__PURE__ */ r(A, { title: "Checkout", subtitle: s ? `${s} · Hotel Aurora` : "Hotel Aurora", onClose: typeof t == "function" ? t : void 0, children: [
    !o && /* @__PURE__ */ n("div", { style: { padding: "16px 20px", color: e.muted, fontSize: 14 }, children: "Nothing to confirm right now." }),
    o && /* @__PURE__ */ r("div", { style: { padding: "8px 20px 20px", maxWidth: 520 }, children: [
      /* @__PURE__ */ n("div", { style: { fontSize: 17, fontWeight: 600, color: e.ink, margin: "8px 0 14px" }, children: o.prompt }),
      /* @__PURE__ */ r("div", { style: { border: `1px solid ${e.line}`, borderRadius: 10, background: e.paper, padding: "8px 14px" }, children: [
        (o.lines || []).map((h) => /* @__PURE__ */ r("div", { style: C, children: [
          /* @__PURE__ */ n("span", { style: D, children: h.label }),
          /* @__PURE__ */ n("span", { style: w, children: h.value })
        ] }, h.label)),
        o.amount && /* @__PURE__ */ r("div", { style: { ...C, borderTop: `1px solid ${e.line}`, marginTop: 6, paddingTop: 10, fontWeight: 600 }, children: [
          /* @__PURE__ */ r("span", { style: { color: e.ink }, children: [
            i ? "Refund to" : "Charge to",
            " ",
            o.card || "your card on file"
          ] }),
          /* @__PURE__ */ n("span", { style: { ...w, fontVariantNumeric: "tabular-nums" }, children: o.amount })
        ] })
      ] }),
      c && /* @__PURE__ */ r("div", { style: { marginTop: 14, display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: e.muted }, children: [
        /* @__PURE__ */ n("span", { style: { width: 14, height: 14, borderRadius: "50%", border: `2px solid ${e.line}`, borderTopColor: e.accent, animation: "pb-spin 0.8s linear infinite" } }),
        "Contacting the payment provider…",
        /* @__PURE__ */ n("style", { children: "@keyframes pb-spin { to { transform: rotate(360deg) } }" })
      ] }),
      y === "pending" ? /* @__PURE__ */ r("div", { style: { display: "flex", gap: 10, marginTop: 16 }, children: [
        /* @__PURE__ */ n(
          "button",
          {
            type: "button",
            onClick: () => d("confirm"),
            disabled: c,
            style: { flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid transparent", background: e.accent, color: e.accentInk, fontSize: 14, fontWeight: 600, cursor: "pointer", opacity: c ? 0.6 : 1 },
            children: c ? "Processing payment…" : o.confirm_label || "Confirm"
          }
        ),
        /* @__PURE__ */ n(
          "button",
          {
            type: "button",
            onClick: () => d("decline"),
            disabled: c,
            style: { padding: "10px 14px", borderRadius: 8, border: `1px solid ${e.line}`, background: e.surface, color: e.ink, fontSize: 14, cursor: "pointer", opacity: c ? 0.5 : 1 },
            children: o.cancel_label || "Not now"
          }
        )
      ] }) : /* @__PURE__ */ n("div", { style: { marginTop: 16, fontSize: 14, color: y === "executed" ? e.ok : y === "declined" ? e.muted : e.bad }, children: S || y }),
      /* @__PURE__ */ n("div", { style: { marginTop: 14, fontSize: 12, color: e.muted }, children: "Payments are taken by the hotel's payment provider; the card on file is never shown in full and never leaves the hotel's systems. Nothing happens until you confirm here, and you can come back to this later." })
    ] })
  ] });
}
const { Pane: R } = _, p = (l) => `€${Number(l).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, v = (l) => new Date(l).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }), g = { border: `1px solid ${e.line}`, borderRadius: 10, background: e.surface, padding: "12px 16px" }, m = { fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: e.muted, fontFamily: e.mono, marginBottom: 6 }, b = { display: "flex", justifyContent: "space-between", gap: 16, padding: "4px 0", fontSize: 14 }, T = { padding: "7px 12px", borderRadius: 8, border: `1px solid ${e.line}`, background: e.surface, color: e.ink, fontSize: 13, cursor: "pointer" }, N = { confirmed: "Confirmed", "checked-in online": "Checked in online", "checked-in": "Checked in", "checked-out": "Checked out", cancelled: "Cancelled" };
function I({ widget: l, agentTitle: a, onClose: s }) {
  const t = l == null ? void 0 : l.stay, [c, f] = $(null), [u, x] = $(!1);
  if (!t)
    return /* @__PURE__ */ n(R, { title: "Your stay", subtitle: a || "Reservations", onClose: typeof s == "function" ? s : void 0, children: /* @__PURE__ */ n("div", { style: { padding: "16px 20px", color: e.muted, fontSize: 14 }, children: "No stay to show." }) });
  const o = async () => {
    x(!0), await new Promise((i) => setTimeout(i, 1400)), x(!1), f(`Sent to ${t.guest.email}`), setTimeout(() => f(null), 4e3);
  }, y = () => {
    const i = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Hotel Aurora//Stay//EN",
      "BEGIN:VEVENT",
      `UID:${t.number}@aurora.example`,
      `DTSTART;VALUE=DATE:${t.arrival.replace(/-/g, "")}`,
      `DTEND;VALUE=DATE:${t.departure.replace(/-/g, "")}`,
      `SUMMARY:${t.property.name} · ${t.room.category} (${t.number})`,
      `LOCATION:${t.property.address}`,
      `DESCRIPTION:Check-in from ${t.property.check_in_from}\\, check-out until ${t.property.check_out_until}. ${t.property.phone}`,
      "END:VEVENT",
      "END:VCALENDAR"
    ].join(`\r
`), d = document.createElement("a");
    d.href = URL.createObjectURL(new Blob([i], { type: "text/calendar" })), d.download = `${t.number}.ics`, d.click(), URL.revokeObjectURL(d.href);
  }, S = () => {
    const i = window.open("", "_blank", "width=720,height=900");
    if (!i) return;
    const d = t.extras.map((h) => `<tr><td>${h.name} × ${h.quantity}</td><td style="text-align:right">${p(h.amount)}</td></tr>`).join("");
    i.document.write(`<!doctype html><title>${t.property.name} · ${t.number}</title>
      <style>body{font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#1f2937;max-width:640px;margin:32px auto;padding:0 24px}h1{font-size:22px;margin:0 0 4px}h2{font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#6b7280;margin:24px 0 8px}table{width:100%;border-collapse:collapse;font-size:14px}td{padding:6px 0;border-bottom:1px solid #e5e7eb}.muted{color:#6b7280}.total td{font-weight:600;border-bottom:none}</style>
      <h1>${t.property.name}</h1><div class="muted">${t.property.address} · ${t.property.phone}</div>
      <h2>Booking confirmation ${t.number}</h2>
      <table><tr><td>Guest</td><td style="text-align:right">${t.guest.name}</td></tr><tr><td>Room</td><td style="text-align:right">${t.room.category}</td></tr>
      <tr><td>Arrival</td><td style="text-align:right">${v(t.arrival)}, from ${t.property.check_in_from}</td></tr><tr><td>Departure</td><td style="text-align:right">${v(t.departure)}, until ${t.property.check_out_until}</td></tr>
      <tr><td>Guests</td><td style="text-align:right">${t.adults} adults${t.children ? `, ${t.children} children` : ""}</td></tr><tr><td>Status</td><td style="text-align:right">${N[t.state] || t.state}</td></tr></table>
      <h2>Charges</h2><table><tr><td>${t.nights} nights × ${p(t.rate_per_night)}</td><td style="text-align:right">${p(t.totals.room)}</td></tr>${d}
      <tr><td>Paid</td><td style="text-align:right">−${p(t.totals.paid)}</td></tr><tr class="total"><td>Still due</td><td style="text-align:right">${p(t.totals.due)}</td></tr></table>
      <p class="muted" style="font-size:12px;margin-top:28px">Free cancellation until 48 hours before arrival. Card on file ${t.card}.</p>
      <script>setTimeout(() => window.print(), 300)<\/script>`), i.document.close();
  };
  return /* @__PURE__ */ n(
    R,
    {
      title: `${t.property.name} · ${t.number}`,
      subtitle: `${N[t.state] || t.state} · ${t.room.category} · ${t.nights} nights`,
      onClose: typeof s == "function" ? s : void 0,
      actions: /* @__PURE__ */ r("div", { style: { display: "flex", gap: 6, alignItems: "center" }, children: [
        c && /* @__PURE__ */ n("span", { style: { fontSize: 12, color: e.ok, marginRight: 4 }, children: c }),
        /* @__PURE__ */ n("button", { type: "button", style: T, onClick: o, disabled: u, children: u ? "Sending…" : "Email me this" }),
        /* @__PURE__ */ n("button", { type: "button", style: T, onClick: S, children: "Download PDF" }),
        /* @__PURE__ */ n("button", { type: "button", style: T, onClick: y, children: "Add to calendar" })
      ] }),
      children: /* @__PURE__ */ r("div", { style: { padding: "4px 20px 24px", display: "grid", gap: 12, maxWidth: 720 }, children: [
        /* @__PURE__ */ r("div", { style: { ...g, background: e.paper, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
          /* @__PURE__ */ r("div", { children: [
            /* @__PURE__ */ n("div", { style: m, children: "Arrival" }),
            /* @__PURE__ */ n("div", { style: { fontSize: 15, fontWeight: 600, color: e.ink }, children: v(t.arrival) }),
            /* @__PURE__ */ r("div", { style: { fontSize: 13, color: e.muted }, children: [
              "from ",
              t.property.check_in_from,
              t.estimated_arrival ? ` · you arrive ${t.estimated_arrival}` : ""
            ] })
          ] }),
          /* @__PURE__ */ r("div", { children: [
            /* @__PURE__ */ n("div", { style: m, children: "Departure" }),
            /* @__PURE__ */ n("div", { style: { fontSize: 15, fontWeight: 600, color: e.ink }, children: v(t.departure) }),
            /* @__PURE__ */ r("div", { style: { fontSize: 13, color: e.muted }, children: [
              "until ",
              t.property.check_out_until
            ] })
          ] })
        ] }),
        /* @__PURE__ */ r("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
          /* @__PURE__ */ r("div", { style: g, children: [
            /* @__PURE__ */ n("div", { style: m, children: "Room" }),
            /* @__PURE__ */ n("div", { style: { fontSize: 15, fontWeight: 600, color: e.ink }, children: t.room.category }),
            /* @__PURE__ */ n("div", { style: { fontSize: 13, color: e.muted }, children: t.room.description }),
            /* @__PURE__ */ r("div", { style: { fontSize: 13, color: e.muted, marginTop: 4 }, children: [
              t.adults,
              " adult",
              t.adults === 1 ? "" : "s",
              t.children ? `, ${t.children} child${t.children === 1 ? "" : "ren"}` : ""
            ] })
          ] }),
          /* @__PURE__ */ r("div", { style: g, children: [
            /* @__PURE__ */ n("div", { style: m, children: "Guest" }),
            /* @__PURE__ */ n("div", { style: { fontSize: 15, fontWeight: 600, color: e.ink }, children: t.guest.name }),
            /* @__PURE__ */ n("div", { style: { fontSize: 13, color: e.muted }, children: t.guest.email }),
            /* @__PURE__ */ n("div", { style: { fontSize: 13, color: e.muted }, children: t.guest.loyalty || "No loyalty tier" })
          ] })
        ] }),
        /* @__PURE__ */ r("div", { style: g, children: [
          /* @__PURE__ */ n("div", { style: m, children: "Included" }),
          /* @__PURE__ */ r("div", { style: b, children: [
            /* @__PURE__ */ r("span", { children: [
              t.nights,
              " nights × ",
              p(t.rate_per_night)
            ] }),
            /* @__PURE__ */ n("span", { children: p(t.totals.room) })
          ] }),
          t.extras.map((i) => /* @__PURE__ */ r("div", { style: b, children: [
            /* @__PURE__ */ r("span", { children: [
              i.name,
              " × ",
              i.quantity
            ] }),
            /* @__PURE__ */ n("span", { children: p(i.amount) })
          ] }, i.name)),
          t.extras.length === 0 && /* @__PURE__ */ n("div", { style: { fontSize: 13, color: e.muted }, children: "No extras yet. Ask for breakfast, parking, a late check-out or a transfer." })
        ] }),
        /* @__PURE__ */ r("div", { style: g, children: [
          /* @__PURE__ */ n("div", { style: m, children: "Payments" }),
          t.payments.map((i, d) => /* @__PURE__ */ r("div", { style: b, children: [
            /* @__PURE__ */ r("span", { style: { color: e.muted }, children: [
              i.description,
              " · ",
              i.card_last4 ? `•••• ${i.card_last4}` : ""
            ] }),
            /* @__PURE__ */ r("span", { children: [
              i.amount < 0 ? "−" : "",
              p(Math.abs(i.amount))
            ] })
          ] }, d)),
          /* @__PURE__ */ r("div", { style: { ...b, borderTop: `1px solid ${e.line}`, marginTop: 6, paddingTop: 10, fontWeight: 600 }, children: [
            /* @__PURE__ */ n("span", { children: "Still due at the hotel" }),
            /* @__PURE__ */ n("span", { children: p(t.totals.due) })
          ] }),
          /* @__PURE__ */ r("div", { style: { fontSize: 12, color: e.muted, marginTop: 4 }, children: [
            "Card on file ",
            t.card,
            ". Free cancellation until 48 hours before arrival."
          ] })
        ] }),
        t.requests.length > 0 && /* @__PURE__ */ r("div", { style: g, children: [
          /* @__PURE__ */ n("div", { style: m, children: "Requests" }),
          t.requests.map((i, d) => /* @__PURE__ */ r("div", { style: b, children: [
            /* @__PURE__ */ n("span", { children: i.text }),
            /* @__PURE__ */ n("span", { style: { color: e.muted }, children: i.status })
          ] }, d))
        ] }),
        /* @__PURE__ */ r("div", { style: { fontSize: 13, color: e.muted }, children: [
          t.property.address,
          " · ",
          t.property.phone
        ] })
      ] })
    }
  );
}
const L = { CheckoutPane: P, StayPane: I }, k = /* @__PURE__ */ new WeakMap();
function B(l, a) {
  const s = L[a.component];
  let t = k.get(l);
  t || (t = E(l), k.set(l, t)), t.render(s ? /* @__PURE__ */ n(s, { ...a }) : /* @__PURE__ */ r("div", { style: { padding: 16 }, children: [
    "Unknown component ",
    a.component
  ] }));
}
function j(l) {
  const a = k.get(l);
  a && (a.unmount(), k.delete(l));
}
export {
  B as mount,
  j as unmount
};
