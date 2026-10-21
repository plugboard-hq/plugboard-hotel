# plugboard-hotel

Guest-facing agents for a hotel on [Plugboard](https://github.com/plugboard-hq/plugboard):
what a guest asks a hotel about their booking, as six agents over one set of tools scoped
to the guest who is signed in.

| Agent | What it does | Money |
|---|---|---|
| Reservations | your stays, a stay summary, what is due | no |
| Check-in | online check-in: arrival time, details on file | no |
| Cancellation | the terms today, and cancelling after you confirm | refund |
| Extras | breakfast, parking, late check-out, transfer, spa, charged to the card on file after you confirm | charge |
| Requests | towels, a taxi, a table, a quiet room, sent to the hotel | no |
| Property | times, breakfast, parking, wifi, spa, pets, address | no |

Anything that cancels or charges asks first with a confirm card showing the stay, the
amount and the card. The vocabulary is a hotel's: reservation, guest, product, bill.

## Install into a host

```
cd plugboard
uv add --group agents ../plugboard-hotel
echo 'PLUGBOARD_EXTRA_AGENTS=plugboard_hotel' >> .env       # comma-separated with others
uv run uvicorn project.asgi:application --port 8010
```

Then install the agents for the hotel's organisation under Console → Organisations. The
guests sign in through the host's simulated guest directory; the seed's guests match it.
`python -m plugboard_hotel.data.seed` rebuilds `plugboard_hotel/data/hotel.sqlite`.
