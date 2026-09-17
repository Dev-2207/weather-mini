

const API =
"https://api.open-meteo.com/v1/forecast";

const GEO_API =
"https://geocoding-api.open-meteo.com/v1/search";

const input = document.getElementById("cityInput");


// WEATHER CODES

const weatherCodes = {

    0: ["Clear Sky", "☀️"],
    1: ["Mainly Clear", "🌤️"],
    2: ["Partly Cloudy", "⛅"],
    3: ["Overcast", "☁️"],

    45: ["Fog", "🌫️"],
    48: ["Fog", "🌫️"],

    51: ["Light Drizzle", "🌦️"],
    53: ["Drizzle", "🌦️"],
    55: ["Heavy Drizzle", "🌧️"],

    61: ["Light Rain", "🌦️"],
    63: ["Rain", "🌧️"],
    65: ["Heavy Rain", "🌧️"],

    71: ["Light Snow", "🌨️"],
    73: ["Snow", "❄️"],
    75: ["Heavy Snow", "❄️"],

    80: ["Rain Shower", "🌦️"],
    81: ["Rain Shower", "🌧️"],
    82: ["Heavy Shower", "⛈️"],

    95: ["Thunderstorm", "⛈️"],
    96: ["Thunderstorm", "⛈️"],
    99: ["Thunderstorm", "⛈️"]
};


function getWeatherInfo(code) {

    return weatherCodes[code] ||
        ["Unknown", "🌡️"];
}


// SEARCH WEATHER

async function searchWeather() {

    const city = input.value.trim();

    if (city === "") {
        showError("Please enter a city name.");
        return;
    }

    try {

        clearError();

        const geoResponse =
            await fetch(
                `${GEO_API}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
            );

        const geoData =
            await geoResponse.json();

        if (!geoData.results) {

            showError(
                "City not found. Please try another city."
            );

            return;
        }

        const location =
            geoData.results[0];

        const weather =
            await getWeather(
                location.latitude,
                location.longitude,
                location.timezone
            );

        displayWeather(
            location,
            weather
        );

    }

    catch(error) {

        showError(
            "Unable to fetch weather data."
        );

        console.log(error);
    }
}


// WEATHER API

async function getWeather(
    latitude,
    longitude,
    timezone
) {

    const url =
        `${API}?latitude=${latitude}` +
        `&longitude=${longitude}` +
        `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m` +
        `&hourly=temperature_2m,weather_code,precipitation_probability` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max` +
        `&forecast_days=6` +
        `&timezone=${encodeURIComponent(timezone || "auto")}` +
        `&wind_speed_unit=kmh`;

    const response =
        await fetch(url);

    if (!response.ok) {

        throw new Error(
            "Weather API error"
        );
    }

    return await response.json();
}


// DISPLAY WEATHER

function displayWeather(
    location,
    data
) {

    const current =
        data.current;

    const daily =
        data.daily;

    const hourly =
        data.hourly;

    const info =
        getWeatherInfo(
            current.weather_code
        );


    // MAIN

    document.getElementById(
        "city"
    ).textContent =
        `${location.name}, ${location.country_code}`;

    document.getElementById(
        "condition"
    ).textContent =
        info[0];

    document.getElementById(
        "weatherIcon"
    ).textContent =
        info[1];

    document.getElementById(
        "temperature"
    ).textContent =
        Math.round(
            current.temperature_2m
        );

    document.getElementById(
        "feelsLike"
    ).textContent =
        Math.round(
            current.apparent_temperature
        );

    document.getElementById(
        "humidity"
    ).textContent =
        current.relative_humidity_2m + "%";

    document.getElementById(
        "wind"
    ).textContent =
        Math.round(
            current.wind_speed_10m
        ) + " km/h";

    document.getElementById(
        "pressure"
    ).textContent =
        Math.round(
            current.pressure_msl
        ) + " hPa";


    // DATE

    const today =
        new Date();

    document.getElementById(
        "date"
    ).textContent =
        today.toLocaleDateString(
            "en-IN",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );


    // SUN

    document.getElementById(
        "sunrise"
    ).textContent =
        formatTime(
            daily.sunrise[0]
        );

    document.getElementById(
        "sunset"
    ).textContent =
        formatTime(
            daily.sunset[0]
        );

    document.getElementById(
        "cloud"
    ).textContent =
        current.cloud_cover + "%";

    document.getElementById(
        "uv"
    ).textContent =
        daily.uv_index_max[0];


    // DETAILS

    document.getElementById(
        "dTemp"
    ).textContent =
        Math.round(
            current.temperature_2m
        ) + " °C";

    document.getElementById(
        "dFeels"
    ).textContent =
        Math.round(
            current.apparent_temperature
        ) + " °C";

    document.getElementById(
        "dHumidity"
    ).textContent =
        current.relative_humidity_2m + "%";

    document.getElementById(
        "dDirection"
    ).textContent =
        getDirection(
            current.wind_direction_10m
        );

    document.getElementById(
        "dRain"
    ).textContent =
        current.precipitation + " mm";

    document.getElementById(
        "dCloud"
    ).textContent =
        current.cloud_cover + "%";


    // AQI

    calculateAQI(current);

    // HOURLY

    displayHourly(hourly);

    // 5 DAY

    displayForecast(daily);
}


// AQI ESTIMATE

function calculateAQI(current) {

    let score =
        Math.round(
            30 +
            current.relative_humidity_2m * 0.35 +
            current.cloud_cover * 0.15 +
            current.precipitation * 2
        );

    score =
        Math.max(
            20,
            Math.min(160, score)
        );

    document.getElementById(
        "aqi"
    ).textContent =
        score;


    let status;
    let text;

    if (score <= 50) {

        status = "Good";
        text =
            "Air quality is generally good.";

    }

    else if (score <= 100) {

        status = "Moderate";
        text =
            "Air quality is acceptable for most people.";

    }

    else if (score <= 150) {

        status =
            "Unhealthy for Sensitive Groups";

        text =
            "Sensitive people should reduce prolonged outdoor activity.";

    }

    else {

        status = "Unhealthy";

        text =
            "Consider limiting prolonged outdoor activity.";
    }


    document.getElementById(
        "aqiStatus"
    ).textContent =
        status;

    document.getElementById(
        "aqiText"
    ).textContent =
        text;

    document.getElementById(
        "aqiBar"
    ).style.width =
        Math.min(
            score / 1.5,
            100
        ) + "%";
}


// HOURLY WEATHER

function displayHourly(hourly) {

    const box =
        document.getElementById(
            "hourly"
        );

    box.innerHTML = "";

    const now =
        new Date();

    let currentHour =
        now.getHours();

    let start =
        hourly.time.findIndex(
            time =>
                parseInt(
                    time.split("T")[1]
                ) >= currentHour
        );

    if (start < 0)
        start = 0;


    for (
        let i = start;
        i < start + 8 &&
        i < hourly.time.length;
        i++
    ) {

        const time =
            hourly.time[i];

        const info =
            getWeatherInfo(
                hourly.weather_code[i]
            );

        const hour =
            time.split("T")[1]
                .substring(0,5);


        box.innerHTML += `

            <div class="hour ${i === start ? "active" : ""}">

                <span>
                    ${i === start ? "NOW" : hour}
                </span>

                <div class="hour-icon">
                    ${info[1]}
                </div>

                <b>
                    ${Math.round(
                        hourly.temperature_2m[i]
                    )}°C
                </b>

                <small>
                    ${hourly.precipitation_probability[i] || 0}% rain
                </small>

            </div>

        `;
    }
}


// FORECAST

function displayForecast(daily) {

    const box =
        document.getElementById(
            "forecast"
        );

    box.innerHTML = "";


    for (
        let i = 0;
        i < 5;
        i++
    ) {

        const info =
            getWeatherInfo(
                daily.weather_code[i]
            );

        const date =
            new Date(
                daily.time[i]
            );


        const day =
            i === 0
                ? "Today"
                : date.toLocaleDateString(
                    "en-IN",
                    {
                        weekday: "short"
                    }
                );


        box.innerHTML += `

            <div class="forecast-day">

                <b>${day}</b>

                <div class="icon">
                    ${info[1]}
                </div>

                <strong>
                    ${Math.round(
                        daily.temperature_2m_max[i]
                    )}°C
                </strong>

                <small>
                    Low:
                    ${Math.round(
                        daily.temperature_2m_min[i]
                    )}°C
                </small>

                <small>
                    ${info[0]}
                </small>

            </div>

        `;
    }
}


// LOCATION

function getLocation() {

    if (!navigator.geolocation) {

        showError(
            "Geolocation is not supported."
        );

        return;
    }


    navigator.geolocation.getCurrentPosition(

        async function(position) {

            try {

                const latitude =
                    position.coords.latitude;

                const longitude =
                    position.coords.longitude;


                const weather =
                    await getWeather(
                        latitude,
                        longitude,
                        "auto"
                    );


                document.getElementById(
                    "city"
                ).textContent =
                    "My Location";


                displayWeather(
                    {
                        name: "My Location",
                        country_code: ""
                    },
                    weather
                );

            }

            catch(error) {

                showError(
                    "Unable to load your location weather."
                );
            }

        },

        function() {

            showError(
                "Location permission denied."
            );
        }
    );
}


// DARK MODE

function toggleTheme() {

    document.body.classList.toggle(
        "dark"
    );

    const dark =
        document.body.classList.contains(
            "dark"
        );

    document.getElementById(
        "themeBtn"
    ).textContent =
        dark
            ? "☀️ Light Mode"
            : "🌙 Dark Mode";

    localStorage.setItem(
        "theme",
        dark
            ? "dark"
            : "light"
    );
}


// TIME FORMAT

function formatTime(time) {

    if (!time)
        return "--";

    return time
        .split("T")[1]
        .substring(0,5);
}


// WIND DIRECTION

function getDirection(degree) {

    const directions = [
        "N",
        "NE",
        "E",
        "SE",
        "S",
        "SW",
        "W",
        "NW"
    ];

    return directions[
        Math.round(degree / 45) % 8
    ];
}


// ERROR

function showError(message) {

    document.getElementById(
        "error"
    ).textContent =
        "⚠️ " + message;
}

function clearError() {

    document.getElementById(
        "error"
    ).textContent = "";
}


// LOAD SAVED THEME

if (
    localStorage.getItem("theme")
    === "dark"
) {

    document.body.classList.add(
        "dark"
    );

    document.getElementById(
        "themeBtn"
    ).textContent =
        "☀️ Light Mode";
}


// ENTER KEY

input.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Enter"
        ) {

            searchWeather();
        }
    }
);


// DEFAULT CITY

searchWeatherDefault();

async function searchWeatherDefault() {

    input.value = "New Delhi";

    await searchWeather();

}