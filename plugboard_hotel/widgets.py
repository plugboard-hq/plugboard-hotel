"""The hotel's own widget kinds. Core knows the envelope; the hotel's pane draws them."""

from __future__ import annotations

from typing import Any, Literal

from plugboard.widgets import Widget


class StayWidget(Widget):
    """A reservation as a work surface: everything on the booking confirmation."""

    kind: Literal["stay"] = "stay"
    stay: dict[str, Any]
