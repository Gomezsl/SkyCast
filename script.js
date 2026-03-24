const apiKey = "9f6eca41589b93e3b2d38e38da189a18";
const searchBtn = document.getElementById('search-btn');
const gpsBtn = document.getElementById('gps-btn');
const cityInput = document.getElementById('city-input');
const loader = document.getElementById('loader');
const weatherCard = document.getElementById('weather-card');

async function checkWeather(city, lat = null, lon = null) {
    // Mostrar cargando
    loader.style.display = "flex";
    weatherCard.style.opacity = "0.3";

    let urlWeather, urlForecast;
    
    if (lat && lon) {
        urlWeather = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=es&appid=${apiKey}`;
        urlForecast = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=es&appid=${apiKey}`;
    } else {
        urlWeather = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=es&appid=${apiKey}`;
        urlForecast = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&lang=es&appid=${apiKey}`;
    }
    
    try {
        const [resWeather, resForecast] = await Promise.all([
            fetch(urlWeather),
            fetch(urlForecast)
        ]);

        const dataWeather = await resWeather.json();
        const dataForecast = await resForecast.json();

        loader.style.display = "none"; // Ocultar carga

        if (!resWeather.ok) {
            showError(dataWeather.message);
            return;
        }

        updateUI(dataWeather);
        updateForecast(dataForecast);

    } catch (error) {
        loader.style.display = "none";
        console.error("Error al obtener datos:", error);
    }
}

function updateUI(data) {
    document.getElementById('error-message').style.display = "none";
    weatherCard.style.opacity = "1";
    
    document.getElementById('location-name').innerHTML = `${data.name}, ${data.sys.country}`;
    document.getElementById('temperature').innerHTML = `${Math.round(data.main.temp)}°C`;
    document.getElementById('feels-like').innerHTML = `Sensación: ${Math.round(data.main.feels_like)}°C`;
    document.getElementById('description').innerHTML = data.weather[0].description;
    document.getElementById('humidity').innerHTML = `${data.main.humidity}%`;
    document.getElementById('wind-speed').innerHTML = `${Math.round(data.wind.speed * 3.6)} km/h`;
    document.getElementById('pressure').innerHTML = `${data.main.pressure} hPa`;

    // Hora Local mejorada
    const date = new Date();
    const localTime = new Date(date.getTime() + (data.timezone * 1000) + (date.getTimezoneOffset() * 60000));
    document.getElementById('local-time').innerHTML = localTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', weekday: 'long' });

    updateTheme(data.weather[0].main.toLowerCase());
}

function updateForecast(data) {
    const container = document.getElementById('forecast-container');
    container.innerHTML = ""; 

    // Filtrar para obtener el pronóstico del mediodía de los siguientes días
    const dailyData = data.list.filter(reading => reading.dt_txt.includes("12:00:00")).slice(0, 4);

    dailyData.forEach(day => {
        const d = new Date(day.dt * 1000);
        const dayName = d.toLocaleDateString('es-ES', { weekday: 'short' });
        const iconCode = day.weather[0].icon;

        container.innerHTML += `
            <div class="forecast-item">
                <p>${dayName}</p>
                <img src="https://openweathermap.org/img/wn/${iconCode}.png" alt="icon">
                <span>${Math.round(day.main.temp)}°C</span>
            </div>
        `;
    });
}

function updateTheme(weatherMain) {
    const body = document.body;
    const icon = document.getElementById('weather-icon');

    const themes = {
        clouds: { gradient: "linear-gradient(135deg, #757f9a, #d7dde8)", icon: "https://cdn-icons-png.flaticon.com/512/414/414927.png" },
        clear: { gradient: "linear-gradient(135deg, #f7b733, #fc4a1a)", icon: "https://cdn-icons-png.flaticon.com/512/869/869869.png" },
        rain: { gradient: "linear-gradient(135deg, #203a43, #2c5364)", icon: "https://cdn-icons-png.flaticon.com/512/4088/4088981.png" },
        snow: { gradient: "linear-gradient(135deg, #83a4d4, #b6fbff)", icon: "https://cdn-icons-png.flaticon.com/512/2315/2315309.png" },
        thunderstorm: { gradient: "linear-gradient(135deg, #141e30, #243b55)", icon: "https://cdn-icons-png.flaticon.com/512/1146/1146860.png" }
    };

    const theme = themes[weatherMain] || themes.clouds;
    body.style.background = theme.gradient;
    icon.src = theme.icon;
}

function showError(msg) {
    const errorMsg = document.getElementById('error-message');
    errorMsg.innerText = "Error: " + msg;
    errorMsg.style.display = "block";
    weatherCard.style.opacity = "0";
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => checkWeather(null, pos.coords.latitude, pos.coords.longitude),
            () => checkWeather("Mexico City")
        );
    }
}

searchBtn.addEventListener('click', () => { if(cityInput.value) checkWeather(cityInput.value); });
gpsBtn.addEventListener('click', getLocation);
cityInput.addEventListener('keypress', (e) => { if(e.key === 'Enter' && cityInput.value) checkWeather(cityInput.value); });

window.onload = getLocation;
