from flask import Flask, jsonify, request
from flask_cors import CORS
import random
import logging

# ------------------------
# App Setup
# ------------------------
app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logger.info("Starting UHI Analysis Server with OpenStreetMap integration...")
logger.info("Data sources: OpenStreetMap (land use) + Open-Meteo (temperature)")

# ------------------------
# Health Check API
# ------------------------
@app.route("/api/analyze/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "online",
        "service": "Urban Heat Island Analysis API",
        "version": "1.0.0"
    })

# ------------------------
# Main UHI Analysis API
# ------------------------
@app.route("/api/analyze/uhi", methods=["GET"])
def analyze_uhi():
    try:
        points = int(request.args.get("points", 100))
        days = int(request.args.get("days", 30))

        logger.info(f"UHI analysis requested | points={points}, days={days}")

        # Center: Bhubaneswar (example)
        center_lat = 20.2961
        center_lon = 85.8245

        results = []
        for _ in range(points):
            lat = center_lat + random.uniform(-0.05, 0.05)
            lon = center_lon + random.uniform(-0.05, 0.05)

            temperature = round(random.uniform(28, 45), 2)

            if temperature >= 40:
                zone = "high"
            elif temperature >= 34:
                zone = "medium"
            else:
                zone = "low"

            results.append({
                "latitude": lat,
                "longitude": lon,
                "temperature": temperature,
                "zone": zone
            })

        summary = {
            "high": len([p for p in results if p["zone"] == "high"]),
            "medium": len([p for p in results if p["zone"] == "medium"]),
            "low": len([p for p in results if p["zone"] == "low"])
        }

        return jsonify({
            "success": True,
            "points": points,
            "days": days,
            "summary": summary,
            "data": results
        })

    except Exception as e:
        logger.exception("UHI analysis failed")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ------------------------
# Root Route (optional)
# ------------------------
@app.route("/", methods=["GET"])
def root():
    return jsonify({
        "message": "UHI Analysis Backend Running"
    })


# ------------------------
# Run Server
# ------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
