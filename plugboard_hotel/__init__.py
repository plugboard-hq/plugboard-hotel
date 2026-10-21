"""Guest-facing agents for a hotel on Plugboard.

One capability, the hotel's tools scoped to the signed-in guest, and six
agents over it, each with its own persona and a subset of the tools, so the
supervisor's routing stays visible: Reservations, Check-in, Cancellation,
Extras, Requests, Property. Anything that cancels or charges is prepared as a
proposal the guest confirms in checkout, outside the turn. Vocabulary follows a hotel's: reservation,
guest, product, bill.

Importing this package registers the manifests; the host names it in
PLUGBOARD_EXTRA_AGENTS and installs the agents for the hotel's organisation.
"""

from pathlib import Path

from plugboard import AgentManifest, register
from plugboard.capabilities import ask_user

from plugboard_hotel.tools import hotel_tools

SOURCE = "https://github.com/plugboard-hq/plugboard-hotel"
FRONTEND = str(Path(__file__).parent / "static" / "hotel.js")
# Agents that ask the guest to confirm money open the checkout pane for it.
CHECKOUT = [
    {"kind": "proposal", "key": "checkout", "component": "CheckoutPane", "title": "Checkout"}
]
SNAPSHOT = (
    " The demo's calendar is fixed: today is 21 October 2026. Dates are shown as the "
    "guest would read them."
)

register(
    AgentManifest(
        name="reservations",
        title="Reservations",
        routing_description=(
            "The guest's stays at the hotel: 'my booking', 'when do I arrive', 'what room do I "
            "have', 'how much is left to pay', 'show my upcoming trip'. Give it the question "
            "and the reservation number if the guest said one; it returns the stay details. Also "
            "the agent for a checkout event (a payment or cancellation confirmed or declined): it "
            "confirms the outcome and gives the updated booking. It does not change anything "
            "itself; for check-in, cancelling, extras or requests use those agents."
        ),
        persona=(
            "You tell the signed-in guest about their reservations. Call my_reservations once; it "
            "includes the next stay in full. Call stay_summary only for a different stay the "
            "guest names. Answer in two or three sentences with dates, room, guests and what "
            "is due, then finish. For a checkout event that confirmed a payment or cancellation, "
            "call my_reservations and reply as a booking confirmation: what the stay now "
            "includes, what was charged or refunded and to which card, and what is still due. "
            "For a declined checkout, one sentence: nothing changed, and they can ask again." + SNAPSHOT
        ),
        capabilities=[hotel_tools(["my_reservations", "stay_summary"]), ask_user()],
        examples=["show me my upcoming stay", "how much is left to pay on my booking?"],
        source=SOURCE,
        max_iters=5,
    )
)

register(
    AgentManifest(
        name="checkin",
        title="Check-in",
        routing_description=(
            "Online check-in and arrival: 'I'll arrive at 11pm', 'check me in', 'is a late "
            "arrival ok', 'what time can I get my room'. Give it the arrival time and any note; "
            "it checks the guest in online, confirms their details are on file, and says when "
            "rooms are ready. Nothing is charged."
        ),
        persona=(
            "You check the signed-in guest in online for their next stay. Call my_reservations, "
            "then check_in with the arrival time the guest gave as HH:MM (ask with ask_user only "
            "if they gave none) and any note for the front desk. Confirm in two sentences: when "
            "they arrive, that their details are on file, when rooms are ready." + SNAPSHOT
        ),
        capabilities=[hotel_tools(["my_reservations", "check_in", "property_info"]), ask_user()],
        examples=["I'll arrive around 11pm, is that ok?", "check me in for my stay"],
        source=SOURCE,
        max_iters=6,
    )
)

register(
    AgentManifest(
        name="cancellation",
        title="Cancellation",
        routing_description=(
            "Cancelling a stay and what it costs: 'can I cancel', 'what's the cancellation fee', "
            "'cancel my booking'. Give it the reservation if the guest named one; it explains the "
            "terms, and only cancels after the guest confirms on a card it shows them."
        ),
        persona=(
            "You handle cancellations for the signed-in guest. Call my_reservations, then "
            "cancellation_terms for the next stay (or the one named) and tell the guest the fee "
            "and refund plainly. When the guest asks to cancel, call cancel_reservation straight "
            "away; it prepares the cancellation for the guest to confirm in checkout after your "
            "reply. Tell them in one or two sentences what is waiting there and that nothing is "
            "cancelled until they confirm, then finish." + SNAPSHOT
        ),
        capabilities=[
            hotel_tools(["my_reservations", "cancellation_terms", "cancel_reservation"]),
            ask_user(),
        ],
        examples=["what would it cost to cancel my stay?", "cancel my booking"],
        source=SOURCE,
        frontend=FRONTEND,
        surfaces=CHECKOUT,
        max_iters=6,
    )
)

register(
    AgentManifest(
        name="extras",
        title="Extras",
        routing_description=(
            "Adding things to a stay: breakfast, parking, late check-out, airport transfer, spa. "
            "'add breakfast', 'can I park', 'book a transfer from the airport'. Give it what the "
            "guest wants and for how many; it quotes the price, charges the card on file after "
            "the guest confirms on a card it shows them, and says what was added."
        ),
        persona=(
            "You add extras to the signed-in guest's stay. Call my_reservations (it includes the "
            "next stay with its nights, guests and what it already has), then add_product with "
            "the quantity worked out from the stay: nights for parking and late check-out per "
            "stay, adults times nights for breakfast, one per transfer or treatment unless the "
            "guest said otherwise. Do not ask the guest to confirm quantities or prices: add_product "
            "prepares the charge and the guest confirms it in checkout after your reply. Tell them "
            "in one or two sentences what is waiting in checkout and that nothing is charged until "
            "they confirm, then finish. Only use ask_user if the guest named no product at all."
            + SNAPSHOT
        ),
        capabilities=[
            hotel_tools(["my_reservations", "products_available", "add_product"]),
            ask_user(),
        ],
        examples=["add breakfast to my stay", "I need parking for the whole stay"],
        source=SOURCE,
        frontend=FRONTEND,
        surfaces=CHECKOUT,
        max_iters=7,
    )
)

register(
    AgentManifest(
        name="requests",
        title="Requests",
        routing_description=(
            "Asking the hotel for something during a stay: towels, pillows, a taxi, a restaurant "
            "table, a quiet room, a cot, an invoice. 'send extra towels', 'book a taxi for 7am', "
            "'I'd like a high floor'. Give it the request as the guest said it; it sends it to "
            "the hotel and says when they will hear back. Nothing is charged."
        ),
        persona=(
            "You pass the signed-in guest's requests to the hotel. Call my_reservations for the "
            "next stay, then create_request with the request in the guest's words plus any time "
            "or room detail; do not ask the guest anything first. Confirm in one sentence what "
            "was sent and when the hotel answers." + SNAPSHOT
        ),
        capabilities=[hotel_tools(["my_reservations", "create_request"]), ask_user()],
        examples=["please send up extra towels", "book me a taxi to the airport at 7am"],
        source=SOURCE,
        max_iters=5,
    )
)

register(
    AgentManifest(
        name="property",
        title="Property",
        routing_description=(
            "Facts about the hotel itself: check-in and check-out times, breakfast hours, "
            "parking, wifi, spa, pets, cancellation policy, address, how to get there. 'what "
            "time is breakfast', 'is there parking', 'where is the hotel'. Give it the topic; "
            "it answers from the hotel's information. Needs no reservation."
        ),
        persona=(
            "You answer questions about Hotel Aurora from property_info. Call it with the topic "
            "and answer in one or two sentences with the specific times, prices or directions."
            + SNAPSHOT
        ),
        capabilities=[hotel_tools(["property_info"])],
        examples=["what time is breakfast?", "is there parking at the hotel?"],
        source=SOURCE,
        max_iters=3,
    )
)
