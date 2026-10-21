"""Build hotel.sqlite: one property, its rooms, products, and the guests' reservations.

Run: ``python -m plugboard_hotel.data.seed``. Deterministic, stdlib only. Guest ids
match the host's simulated guest directory, so the person who signs in is the
customer the tools scope to.
"""

from __future__ import annotations

import sqlite3
from datetime import date, timedelta
from pathlib import Path

OUT = Path(__file__).with_name("hotel.sqlite")
TODAY = date(2026, 10, 21)


def build(path: Path = OUT) -> None:
    if path.exists():
        path.unlink()
    conn = sqlite3.connect(path)
    c = conn.cursor()
    c.executescript(
        """
        create table property (
            id integer primary key, name text, city text, address text, phone text,
            check_in_from text, check_out_until text, currency text);
        create table property_info (topic text, text text);
        create table categories (
            id integer primary key, name text, description text, max_guests integer);
        create table customers (
            id text primary key, name text, email text, phone text, loyalty text,
            card_brand text, card_last4 text, card_expiry text);
        create table reservations (
            number text primary key, customer_id text, category_id integer,
            arrival text, departure text, adults integer, children integer,
            rate_per_night real, state text, estimated_arrival text, notes text,
            created_at text);
        create table products (
            id integer primary key, name text, description text, price real, unit text);
        create table reservation_products (
            reservation_number text, product_id integer, quantity integer, amount real,
            added_at text);
        create table requests (
            id integer primary key autoincrement, reservation_number text, text text,
            status text, created_at text);
        create table payments (
            id integer primary key autoincrement, reservation_number text, amount real,
            description text, card_last4 text, created_at text);
        """
    )
    c.execute(
        "insert into property values (1, 'Hotel Aurora', 'Kraków', "
        "'ul. Floriańska 12, 31-021 Kraków', '+48 12 555 0100', '15:00', '11:00', 'EUR')"
    )
    c.executemany(
        "insert into property_info values (?, ?)",
        [
            (
                "check-in",
                "Check-in from 15:00. Early check-in from 12:00 when a room is ready, €30; ask on the day.",
            ),
            (
                "check-out",
                "Check-out until 11:00. Late check-out until 14:00 is €40, until 16:00 is €70.",
            ),
            (
                "breakfast",
                "Breakfast is served in the Atrium 06:30 to 10:30 on weekdays and 07:00 to 11:00 at weekends. €18 per person per day.",
            ),
            (
                "parking",
                "Underground parking at €20 per night, entrance on ul. Świętego Tomasza. Height limit 2.0 m.",
            ),
            ("wifi", "Wi-Fi is free throughout the hotel; network Aurora-Guest, no password."),
            (
                "spa",
                "The spa on floor -1 is open 08:00 to 21:00; sauna and pool included, treatments bookable.",
            ),
            ("pets", "Dogs up to 15 kg are welcome at €25 per night; one per room."),
            (
                "cancellation",
                "Free cancellation until 48 hours before arrival. Later cancellations are charged the first night. Non-refundable rates are not refunded.",
            ),
            (
                "address",
                "ul. Floriańska 12, 31-021 Kraków, Poland. Three minutes on foot from the Main Square, twelve from the railway station.",
            ),
            (
                "transfer",
                "Airport transfer from Kraków Balice is €45 each way for up to three people; book a day ahead.",
            ),
        ],
    )
    c.executemany(
        "insert into categories values (?, ?, ?, ?)",
        [
            (1, "Classic", "22 m², queen bed, courtyard view", 2),
            (2, "Deluxe", "30 m², king bed, street view, bath", 3),
            (3, "Suite", "48 m², separate living room, Old Town view", 4),
        ],
    )
    c.executemany(
        "insert into customers values (?, ?, ?, ?, ?, ?, ?, ?)",
        [
            (
                "maya.lindqvist",
                "Maya Lindqvist",
                "maya.lindqvist@guest.aurora.example",
                "+46 70 123 4567",
                "Aurora Club · Gold",
                "Visa",
                "4242",
                "09/28",
            ),
            (
                "tomas.horak",
                "Tomáš Horák",
                "tomas.horak@guest.aurora.example",
                "+420 601 234 567",
                "",
                "Mastercard",
                "4444",
                "02/27",
            ),
            (
                "priya.nair",
                "Priya Nair",
                "priya.nair@guest.aurora.example",
                "+44 7700 900123",
                "Aurora Club · Silver",
                "Amex",
                "1005",
                "11/27",
            ),
            (
                "jonas.weber",
                "Jonas Weber",
                "jonas.weber@guest.aurora.example",
                "+49 151 2345678",
                "",
                "Visa",
                "0005",
                "05/29",
            ),
        ],
    )
    d = lambda n: (TODAY + timedelta(days=n)).isoformat()
    c.executemany(
        "insert into reservations values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
            (
                "AUR-10234",
                "maya.lindqvist",
                2,
                d(9),
                d(13),
                2,
                0,
                142.0,
                "confirmed",
                "",
                "",
                d(-20),
            ),
            (
                "AUR-10102",
                "maya.lindqvist",
                1,
                d(-60),
                d(-57),
                1,
                0,
                98.0,
                "checked-out",
                "",
                "",
                d(-75),
            ),
            (
                "AUR-10251",
                "tomas.horak",
                1,
                d(2),
                d(4),
                1,
                0,
                104.0,
                "confirmed",
                "",
                "arriving by car",
                d(-5),
            ),
            ("AUR-10260", "priya.nair", 3, d(21), d(26), 2, 1, 240.0, "confirmed", "", "", d(-3)),
            (
                "AUR-10277",
                "jonas.weber",
                2,
                d(-1),
                d(2),
                2,
                0,
                138.0,
                "checked-in",
                "18:30",
                "",
                d(-12),
            ),
        ],
    )
    c.executemany(
        "insert into products values (?, ?, ?, ?, ?)",
        [
            (1, "Breakfast", "Buffet breakfast in the Atrium", 18.0, "per person per night"),
            (2, "Parking", "Underground parking", 20.0, "per night"),
            (3, "Late check-out", "Until 14:00", 40.0, "per stay"),
            (4, "Airport transfer", "Kraków Balice, each way, up to three people", 45.0, "each"),
            (5, "Spa treatment", "60-minute massage", 60.0, "each"),
        ],
    )
    c.executemany(
        "insert into reservation_products values (?, ?, ?, ?, ?)",
        [("AUR-10260", 1, 3, 270.0, d(-3)), ("AUR-10277", 2, 3, 60.0, d(-12))],
    )
    c.executemany(
        "insert into payments values (null, ?, ?, ?, ?, ?)",
        [
            ("AUR-10234", 142.0, "Deposit, first night", "4242", d(-20)),
            ("AUR-10277", 474.0, "Stay, three nights, and parking", "0005", d(-1)),
        ],
    )
    c.executemany(
        "insert into requests values (null, ?, ?, ?, ?)",
        [("AUR-10277", "Extra pillows, please", "done", d(-1) + "T19:10")],
    )
    conn.commit()
    conn.close()
    print(f"wrote {path}")


if __name__ == "__main__":
    build()
