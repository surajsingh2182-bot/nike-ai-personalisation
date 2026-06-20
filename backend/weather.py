"""
Open-Meteo weather context (PRD section 7, P1-1).

No API key, no account, free forever. Used to contextualise recommendations
(e.g. rain -> waterproof gear in the reason copy). Per OQ-2 this affects the
reason/copy layer only, not the ML ranking, for v1.

Results are cached in-memory per city with a TTL so we make at most one call
per city per window. Any failure degrades gracefully to a neutral fallback so
a cold Render instance or a network blip never breaks a recommendation.
"""

import time

import httpx

_CACHE = {}
_TTL_SECONDS = 30 * 60  # 30 minutes

# WMO weather codes -> (condition label, surfaces-waterproof flag)
_WMO = {
    0: "clear", 1: "mainly clear", 2: "partly cloudy", 3: "overcast",
    45: "foggy", 48: "foggy",
    51: "drizzle", 53: "drizzle", 55: "drizzle",
    61: "rainy", 63: "rainy", 65: "heavy rain",
    66: "freezing rain", 67: "freezing rain",
    71: "snow", 73: "snow", 75: "heavy snow",
    80: "rain showers", 81: "rain showers", 82: "heavy showers",
    95: "thunderstorm", 96: "thunderstorm", 99: "thunderstorm",
}

_WET_CODES = {51, 53, 55, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99}


def _fallback(city):
    return {
        "city": city,
        "condition": "unavailable",
        "temperature_c": None,
        "humidity": None,
        "is_wet": False,
    }


def get_weather(city, latitude, longitude):
    """Return current-weather context for a city, cached and fail-safe."""
    now = time.time()
    cached = _CACHE.get(city)
    if cached and now - cached["_ts"] < _TTL_SECONDS:
        return cached["data"]

    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": "temperature_2m,relative_humidity_2m,weather_code",
    }
    try:
        resp = httpx.get(url, params=params, timeout=4.0)
        resp.raise_for_status()
        current = resp.json().get("current", {})
        code = int(current.get("weather_code", -1))
        humidity = current.get("relative_humidity_2m")
        temp = current.get("temperature_2m")

        condition = _WMO.get(code, "clear")
        is_wet = code in _WET_CODES
        # High humidity reads as "humid" when it isn't actively raining.
        if not is_wet and humidity is not None and humidity >= 75:
            condition = "humid"

        data = {
            "city": city,
            "condition": condition,
            "temperature_c": round(temp) if temp is not None else None,
            "humidity": humidity,
            "is_wet": is_wet,
        }
    except Exception:
        data = _fallback(city)

    _CACHE[city] = {"_ts": now, "data": data}
    return data
