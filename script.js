const apiKey = "9f6eca41589b93e3b2d38e38da189a18";
const searchBtn = document.getElementById('search-btn');
const gpsBtn = document.getElementById('gps-btn');
const cityInput = document.getElementById('city-input');

async function checkWeather(city, lat = null, lon = null) {
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

        if (!resWeather.ok) {
            showError(dataWeather.message);
            return;
        }

        updateUI(dataWeather);
        updateForecast(dataForecast);

    } catch (error) {
        console.error("Error al obtener datos:", error);
    }
}

function updateUI(data) {
    document.getElementById('error-message').style.display = "none";
    document.getElementById('weather-card').style.opacity = "1";
    
    document.getElementById('location-name').innerHTML = `${data.name}, ${data.sys.country}`;
    document.getElementById('temperature').innerHTML = `${Math.round(data.main.temp)}°C`;
    document.getElementById('description').innerHTML = data.weather[0].description;
    document.getElementById('humidity').innerHTML = `${data.main.humidity}%`;
    document.getElementById('wind-speed').innerHTML = `${data.wind.speed} km/h`;

    // Función de hora local simple basada en el timezone de la API
    const localTime = new Date(new Date().getTime() + (data.timezone * 1000) + (new Date().getTimezoneOffset() * 60000));
    document.getElementById('local-time').innerHTML = localTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

    updateTheme(data.weather[0].main.toLowerCase());
}

function updateForecast(data) {
    const container = document.getElementById('forecast-container');
    container.innerHTML = ""; // Limpiar anterior

    // La API de forecast da datos cada 3 horas. Filtramos para obtener uno por día (cada 8 items)
    const dailyData = data.list.filter((reading, index) => index % 8 === 0).slice(0, 4);

    dailyData.forEach(day => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('es-ES', { weekday: 'short' });
        const temp = Math.round(day.main.temp);
        const iconCode = day.weather[0].icon;

        container.innerHTML += `
            <div class="forecast-item">
                <p>${dayName}</p>
                <img src="https://openweathermap.org/img/wn/${iconCode}.png" alt="icon">
                <span>${temp}°C</span>
            </div>
        `;
    });
}

function updateTheme(weatherMain) {
    const body = document.body;
    const icon = document.getElementById('weather-icon');

    if(weatherMain.includes("cloud")) {
        body.style.background = "linear-gradient(135deg, #bdc3c7, #2c3e50)";
        icon.src = "https://cdn-icons-png.flaticon.com/512/414/414927.png"; 
    } else if(weatherMain.includes("clear")) {
        body.style.background = "linear-gradient(135deg, #f7b733, #fc4a1a)";
        icon.src = "https://cdn-icons-png.flaticon.com/512/869/869869.png"; 
    } else if(weatherMain.includes("rain") || weatherMain.includes("drizzle")) {
        body.style.background = "linear-gradient(135deg, #4b6cb7, #182848)";
        icon.src = "https://cdn-icons-png.flaticon.com/512/4088/4088981.png"; 
    } else {
        body.style.background = "linear-gradient(135deg, #1e3c72, #2a5298)";
        icon.src = "https://cdn-icons-png.flaticon.com/512/704/704845.png";
    }
}

function showError(msg) {
    const errorMsg = document.getElementById('error-message');
    errorMsg.innerText = "Error: " + msg;
    errorMsg.style.display = "block";
    document.getElementById('weather-card').style.opacity = "0";
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => checkWeather(null, position.coords.latitude, position.coords.longitude),
            () => checkWeather("Mexico City")
        );
    }
}

searchBtn.addEventListener('click', () => checkWeather(cityInput.value));
gpsBtn.addEventListener('click', getLocation);
cityInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') checkWeather(cityInput.value); });

window.onload = getLocation;
