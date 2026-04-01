const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const suggestionsList = document.getElementById('suggestions');
const cityName = document.getElementById('cityName');
const weatherDetails = document.getElementById('weatherDetails');
const temp = document.getElementById('temp');
const condition = document.getElementById('condition');
const humidity = document.getElementById('humidity');

let timer;

// 1. Show suggestions as you type
cityInput.oninput = () => {
    clearTimeout(timer);
    timer = setTimeout(async () => {
        const query = cityInput.value;
        if (query.length < 2) {
            suggestionsList.style.display = 'none';
            return;
        }

        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=5`);
        const data = await res.json();

        if (data.results) {
            suggestionsList.innerHTML = "";
            data.results.forEach(city => {
                const div = document.createElement('div');
                div.className = 'suggestion-item';
                div.innerText = `${city.name}, ${city.country}`;
                div.onclick = () => {
                    cityInput.value = city.name;
                    suggestionsList.style.display = 'none';
                    showWeather(city.latitude, city.longitude, city.name);
                };
                suggestionsList.appendChild(div);
            });
            suggestionsList.style.display = 'block';
        }
    }, 300);
};

// 2. Fetch and show weather
async function showWeather(lat, lon, name) {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code`);
    const data = await res.json();

    cityName.innerHTML = name;
    temp.innerHTML = `Temperature: ${Math.round(data.current.temperature_2m)}°C`;
    humidity.innerHTML = `Humidity: ${data.current.relative_humidity_2m}%`;

    // Simple condition matching
    const code = data.current.weather_code;
    let desc = "Clear";
    if (code > 0 && code < 4) desc = "Cloudy";
    if (code >= 51 && code <= 67) desc = "Rainy";
    if (code >= 71 && code <= 77) desc = "Snowy";
    if (code >= 80 && code <= 82) desc = "Showers";
    if (code == 95) desc = "Thunderstorm";

    condition.innerHTML = `Condition: ${desc}`;
    weatherDetails.style.display = "block";
}

// 3. Search button click
searchBtn.onclick = async () => {
    const query = cityInput.value;
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=1`);
    const data = await res.json();
    if (data.results) {
        const city = data.results[0];
        showWeather(city.latitude, city.longitude, city.name);
    } else {
        alert("City not found");
    }
};

// 4. Hide suggestions when clicking away
document.onclick = (e) => {
    if (e.target !== cityInput) suggestionsList.style.display = 'none';
};
