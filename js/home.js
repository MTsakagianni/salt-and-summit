function getWeatherCondition(code, isDay = true) {
    // Share readable descriptions between current conditions and the daily forecast.
    let icon = "temperature";
    let description = "Current conditions";

    // Translate the API's weather codes into readable descriptions.
    // Use day/night icons where the distinction is relevant.
    if (code === 0 || code === 1) {
        icon = isDay ? "sun" : "moon";
        description = code === 0 ? "Clear sky" : "Mainly clear";
    } else if (code === 2) {
        icon = isDay ? "partly-cloudy" : "cloud";
        description = "Partly cloudy";
    } else if (code === 3) {
        icon = "cloud";
        description = "Overcast";
    } else if (code === 45 || code === 48) {
        icon = "fog";
        description = "Foggy";
    } else if (code >= 51 && code <= 57) {
        icon = "rain";
        description = "Drizzle";
    } else if (code >= 61 && code <= 67) {
        icon = "rain";
        description = "Rain";
    } else if (code >= 71 && code <= 77) {
        icon = "snow";
        description = "Snow";
    } else if (code >= 80 && code <= 82) {
        icon = "rain";
        description = "Rain showers";
    } else if (code === 85 || code === 86) {
        icon = "snow";
        description = "Snow showers";
    } else if (code >= 95 && code <= 99) {
        icon = "storm";
        description = "Thunderstorm";
    }

    return { icon, description };
}

function initialiseActivity() {
    const activityList = document.querySelector("#activity-list");
    const activityEmpty = document.querySelector("#activity-empty");
    const savedActivity = localStorage.getItem("activity");
    const activities = savedActivity ? JSON.parse(savedActivity) : [];

    // Clear old entries before refreshing after back navigation.
    activityList.replaceChildren();
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

    const retryButton = document.querySelector("#weather-retry");
    retryButton.hidden = true;
    weatherDetails.hidden = true;
    weatherStatus.textContent = "Loading weather…";

    // Request current conditions near the company's base in Glyki.
    // Explicit units keep the displayed values consistent.
    const url = "https://api.open-meteo.com/v1/forecast"
        + "?latitude=39.33&longitude=20.61"
        + "&current=temperature_2m,wind_speed_10m,weather_code,is_day"
        + "&temperature_unit=celsius&wind_speed_unit=kmh";

    try {
        const response = await fetch(url, { signal: AbortSignal.timeout(10000) });

        // fetch does not reject HTTP error responses automatically.
        // Route those responses to the same fallback as network failures.
        if (!response.ok) {
            throw new Error("Weather request failed");
        }

        const data = await response.json();
        if (!data.current || !Number.isFinite(data.current.temperature_2m) ||
            !Number.isFinite(data.current.wind_speed_10m)) {
            throw new Error("Incomplete weather response");
        }

        const code = data.current.weather_code;
        const isDay = data.current.is_day === 1;

        const { icon, description } = getWeatherCondition(code, isDay);

        temperature.textContent = data.current.temperature_2m + " °C";
        wind.textContent = data.current.wind_speed_10m + " km/h";
        // Icon names come from the fixed weather-code mapping above.
        const iconImage = document.createElement("img");
        iconImage.src = "images/weather-" + icon + ".svg";
        iconImage.alt = "";
        iconImage.width = 64;
        iconImage.height = 64;
        iconImage.className = "home-weather-icon";
        weatherIcon.replaceChildren(iconImage);
        weatherDescription.textContent = description;

        // Reveal the details only after the values have been populated.
        weatherStatus.textContent = "";
        weatherDetails.hidden = false;
    } catch (error) {
        // Keep the rest of Home usable when the external service is unavailable.
        weatherStatus.textContent =
            "Weather is unavailable right now. Please try again later.";
        retryButton.hidden = false;
    }
}

initialiseActivity();
initialiseWeather();

// Keep the overview current when returning from Tasks or another browser tab.
window.addEventListener("pageshow", function (event) {
    if (event.persisted) {
        initialiseActivity();
    }
});
window.addEventListener("storage", function (event) {
    if (event.key === "activity" || event.key === null) {
        initialiseActivity();
    }
});
document.querySelector("#weather-retry").addEventListener("click", initialiseWeather);


function initialiseForecast() {
    const toggle = document.querySelector("#forecast-toggle");
    const panel = document.querySelector("#weekly-forecast");
    const status = document.querySelector("#forecast-status");
    const days = document.querySelector("#forecast-days");
    const retry = document.querySelector("#forecast-retry");
    let loaded = false;
    let loading = false;

    function formatValue(value, unit) {
        return Number.isFinite(value) ? Math.round(value) + unit : "Unavailable";
    }

    function renderDays(daily) {
        days.replaceChildren();
        const dateFormat = new Intl.DateTimeFormat("en-GB", {
            weekday: "short", day: "numeric", month: "short", timeZone: "Europe/Athens"
        });

        for (let index = 0; index < 7; index++) {
            const item = document.createElement("li");
            const date = document.createElement("time");
            date.dateTime = daily.time[index];
            // Noon UTC avoids a date shift when the visitor is in another timezone.
            date.textContent = (index === 0 ? "Today · " : "")
                + dateFormat.format(new Date(daily.time[index] + "T12:00:00Z"));
            const condition = getWeatherCondition(daily.weather_code[index]);
            const icon = document.createElement("img");
            icon.src = "images/weather-" + condition.icon + ".svg";
            icon.alt = "";
            icon.width = 32;
            icon.height = 32;
            const summary = document.createElement("span");
            summary.className = "forecast-condition";
            summary.textContent = condition.description;
            const temperatures = document.createElement("span");
            temperatures.className = "forecast-temperatures";
            temperatures.textContent = "Low " + formatValue(daily.temperature_2m_min[index], "°")
                + " / High " + formatValue(daily.temperature_2m_max[index], "°");
            const rain = document.createElement("span");
            rain.className = "forecast-rain";
            rain.textContent = "Rain chance: "
                + formatValue(daily.precipitation_probability_max[index], "%");
            item.append(date, icon, summary, temperatures, rain);
            days.appendChild(item);
        }
    }

    async function loadForecast() {
        if (loading || loaded) {
            return;
        }
        loading = true;
        retry.hidden = true;
        status.textContent = "Loading the 7-day forecast…";
        panel.setAttribute("aria-busy", "true");
        const url = "https://api.open-meteo.com/v1/forecast"
            + "?latitude=39.33&longitude=20.61"
            + "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max"
            + "&timezone=Europe%2FAthens&forecast_days=7&temperature_unit=celsius";

        try {
            const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
            if (!response.ok) {
                throw new Error("Forecast request failed");
            }
            const data = await response.json();
            const fields = ["time", "weather_code", "temperature_2m_max",
                "temperature_2m_min", "precipitation_probability_max"];
            if (!data.daily || !fields.every(function (field) {
                return Array.isArray(data.daily[field]) && data.daily[field].length >= 7;
            }) || !data.daily.time.slice(0, 7).every(function (date) {
                return typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)
                    && Number.isFinite(Date.parse(date + "T12:00:00Z"));
            })) {
                throw new Error("Incomplete forecast response");
            }
            renderDays(data.daily);
            loaded = true;
            status.textContent = "";
        } catch (error) {
            days.replaceChildren();
            status.textContent = "The forecast is unavailable right now. Please try again.";
            retry.hidden = false;
        } finally {
            loading = false;
            panel.setAttribute("aria-busy", "false");
        }
    }

    toggle.addEventListener("click", function () {
        const opening = panel.hidden;
        panel.hidden = !opening;
        toggle.setAttribute("aria-expanded", String(opening));
        toggle.textContent = opening ? "Hide 7-day forecast" : "View 7-day forecast";
        if (opening) {
            loadForecast();
        }
    });
    retry.addEventListener("click", loadForecast);
}

initialiseForecast();
