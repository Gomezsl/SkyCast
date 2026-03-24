const apiKey = "9f6eca41589b93e3b2d38e38da189a18";
const searchBtn = document.getElementById('search-btn');
const cityInput = document.getElementById('city-input');

// Esta función ahora acepta ciudad O coordenadas
async function checkWeather(city, lat = null, lon = null) {
    let url;
    
    // Si tenemos coordenadas, usamos la URL de coordenadas, si no, la de ciudad
    if (lat && lon) {
        url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=es&appid=${apiKey}`;
    } else {
        url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=es&appid=${apiKey}`;
    }
    
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            console.log("Error de la API:", data.message);
            const errorMsg = document.getElementById('error-message');
            errorMsg.innerText = data.cod === "401" ? "La API aún no está activa. Espera unos minutos." : "Ciudad no encontrada.";
            errorMsg.style.display = "block";
            document.getElementById('weather-card').style.opacity = "0";
            return;
        }

        updateUI(data);

    } catch (error) {
        console.error("Error al obtener datos:", error);
    }
}

function updateUI(data) {
    document.getElementById('error-message').style.display = "none";
    document.getElementById('weather-card').style.opacity = "1";
    
    document.getElementById('temperature').innerHTML = `${Math.round(data.main.temp)}°C`;
    document.getElementById('description').innerHTML = data.weather[0].description;
    document.getElementById('humidity').innerHTML = `${data.main.humidity}%`;
    document.getElementById('wind-speed').innerHTML = `${data.wind.speed} km/h`;

    const weatherMain = data.weather[0].main.toLowerCase();
    const body = document.body;
    const icon = document.getElementById('weather-icon');

    // Mapeo dinámico de climas
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

// NUEVA FUNCIÓN: Detectar ubicación por GPS
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                checkWeather(null, lat, lon); // Llama a la API con coordenadas
            },
            (error) => {
                console.warn("El usuario denegó el permiso de ubicación o hubo un error.");
                // Opcional: Cargar una ciudad por defecto si el usuario dice que no
                checkWeather("Mexico City"); 
            }
        );
    } else {
        console.error("La geolocalización no es soportada por este navegador.");
    }
}

// Eventos
searchBtn.addEventListener('click', () => checkWeather(cityInput.value));
cityInput.addEventListener('keypress', (e) => {
    if(e.key === 'Enter') checkWeather(cityInput.value);
});

// Al cargar la página, intentar obtener ubicación automáticamente
window.onload = getLocation;