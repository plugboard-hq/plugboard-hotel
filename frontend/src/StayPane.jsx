import { useState } from "react";
import { theme, ui } from "@plugboard/sdk";

const { Pane } = ui;

/**
 * The booking as a work surface: the confirmation a guest would print, with
 * the things they do with it. Share by email and add to calendar are the
 * hotel's own actions; download prints the summary to PDF through the
 * browser. The data is the stay widget the Reservations agent showed.
 */
const eur = (v) => `€${Number(v).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const long = (iso) => new Date(iso).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const box = { border: `1px solid ${theme.line}`, borderRadius: 10, background: theme.surface, padding: "12px 16px" };
const label = { fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: theme.muted, fontFamily: theme.mono, marginBottom: 6 };
const row = { display: "flex", justifyContent: "space-between", gap: 16, padding: "4px 0", fontSize: 14 };
const btn = { padding: "7px 12px", borderRadius: 8, border: `1px solid ${theme.line}`, background: theme.surface, color: theme.ink, fontSize: 13, cursor: "pointer" };
const STATE = { confirmed: "Confirmed", "checked-in online": "Checked in online", "checked-in": "Checked in", "checked-out": "Checked out", cancelled: "Cancelled" };

export default function StayPane({ widget, agentTitle, onClose }) {
  const s = widget?.stay;
  const [sent, setSent] = useState(null);
  const [busy, setBusy] = useState(false);
  if (!s) {
    return (
      <Pane title="Your stay" subtitle={agentTitle || "Reservations"} onClose={typeof onClose === "function" ? onClose : undefined}>
        <div style={{ padding: "16px 20px", color: theme.muted, fontSize: 14 }}>No stay to show.</div>
      </Pane>
    );
  }

  const email = async () => {
    setBusy(true);
    await new Promise((r) => setTimeout(r, 1400));
    setBusy(false);
    setSent(`Sent to ${s.guest.email}`);
    setTimeout(() => setSent(null), 4000);
  };
  const calendar = () => {
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Hotel Aurora//Stay//EN", "BEGIN:VEVENT",
      `UID:${s.number}@aurora.example`, `DTSTART;VALUE=DATE:${s.arrival.replace(/-/g, "")}`, `DTEND;VALUE=DATE:${s.departure.replace(/-/g, "")}`,
      `SUMMARY:${s.property.name} · ${s.room.category} (${s.number})`, `LOCATION:${s.property.address}`,
      `DESCRIPTION:Check-in from ${s.property.check_in_from}\\, check-out until ${s.property.check_out_until}. ${s.property.phone}`,
      "END:VEVENT", "END:VCALENDAR",
    ].join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    a.download = `${s.number}.ics`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const pdf = () => {
    const w = window.open("", "_blank", "width=720,height=900");
    if (!w) return;
    const extras = s.extras.map((e) => `<tr><td>${e.name} × ${e.quantity}</td><td style="text-align:right">${eur(e.amount)}</td></tr>`).join("");
    w.document.write(`<!doctype html><title>${s.property.name} · ${s.number}</title>
      <style>body{font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#1f2937;max-width:640px;margin:32px auto;padding:0 24px}h1{font-size:22px;margin:0 0 4px}h2{font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#6b7280;margin:24px 0 8px}table{width:100%;border-collapse:collapse;font-size:14px}td{padding:6px 0;border-bottom:1px solid #e5e7eb}.muted{color:#6b7280}.total td{font-weight:600;border-bottom:none}</style>
      <h1>${s.property.name}</h1><div class="muted">${s.property.address} · ${s.property.phone}</div>
      <h2>Booking confirmation ${s.number}</h2>
      <table><tr><td>Guest</td><td style="text-align:right">${s.guest.name}</td></tr><tr><td>Room</td><td style="text-align:right">${s.room.category}</td></tr>
      <tr><td>Arrival</td><td style="text-align:right">${long(s.arrival)}, from ${s.property.check_in_from}</td></tr><tr><td>Departure</td><td style="text-align:right">${long(s.departure)}, until ${s.property.check_out_until}</td></tr>
      <tr><td>Guests</td><td style="text-align:right">${s.adults} adults${s.children ? `, ${s.children} children` : ""}</td></tr><tr><td>Status</td><td style="text-align:right">${STATE[s.state] || s.state}</td></tr></table>
      <h2>Charges</h2><table><tr><td>${s.nights} nights × ${eur(s.rate_per_night)}</td><td style="text-align:right">${eur(s.totals.room)}</td></tr>${extras}
      <tr><td>Paid</td><td style="text-align:right">−${eur(s.totals.paid)}</td></tr><tr class="total"><td>Still due</td><td style="text-align:right">${eur(s.totals.due)}</td></tr></table>
      <p class="muted" style="font-size:12px;margin-top:28px">Free cancellation until 48 hours before arrival. Card on file ${s.card}.</p>
      <script>setTimeout(() => window.print(), 300)</script>`);
    w.document.close();
  };

  return (
    <Pane
      title={`${s.property.name} · ${s.number}`}
      subtitle={`${STATE[s.state] || s.state} · ${s.room.category} · ${s.nights} nights`}
      onClose={typeof onClose === "function" ? onClose : undefined}
      actions={
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {sent && <span style={{ fontSize: 12, color: theme.ok, marginRight: 4 }}>{sent}</span>}
          <button type="button" style={btn} onClick={email} disabled={busy}>{busy ? "Sending…" : "Email me this"}</button>
          <button type="button" style={btn} onClick={pdf}>Download PDF</button>
          <button type="button" style={btn} onClick={calendar}>Add to calendar</button>
        </div>
      }
    >
      <div style={{ padding: "4px 20px 24px", display: "grid", gap: 12, maxWidth: 720 }}>
        <div style={{ ...box, background: theme.paper, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <div style={label}>Arrival</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: theme.ink }}>{long(s.arrival)}</div>
            <div style={{ fontSize: 13, color: theme.muted }}>from {s.property.check_in_from}{s.estimated_arrival ? ` · you arrive ${s.estimated_arrival}` : ""}</div>
          </div>
          <div>
            <div style={label}>Departure</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: theme.ink }}>{long(s.departure)}</div>
            <div style={{ fontSize: 13, color: theme.muted }}>until {s.property.check_out_until}</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={box}>
            <div style={label}>Room</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: theme.ink }}>{s.room.category}</div>
            <div style={{ fontSize: 13, color: theme.muted }}>{s.room.description}</div>
            <div style={{ fontSize: 13, color: theme.muted, marginTop: 4 }}>{s.adults} adult{s.adults === 1 ? "" : "s"}{s.children ? `, ${s.children} child${s.children === 1 ? "" : "ren"}` : ""}</div>
          </div>
          <div style={box}>
            <div style={label}>Guest</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: theme.ink }}>{s.guest.name}</div>
            <div style={{ fontSize: 13, color: theme.muted }}>{s.guest.email}</div>
            <div style={{ fontSize: 13, color: theme.muted }}>{s.guest.loyalty || "No loyalty tier"}</div>
          </div>
        </div>
        <div style={box}>
          <div style={label}>Included</div>
          <div style={row}><span>{s.nights} nights × {eur(s.rate_per_night)}</span><span>{eur(s.totals.room)}</span></div>
          {s.extras.map((e) => (
            <div key={e.name} style={row}><span>{e.name} × {e.quantity}</span><span>{eur(e.amount)}</span></div>
          ))}
          {s.extras.length === 0 && <div style={{ fontSize: 13, color: theme.muted }}>No extras yet. Ask for breakfast, parking, a late check-out or a transfer.</div>}
        </div>
        <div style={box}>
          <div style={label}>Payments</div>
          {s.payments.map((p, i) => (
            <div key={i} style={row}><span style={{ color: theme.muted }}>{p.description} · {p.card_last4 ? `•••• ${p.card_last4}` : ""}</span><span>{p.amount < 0 ? "−" : ""}{eur(Math.abs(p.amount))}</span></div>
          ))}
          <div style={{ ...row, borderTop: `1px solid ${theme.line}`, marginTop: 6, paddingTop: 10, fontWeight: 600 }}><span>Still due at the hotel</span><span>{eur(s.totals.due)}</span></div>
          <div style={{ fontSize: 12, color: theme.muted, marginTop: 4 }}>Card on file {s.card}. Free cancellation until 48 hours before arrival.</div>
        </div>
        {s.requests.length > 0 && (
          <div style={box}>
            <div style={label}>Requests</div>
            {s.requests.map((q, i) => (
              <div key={i} style={row}><span>{q.text}</span><span style={{ color: theme.muted }}>{q.status}</span></div>
            ))}
          </div>
        )}
        <div style={{ fontSize: 13, color: theme.muted }}>{s.property.address} · {s.property.phone}</div>
      </div>
    </Pane>
  );
}
