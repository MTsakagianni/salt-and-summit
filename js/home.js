function initialiseActivity() {
    const activityList = document.querySelector("#activity-list");
    const activityEmpty = document.querySelector("#activity-empty");
    const savedActivity = localStorage.getItem("activity");
    const activities = savedActivity ? JSON.parse(savedActivity) : [];

    activityEmpty.hidden = activities.length > 0;

    // recordActivity in main.js stores the newest action first.
    // Display up to five entries to keep the overview short.
    for (const activity of activities.slice(0, 5)) {
        const item = document.createElement("li");

        // Activity messages contain task names entered by the user,
        // so display them as text rather than interpreting them as HTML.
        item.textContent = activity.message;
        activityList.appendChild(item);
    }
}

async function initialiseWeather() {
    const weatherStatus = document.querySelector("#weather-status");
    const weatherDetails = document.querySelector("#weather-details");
    const temperature = document.querySelector("#weather-temperature");
    const wind = document.querySelector("#weather-wind");
    const weatherIcon = document.querySelector("#weather-icon");
    const weatherDescription = document.querySelector("#weather-description");

    // Request current conditions near the company's base in Glyki.
    // Explicit units keep the displayed values consistent.
    const url = "https://api.open-meteo.com/v1/forecast"
        + "?latitude=39.33&longitude=20.61"
        + "&current=temperature_2m,wind_speed_10m,weather_code,is_day"
        + "&temperature_unit=celsius&wind_speed_unit=kmh";

    try {
        const response = await fetch(url);

        // fetch does not reject HTTP error responses automatically.
        // Route those responses to the same fallback as network failures.
        if (!response.ok) {
            throw new Error("Weather request failed");
        }

        const data = await response.json();
        const code = data.current.weather_code;
        const isDay = data.current.is_day === 1;

        // Keep a fallback for weather codes not covered by the conditions below.
        let icon = "🌡️";
        let description = "Current conditions";

        // Translate the API's weather codes into readable descriptions.
        // Use day/night icons where the distinction is relevant.
        if (code === 0 || code === 1) {
            icon = isDay ? "☀️" : "🌙";
            description = code === 0 ? "Clear sky" : "Mainly clear";
        } else if (code === 2) {
            icon = isDay ? "🌤️" : "☁️";
            description = "Partly cloudy";
        } else if (code === 3) {
            icon = "☁️";
            description = "Overcast";
        } else if (code === 45 || code === 48) {
            icon = "🌫️";
            description = "Foggy";
        } else if (code >= 51 && code <= 57) {
            icon = "🌦️";
            description = "Drizzle";
        } else if (code >= 61 && code <= 67) {
            icon = "🌧️";
            description = "Rain";
        } else if (code >= 71 && code <= 77) {
            icon = "❄️";
            description = "Snow";
        } else if (code >= 80 && code <= 82) {
            icon = "🌧️";
            description = "Rain showers";
        } else if (code === 85 || code === 86) {
            icon = "🌨️";
            description = "Snow showers";
        } else if (code >= 95 && code <= 99) {
            icon = "⛈️";
            description = "Thunderstorm";
        }

        temperature.textContent = data.current.temperature_2m + " °C";
        wind.textContent = data.current.wind_speed_10m + " km/h";
        weatherIcon.textContent = icon;
        weatherDescription.textContent = description;

        // Reveal the details only after the values have been populated.
        weatherStatus.textContent = "";
        weatherDetails.hidden = false;
    } catch (error) {
        // Keep the rest of Home usable when the external service is unavailable.
        weatherStatus.textContent =
            "Weather is unavailable right now. Please try again later.";
    }
}

initialiseActivity();
initialiseWeather();