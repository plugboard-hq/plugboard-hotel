import { useState } from "react";
import { theme, ui } from "@plugboard/sdk";

const { Pane } = ui;

/**
 * The checkout: where a guest confirms something that costs or refunds
 * money. A hotel agent prepares it as a proposal and ends its turn; the host
 * opens this pane on it and hands over onDecide. Confirming executes the
 * proposal through the host, and the outcome lands in the conversation.
 */
const row = { display: "flex", justifyContent: "space-between", gap: 16, padding: "6px 0", fontSize: 14 };
const label = { color: theme.muted };
const value = { color: theme.ink, textAlign: "right" };

export default function CheckoutPane({ proposal, onDecide, agentTitle, onClose }) {
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState(null);
  const p = proposal;
  const state = outcome?.state || p?.state;
  const result = outcome?.result || p?.result;
  const refund = (p?.amount || "").toLowerCase().startsWith("refund");

  const choose = async (choice) => {
    if (busy || !p) return;
    setBusy(true);
    try {
      const r = await onDecide?.(p.id, choice);
      if (r) setOutcome(r);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Pane title="Checkout" subtitle={agentTitle ? `${agentTitle} · Hotel Aurora` : "Hotel Aurora"} onClose={typeof onClose === "function" ? onClose : undefined}>
      {!p && <div style={{ padding: "16px 20px", color: theme.muted, fontSize: 14 }}>Nothing to confirm right now.</div>}
      {p && (
        <div style={{ padding: "8px 20px 20px", maxWidth: 520 }}>
          <div style={{ fontSize: 17, fontWeight: 600, color: theme.ink, margin: "8px 0 14px" }}>{p.prompt}</div>
          <div style={{ border: `1px solid ${theme.line}`, borderRadius: 10, background: theme.paper, padding: "8px 14px" }}>
            {(p.lines || []).map((l) => (
              <div key={l.label} style={row}>
                <span style={label}>{l.label}</span>
                <span style={value}>{l.value}</span>
              </div>
            ))}
            {p.amount && (
              <div style={{ ...row, borderTop: `1px solid ${theme.line}`, marginTop: 6, paddingTop: 10, fontWeight: 600 }}>
                <span style={{ color: theme.ink }}>{refund ? "Refund to" : "Charge to"} {p.card || "your card on file"}</span>
                <span style={{ ...value, fontVariantNumeric: "tabular-nums" }}>{p.amount}</span>
              </div>
            )}
          </div>
          {busy && (
            <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: theme.muted }}>
              <span style={{ width: 14, height: 14, borderRadius: "50%", border: `2px solid ${theme.line}`, borderTopColor: theme.accent, animation: "pb-spin 0.8s linear infinite" }} />
              Contacting the payment provider…
              <style>{"@keyframes pb-spin { to { transform: rotate(360deg) } }"}</style>
            </div>
          )}
          {state === "pending" ? (
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button
                type="button"
                onClick={() => choose("confirm")}
                disabled={busy}
                style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid transparent", background: theme.accent, color: theme.accentInk, fontSize: 14, fontWeight: 600, cursor: "pointer", opacity: busy ? 0.6 : 1 }}
              >
                {busy ? "Processing payment…" : p.confirm_label || "Confirm"}
              </button>
              <button
                type="button"
                onClick={() => choose("decline")}
                disabled={busy}
                style={{ padding: "10px 14px", borderRadius: 8, border: `1px solid ${theme.line}`, background: theme.surface, color: theme.ink, fontSize: 14, cursor: "pointer", opacity: busy ? 0.5 : 1 }}
              >
                {p.cancel_label || "Not now"}
              </button>
            </div>
          ) : (
            <div style={{ marginTop: 16, fontSize: 14, color: state === "executed" ? theme.ok : state === "declined" ? theme.muted : theme.bad }}>{result || state}</div>
          )}
          <div style={{ marginTop: 14, fontSize: 12, color: theme.muted }}>
            Payments are taken by the hotel's payment provider; the card on file is never shown in full and never leaves the hotel's systems. Nothing happens until you confirm here, and you can come back to this later.
          </div>
        </div>
      )}
    </Pane>
  );
}
