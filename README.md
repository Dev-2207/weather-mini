# WeatherSphere

A simple weather dashboard built with Flask and vanilla JavaScript. It uses the Open-Meteo APIs for city search and weather data.

## Features

- Search weather by city name
- Use browser location to find local weather
- Current weather details
- Hourly forecast
- Five-day forecast
- Light and dark themes
- Responsive layout

## Project Structure

```text
.
├── api/index.py       # Vercel serverless entry point
├── app.py             # Flask application and API routes
├── index.html         # Dashboard markup
├── script.js          # Frontend behavior
├── style.css          # Dashboard styles
├── requirements.txt   # Python dependencies
└── vercel.json        # Vercel routing configuration
```

## Run Locally

1. Create and activate a virtual environment:

   ```bash
   python -m venv .venv
   .venv\Scripts\activate
   ```

2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Start the Flask server:

   ```bash
   python app.py
   ```

4. Open http://127.0.0.1:5000 in your browser.

## Deploy to Vercel

1. Install the Vercel CLI if needed:

   ```bash
   npm install -g vercel
   ```

2. From the project directory, run:

   ```bash
   vercel
   ```

3. Follow the prompts and use the generated Vercel URL to open the dashboard.

Vercel detects `api/index.py` as the Python serverless function and installs the packages listed in `requirements.txt`.

## API Endpoints

- `GET /api/health` - Returns the backend health status.
- `GET /api/weather?city=London` - Returns weather data for a city.

## Data Provider

Weather data is provided by [Open-Meteo](https://open-meteo.com/). No API key is required.
