"""The hotel's tools, scoped to the guest who is signed in.

Every tool starts from ``current_turn().principal``: the person the host signed
in through the guest directory is the customer whose reservations these tools
see, and nobody else's. Anything that moves money or cancels a stay asks first
with a ConfirmWidget and proceeds only on the confirming answer.
"""

from __future__ import annotations

import sqlite3
from collections.abc import Callable
from datetime import date, datetime
from pathlib import Path

from plugboard.capabilities import Capability
from plugboard.proposals import propose
from plugboard.turn import current_turn

DB = Path(__file__).parent / "data" / "hotel.sqlite"
TODAY = date(2026, 10, 21)  # the seed's "today", so the demo does not drift


def _conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    return conn


def _guest() -> sqlite3.Row | None:
    turn = current_turn()
    pid = (turn.principal or {}).get("id")
    if not pid:
        return None
    with _conn() as c:
        return c.execute("select * from customers where id = ?", (pid,)).fetchone()


def _nights(arrival: str, departure: str) -> int:
    return (date.fromisoformat(departure) - date.fromisoformat(arrival)).days


def _fmt_date(iso: str) -> str:
    return date.fromisoformat(iso).strftime("%a %-d %b %Y")


def _eur(v: float) -> str:
    return f"€{v:,.2f}"


def _reservation(number: str, guest: sqlite3.Row) -> sqlite3.Row | None:
    with _conn() as c:
        return c.execute(
            "select r.*, k.name as category, k.description as category_description "
            "from reservations r join categories k on k.id = r.category_id "
            "where r.number = ? and r.customer_id = ?",
            (number.strip().upper(), guest["id"]),
        ).fetchone()


def _stay_lines(r: sqlite3.Row) -> list[dict[str, str]]:
    guests = f"{r['adults']} adult{'s' if r['adults'] != 1 else ''}" + (
        f", {r['children']} child{'ren' if r['children'] != 1 else ''}" if r["children"] else ""
    )
    return [
        {"label": "Stay", "value": f"{r['number']} · {r['category']}"},
        {
            "label": "Dates",
            "value": f"{_fmt_date(r['arrival'])} to {_fmt_date(r['departure'])}, {_nights(r['arrival'], r['departure'])} nights",
        },
        {"label": "Guests", "value": guests},
    ]


def _balance(c: sqlite3.Connection, number: str, r: sqlite3.Row) -> tuple[float, float, float]:
    room = r["rate_per_night"] * _nights(r["arrival"], r["departure"])
    extras = c.execute(
        "select coalesce(sum(amount), 0) from reservation_products where reservation_number = ?",
        (number,),
    ).fetchone()[0]
    paid = c.execute(
        "select coalesce(sum(amount), 0) from payments where reservation_number = ?", (number,)
    ).fetchone()[0]
    return room, extras, paid


NOT_SIGNED_IN = "nobody is signed in; ask the guest to sign in to the hotel first"


def _stay(number: str, guest: sqlite3.Row) -> dict:
    """The booking as structured data, for the stay pane."""
    r = _reservation(number, guest)
    with _conn() as c:
        room, extras, paid = _balance(c, r["number"], r)
        products = c.execute(
            "select p.name, rp.quantity, rp.amount, p.unit from reservation_products rp "
            "join products p on p.id = rp.product_id where rp.reservation_number = ?",
            (r["number"],),
        ).fetchall()
        requests = c.execute(
            "select text, status, created_at from requests where reservation_number = ? order by id",
            (r["number"],),
        ).fetchall()
        payments = c.execute(
            "select amount, description, card_last4, created_at from payments "
            "where reservation_number = ? order by id",
            (r["number"],),
        ).fetchall()
        prop = c.execute("select * from property").fetchone()
    return {
        "number": r["number"],
        "state": r["state"],
        "guest": {
            "name": guest["name"],
            "email": guest["email"],
            "phone": guest["phone"],
            "loyalty": guest["loyalty"],
        },
        "property": {
            "name": prop["name"],
            "city": prop["city"],
            "address": prop["address"],
            "phone": prop["phone"],
            "check_in_from": prop["check_in_from"],
            "check_out_until": prop["check_out_until"],
            "currency": prop["currency"],
        },
        "room": {"category": r["category"], "description": r["category_description"]},
        "arrival": r["arrival"],
        "departure": r["departure"],
        "nights": _nights(r["arrival"], r["departure"]),
        "adults": r["adults"],
        "children": r["children"],
        "rate_per_night": r["rate_per_night"],
        "estimated_arrival": r["estimated_arrival"] or "",
        "notes": r["notes"] or "",
        "extras": [
            {"name": p[0], "quantity": p[1], "amount": p[2], "unit": p[3]} for p in products
        ],
        "requests": [{"text": q[0], "status": q[1], "at": q[2]} for q in requests],
        "payments": [
            {"amount": p[0], "description": p[1], "card_last4": p[2], "at": p[3]} for p in payments
        ],
        "totals": {"room": room, "extras": extras, "paid": paid, "due": room + extras - paid},
        "card": f"{guest['card_brand']} •••• {guest['card_last4']}",
    }


def _show_stay(number: str, guest: sqlite3.Row) -> None:
    """Publish the stay as an artifact: the host opens it in the Reservations pane."""
    current_turn().publish("stay", f"Your stay · {number}", _stay(number, guest))


def _summary(number: str, guest: sqlite3.Row) -> str:
    r = _reservation(number, guest)
    with _conn() as c:
        room, extras, paid = _balance(c, r["number"], r)
        products = c.execute(
            "select p.name, rp.quantity, rp.amount from reservation_products rp "
            "join products p on p.id = rp.product_id where rp.reservation_number = ?",
            (r["number"],),
        ).fetchall()
        requests = c.execute(
            "select text, status from requests where reservation_number = ? order by id",
            (r["number"],),
        ).fetchall()
        prop = c.execute("select * from property").fetchone()
    return (
        f"reservation {r['number']} at {prop['name']}, {prop['city']} ({prop['address']}); "
        f"state {r['state']}\n"
        f"room: {r['category']} ({r['category_description']}); dates {r['arrival']} to "
        f"{r['departure']} ({_nights(r['arrival'], r['departure'])} nights); "
        f"{r['adults']} adults, {r['children']} children; rate {_eur(r['rate_per_night'])} per night\n"
        f"extras: {', '.join(f'{p[0]} x{p[1]} {_eur(p[2])}' for p in products) or 'none'}\n"
        f"room total {_eur(room)}, extras {_eur(extras)}, paid {_eur(paid)}, "
        f"due {_eur(room + extras - paid)}\n"
        f"estimated arrival: {r['estimated_arrival'] or 'not given'}; notes: {r['notes'] or 'none'}\n"
        f"requests: {', '.join(f'{q[0]} ({q[1]})' for q in requests) or 'none'}\n"
        f"check-in from {prop['check_in_from']}, check-out until {prop['check_out_until']}; "
        f"card on file {guest['card_brand']} •••• {guest['card_last4']}"
    )


def hotel_tools(only: list[str] | None = None) -> Capability:
    """The hotel's tools, or the subset named in ``only``, as a capability."""

    def my_reservations() -> str:
        """The signed-in guest's reservations, upcoming first, with the full summary of
        the next upcoming stay (room, dates, guests, extras, paid and due). Call this
        first; for most questions it is the only call needed."""
        turn = current_turn()
        guest = _guest()
        if guest is None:
            turn.tool_call("my_reservations", {}, "not signed in")
            return NOT_SIGNED_IN
        with _conn() as c:
            rows = c.execute(
                "select r.number, k.name as category, r.arrival, r.departure, r.adults, "
                "r.children, r.state from reservations r join categories k on k.id = r.category_id "
                "where r.customer_id = ? order by r.arrival desc",
                (guest["id"],),
            ).fetchall()
        upcoming = [
            r for r in rows if r["departure"] >= TODAY.isoformat() and r["state"] != "cancelled"
        ]
        turn.tool_call(
            "my_reservations", {}, f"{len(rows)} reservations, {len(upcoming)} upcoming"
        )
        lines = "\n".join(
            f"{r['number']}: {r['category']}, {_fmt_date(r['arrival'])} to {_fmt_date(r['departure'])}, "
            f"{r['adults']} adults {r['children']} children, {r['state']}"
            for r in rows
        )
        head = (
            f"guest {guest['name']} ({guest['loyalty'] or 'no loyalty tier'}); today is "
            f"{TODAY.isoformat()}; {len(upcoming)} upcoming\n{lines}"
        )
        if upcoming:
            nxt = min(upcoming, key=lambda r: r["arrival"])
            _show_stay(nxt["number"], guest)
            return (
                head
                + "\n\nnext stay in full (the booking summary is on screen as a work surface, so "
                "do not repeat every line; give the headline and what is due):\n"
                + _summary(nxt["number"], guest)
            )
        return head

    def stay_summary(number: str) -> str:
        """Everything about one reservation by number: room, dates, guests, rate, extras,
        what has been paid and what is due, notes. my_reservations already includes this
        for the next stay; use this for another one."""
        turn = current_turn()
        guest = _guest()
        if guest is None:
            return NOT_SIGNED_IN
        r = _reservation(number, guest)
        if r is None:
            turn.tool_call("stay_summary", {"number": number}, "not this guest's reservation")
            return f"no reservation {number} for {guest['name']}"
        turn.tool_call(
            "stay_summary",
            {"number": r["number"]},
            f"{r['category']}, {_fmt_date(r['arrival'])} to {_fmt_date(r['departure'])}, {r['state']}",
        )
        _show_stay(r["number"], guest)
        return _summary(r["number"], guest)

    def check_in(number: str, estimated_arrival: str, notes: str = "") -> str:
        """Online check-in for an upcoming stay: records the estimated arrival time
        (HH:MM) and any note for the front desk, and confirms the guest's details are
        on file. Nothing is charged."""
        turn = current_turn()
        guest = _guest()
        if guest is None:
            return NOT_SIGNED_IN
        r = _reservation(number, guest)
        if r is None:
            return f"no reservation {number} for {guest['name']}"
        if r["state"] != "confirmed":
            turn.tool_call("check_in", {"number": r["number"]}, f"state is {r['state']}")
            return f"reservation {r['number']} is {r['state']}; online check-in applies to confirmed stays"
        try:
            datetime.strptime(estimated_arrival.strip(), "%H:%M")
        except ValueError:
            return "estimated_arrival must be a time like 18:30"
        with _conn() as c:
            c.execute(
                "update reservations set estimated_arrival = ?, notes = ?, state = 'checked-in online' where number = ?",
                (estimated_arrival.strip(), notes.strip() or r["notes"], r["number"]),
            )
            prop = c.execute("select * from property").fetchone()
        late = estimated_arrival.strip() >= "22:00"
        turn.tool_call(
            "check_in",
            {"number": r["number"], "estimated_arrival": estimated_arrival},
            "checked in online",
        )
        return (
            f"checked in online: {r['number']}, arriving {estimated_arrival} on {_fmt_date(r['arrival'])}; "
            f"details on file: {guest['name']}, {guest['email']}, {guest['phone']}; card {guest['card_brand']} •••• {guest['card_last4']}. "
            f"Rooms are ready from {prop['check_in_from']}."
            + (" The front desk is open all night, so a late arrival is fine." if late else "")
        )

    def cancellation_terms(number: str) -> str:
        """What cancelling a reservation would cost or refund today, under the property's
        policy. Read-only; call before cancel_reservation."""
        turn = current_turn()
        guest = _guest()
        if guest is None:
            return NOT_SIGNED_IN
        r = _reservation(number, guest)
        if r is None:
            return f"no reservation {number} for {guest['name']}"
        with _conn() as c:
            _room, _extras, paid = _balance(c, r["number"], r)
        days_before = (date.fromisoformat(r["arrival"]) - TODAY).days
        fee = 0.0 if days_before >= 2 else r["rate_per_night"]
        refund = max(0.0, paid - fee)
        turn.tool_call(
            "cancellation_terms",
            {"number": r["number"]},
            f"{days_before} days before arrival; fee {_eur(fee)}, refund {_eur(refund)}",
        )
        return (
            f"{r['number']}: arrival in {days_before} days. Policy: free until 48 hours before arrival, then the first night. "
            f"Fee {_eur(fee)}; paid so far {_eur(paid)}; refund {_eur(refund)} to {guest['card_brand']} •••• {guest['card_last4']}."
        )

    def cancel_reservation(number: str) -> str:
        """Prepare the cancellation of a reservation for the guest to confirm in checkout.
        Nothing is cancelled until they confirm there; your turn ends after you tell
        them what is waiting."""
        turn = current_turn()
        guest = _guest()
        if guest is None:
            return NOT_SIGNED_IN
        r = _reservation(number, guest)
        if r is None:
            return f"no reservation {number} for {guest['name']}"
        if r["state"] == "cancelled":
            return f"{r['number']} is already cancelled"
        with _conn() as c:
            _room, _extras, paid = _balance(c, r["number"], r)
        days_before = (date.fromisoformat(r["arrival"]) - TODAY).days
        fee = 0.0 if days_before >= 2 else r["rate_per_night"]
        refund = max(0.0, paid - fee)
        number_, last4, brand = r["number"], guest["card_last4"], guest["card_brand"]

        def execute() -> str:
            with _conn() as c:
                c.execute(
                    "update reservations set state = 'cancelled' where number = ?", (number_,)
                )
                if refund:
                    c.execute(
                        "insert into payments values (null, ?, ?, ?, ?, ?)",
                        (number_, -refund, "Refund on cancellation", last4, TODAY.isoformat()),
                    )
            return (
                f"Reservation {number_} is cancelled. Cancellation fee {_eur(fee)}; "
                f"refund {_eur(refund)} to {brand} •••• {last4} within 5 working days."
            )

        propose(
            f"Cancel reservation {r['number']}?",
            execute,
            lines=_stay_lines(r) + [{"label": "Cancellation fee", "value": _eur(fee)}],
            amount=f"refund {_eur(refund)}" if refund else _eur(0),
            card=f"{brand} •••• {last4}",
            confirm_label="Cancel the reservation",
            cancel_label="Keep it",
            title=f"Cancel {r['number']}",
        )
        turn.tool_call(
            "cancel_reservation",
            {"number": r["number"]},
            f"prepared; fee {_eur(fee)}, refund {_eur(refund)}",
        )
        return (
            f"prepared the cancellation of {r['number']} for the guest to confirm in checkout: fee "
            f"{_eur(fee)}, refund {_eur(refund)}. Tell the guest it is waiting in checkout and that "
            "nothing is cancelled until they confirm there, then finish."
        )

    def products_available(number: str) -> str:
        """The extras that can be added to a stay, with prices and what the stay already
        has. Read-only."""
        turn = current_turn()
        guest = _guest()
        if guest is None:
            return NOT_SIGNED_IN
        r = _reservation(number, guest)
        if r is None:
            return f"no reservation {number} for {guest['name']}"
        with _conn() as c:
            products = c.execute("select * from products order by id").fetchall()
            have = c.execute(
                "select p.name, rp.quantity from reservation_products rp join products p on p.id = rp.product_id where rp.reservation_number = ?",
                (r["number"],),
            ).fetchall()
        turn.tool_call("products_available", {"number": r["number"]}, f"{len(products)} products")
        nights = _nights(r["arrival"], r["departure"])
        return (
            f"stay {r['number']}: {nights} nights, {r['adults']} adults {r['children']} children. "
            f"Already added: {', '.join(f'{h[0]} x{h[1]}' for h in have) or 'nothing'}.\n"
            + "\n".join(
                f"{p['name']}: {_eur(p['price'])} {p['unit']} ({p['description']})"
                for p in products
            )
        )

    def add_product(number: str, product: str, quantity: int = 1) -> str:
        """Prepare an extra for the guest to confirm and pay in checkout. quantity is
        units: nights for parking, person-nights for breakfast, count for the rest.
        Nothing is added or charged until they confirm there; your turn ends after
        you tell them what is waiting."""
        turn = current_turn()
        guest = _guest()
        if guest is None:
            return NOT_SIGNED_IN
        r = _reservation(number, guest)
        if r is None:
            return f"no reservation {number} for {guest['name']}"
        with _conn() as c:
            p = c.execute(
                "select * from products where lower(name) = lower(?)", (product.strip(),)
            ).fetchone()
        if p is None:
            return f"no product called {product!r}; see products_available"
        qty = max(1, int(quantity))
        amount = p["price"] * qty
        number_, pid, pname, last4, brand = (
            r["number"],
            p["id"],
            p["name"],
            guest["card_last4"],
            guest["card_brand"],
        )

        def execute() -> str:
            with _conn() as c:
                c.execute(
                    "insert into reservation_products values (?, ?, ?, ?, ?)",
                    (number_, pid, qty, amount, TODAY.isoformat()),
                )
                c.execute(
                    "insert into payments values (null, ?, ?, ?, ?, ?)",
                    (number_, amount, f"{pname} x{qty}", last4, TODAY.isoformat()),
                )
            return f"{pname} x{qty} added to {number_}. {_eur(amount)} charged to {brand} •••• {last4}."

        propose(
            f"Add {pname} to your stay?",
            execute,
            lines=_stay_lines(r)
            + [{"label": pname, "value": f"{qty} × {_eur(p['price'])} {p['unit']}"}],
            amount=_eur(amount),
            card=f"{brand} •••• {last4}",
            confirm_label=f"Pay {_eur(amount)}",
            cancel_label="Not now",
            title=f"{pname} for {number_}",
        )
        turn.tool_call(
            "add_product",
            {"number": r["number"], "product": pname, "quantity": qty},
            f"prepared {_eur(amount)}",
        )
        return (
            f"prepared {pname} x{qty} for {_eur(amount)} on {r['number']}, waiting in checkout. Tell the "
            "guest what is waiting there and that nothing is charged until they confirm, then finish."
        )

    def create_request(number: str, text: str) -> str:
        """Send a request to the hotel for a stay: housekeeping, a taxi, a restaurant
        table, a preference such as a quiet room. Nothing is charged; the hotel confirms
        by message."""
        turn = current_turn()
        guest = _guest()
        if guest is None:
            return NOT_SIGNED_IN
        r = _reservation(number, guest)
        if r is None:
            return f"no reservation {number} for {guest['name']}"
        if not text.strip():
            return "the request text is empty"
        with _conn() as c:
            cur = c.execute(
                "insert into requests values (null, ?, ?, 'received', ?)",
                (r["number"], text.strip(), datetime.now().isoformat(timespec="minutes")),
            )
            rid = cur.lastrowid
        turn.tool_call(
            "create_request",
            {"number": r["number"], "text": text.strip()[:60]},
            f"request #{rid} received",
        )
        return f"request #{rid} received for {r['number']}: {text.strip()}. The hotel will confirm by message; most requests are answered within an hour."

    def property_info(topic: str = "") -> str:
        """Facts about the hotel: check-in and check-out times, breakfast, parking, wifi,
        spa, pets, cancellation policy, address, airport transfer. Give a topic, or leave
        it empty for everything."""
        turn = current_turn()
        with _conn() as c:
            prop = c.execute("select * from property").fetchone()
            rows = c.execute("select topic, text from property_info").fetchall()
        q = topic.strip().lower()
        hits = [r for r in rows if not q or q in r["topic"] or q in r["text"].lower()] or rows
        turn.tool_call("property_info", {"topic": topic}, f"{len(hits)} topics")
        return f"{prop['name']}, {prop['address']}, {prop['phone']}\n" + "\n".join(
            f"{r['topic']}: {r['text']}" for r in hits
        )

    everything = {
        "my_reservations": my_reservations,
        "stay_summary": stay_summary,
        "check_in": check_in,
        "cancellation_terms": cancellation_terms,
        "cancel_reservation": cancel_reservation,
        "products_available": products_available,
        "add_product": add_product,
        "create_request": create_request,
        "property_info": property_info,
    }
    chosen = [everything[n] for n in (only or list(everything))]
    return Capability(
        name="hotel_tools",
        tools=lambda: chosen,
        instructions=(
            " The tools are scoped to the guest who is signed in; if a tool says nobody is "
            "signed in, say so and stop. Start from my_reservations to find the reservation "
            "number unless the guest gave it. Tables and confirmations are shown to the guest, "
            "so your result is two or three plain sentences with the key facts. Never invent "
            "a reservation, a price or a policy."
        ),
    )


def tool_names() -> list[Callable]:  # pragma: no cover - convenience for the skill reference
    return hotel_tools().tools()
