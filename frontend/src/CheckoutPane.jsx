import { useEffect, useState } from "react";
import { theme, ui } from "@plugboard/sdk";

const { Pane } = ui;

/**
 * The checkout: where a guest confirms something that costs or refunds
 * money. The host opens this pane when a hotel agent asks a confirm
 * question and hands it the pending widget; the buttons here answer it.
 * After the answer the pane shows what happened until it closes.
 */
const row = { display: "flex", justifyContent: "space-between", gap: 16, padding: "6px 0", fontSize: 14 };
const label = { color: theme.muted };
const value = { color: theme.ink, textAlign: "right" };

export default function CheckoutPane({ pending, onAnswer, agentTitle, onClose }) {
  const [done, setDone] = useState(null); // the answer given
  const [busy, setBusy] = useState(false);
  const w = pending;
  useEffect(() => {
    if (pending) setDone(null);
  }, [pending?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const choose = async (option) => {
    if (busy) return;
    setBusy(true);
    try {
      await onAnswer?.(option);
      setDone(option);
    } finally {
      setBusy(false);
    }
  };

  const options = w?.options?.length ? w.options : [w?.confirm_label || "Confirm", w?.cancel_label || "Cancel"];
  const [confirm, decline] = options;
  const refund = (w?.amount || "").toLowerCase().startsWith("refund");

  return (
    <Pane title="Checkout" subtitle={agentTitle ? `${agentTitle} · Hotel Aurora` : "Hotel Aurora"} onClose={typeof onClose === "function" ? onClose : undefined}>
      {!w && !done && <div style={{ padding: "16px 20px", color: theme.muted, fontSize: 14 }}>Nothing to confirm right now.</div>}
      {(w || done) && (
        <div style={{ padding: "8px 20px 20px", maxWidth: 520 }}>
          <div style={{ fontSize: 17, fontWeight: 600, color: theme.ink, margin: "8px 0 14px" }}>{w?.prompt}</div>
          <div style={{ border: `1px solid ${theme.line}`, borderRadius: 10, background: theme.paper, padding: "8px 14px" }}>
            {(w?.lines || []).map((l) => (
              <div key={l.label} style={row}>
                <span style={label}>{l.label}</span>
                <span style={value}>{l.value}</span>
              </div>
            ))}
            {w?.amount && (
              <div style={{ ...row, borderTop: `1px solid ${theme.line}`, marginTop: 6, paddingTop: 10, fontWeight: 600 }}>
                <span style={{ color: theme.ink }}>{refund ? "Refund to" : "Charge to"} {w.card || "your card on file"}</span>
                <span style={{ ...value, fontVariantNumeric: "tabular-nums" }}>{w.amount}</span>
              </div>
            )}
          </div>
          {!done ? (
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button
                type="button"
                onClick={() => choose(confirm)}
                disabled={busy}
                style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid transparent", background: theme.accent, color: theme.accentInk, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
              >
                {confirm}
              </button>
              <button
                type="button"
                onClick={() => choose(decline)}
                disabled={busy}
                style={{ padding: "10px 14px", borderRadius: 8, border: `1px solid ${theme.line}`, background: theme.surface, color: theme.ink, fontSize: 14, cursor: "pointer" }}
              >
                {decline}
              </button>
            </div>
          ) : (
            <div style={{ marginTop: 16, fontSize: 14, color: done === confirm ? theme.ok : theme.muted }}>
              {done === confirm ? (refund ? "Refund on its way." : "Paid. Thank you.") : "Nothing was charged."}
            </div>
          )}
          <div style={{ marginTop: 14, fontSize: 12, color: theme.muted }}>
            Payments are taken by the hotel's payment provider; the card on file is never shown in full and never leaves the hotel's systems.
          </div>
        </div>
      )}
    </Pane>
  );
}
