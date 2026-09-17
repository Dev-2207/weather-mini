from pathlib import Path

from flask import Flask, request, jsonify, render_template, send_from_directory
import requests

BASE_DIR = Path(__file__).resolve().parent
app = Flask(__name__, template_folder=str(BASE_DIR))


# Home Page
@app.route("/")
def home():
    return render_template("index.html")


@app.route("/style.css")
def stylesheet():
    return send_from_directory(BASE_DIR, "style.css")


@app.route("/script.js")
def javascript():
    return send_from_directory(BASE_DIR, "script.js")


# Weather API
@app.route("/api/weather", methods=["GET"])
def get_weather():

    city = request.args.get("city")

    if not city:
        return jsonify({
            "error": "City name is required"
        }), 400

    try:
        # -----------------------------
        # 1. City Geocoding
        # -----------------------------
        geo_url = "https://geocoding-api.open-meteo.com/v1/search"

        geo_params = {
            "name": city,
            "count": 1,
            "language": "en",
            "format": "json"
        }

        geo_response = requests.get(
            geo_url,
            params=geo_params,
            timeout=10
        )

        geo_data = geo_response.json()

        if "results" not in geo_data or not geo_data["results"]:
            return jsonify({
                "error": "City not found"
            }), 404

        location = geo_data["results"][0]

        latitude = location["latitude"]
        longitude = location["longitude"]

        # -----------------------------
        # 2. Weather Data
        # -----------------------------
        weather_url = "https://api.open-meteo.com/v1/forecast"

        weather_params = {
            "latitude": latitude,
            "longitude": longitude,

            "current": (
                "temperature_2m,"
                "relative_humidity_2m,"
                "apparent_temperature,"
                "is_day,"
                "precipitation,"
                "weather_code,"
                "cloud_cover,"
                "pressure_msl,"
                "wind_speed_10m,"
                "wind_direction_10m"
            ),

            "hourly": (
                "temperature_2m,"
                "relative_humidity_2m,"
                "precipitation_probability,"
                "weather_code,"
                "wind_speed_10m"
            ),

            "daily": (
                "weather_code,"
                "temperature_2m_max,"
                "temperature_2m_min,"
                "sunrise,"
                "sunset,"
                "uv_index_max"
            ),

            "timezone": "auto",
            "forecast_days": 5
        }

        weather_response = requests.get(
            weather_url,
            params=weather_params,
            timeout=10
        )

        weather_data = weather_response.json()

        # -----------------------------
        # 3. Send Clean JSON to Frontend
        # -----------------------------
        result = {
            "location": {
                "city": location.get("name"),
                "country": location.get("country"),
                "country_code": location.get("country_code"),
                "latitude": latitude,
                "longitude": longitude,
                "timezone": weather_data.get("timezone")
            },

            "current": weather_data.get("current", {}),
            "hourly": weather_data.get("hourly", {}),
            "daily": weather_data.get("daily", {})
        }

        return jsonify(result)

    except requests.exceptions.Timeout:
        return jsonify({
            "error": "Weather service timed out. Please try again."
        }), 504

    except requests.exceptions.RequestException:
        return jsonify({
            "error": "Unable to connect to weather service."
        }), 503

    except Exception as e:
        return jsonify({
            "error": "Something went wrong.",
            "details": str(e)
        }), 500


# Health Check
@app.route("/api/health")
def health():
    return jsonify({
        "status": "online",
        "message": "Weather Dashboard Backend is running"
    })


# Run Server
if __name__ == "__main__":
    app.run(
        debug=True,
        host="127.0.0.1",
        port=5000
    )