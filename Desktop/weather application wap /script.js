const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const suggestionsList = document.getElementById('suggestions');
const cityName = document.getElementById('cityName');
const weatherDetails = document.getElementById('weatherDetails');
const temp = document.getElementById('temp');
const condition = document.getElementById('condition');
const humidity = document.getElementById('humidity');

let history = [];

let timer;


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


async function showWeather(lat, lon, name) {
    console.log("SHOW WEATHER RUNNING");

    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code`);
    const data = await res.json();

    cityName.innerHTML = name;
    temp.innerHTML = `Temperature: ${Math.round(data.current.temperature_2m)}°C`;
    humidity.innerHTML = `Humidity: ${data.current.relative_humidity_2m}%`;

    const code = data.current.weather_code;
    let desc = "Clear";
    if (code > 0 && code < 4) desc = "Cloudy";
    if (code >= 51 && code <= 67) desc = "Rainy";
    if (code >= 71 && code <= 77) desc = "Snowy";
    if (code >= 80 && code <= 82) desc = "Showers";
    if (code == 95) desc = "Thunderstorm";

    condition.innerHTML = `Condition: ${desc}`;
    weatherDetails.style.display = "block";

    console.log("TEMP:", data.current.temperature_2m);

    history.push({
        city: name,
        temp: data.current.temperature_2m
    });

    console.log("HISTORY:", history);
}


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

document.onclick = (e) => {
    if (e.target !== cityInput) suggestionsList.style.display = 'none';
};
function hotCities() {
    const hot = history.filter(item => item.temp > 30);

    let html = "<h3>Hot Cities</h3>";

    if (hot.length === 0) {
        html += "<p>No hot cities found</p>";
    } else {
        hot.forEach(item => {
            html += `<p>${item.city} : ${item.temp}°C</p>`;
        });
    }

 
    document.getElementById("result").innerHTML = html;
}

function sortByTemp() {
    const sorted = [...history].sort((a, b) => a.temp - b.temp);

    let html = "<h3>Sorted Cities</h3>";

    sorted.forEach(item => {
        html += `<p>${item.city} : ${item.temp}°C</p>`;
    });

    document.getElementById("result").innerHTML = html;
}
document.getElementById("result").innerHTML = "TEST BOX";


const toggleBtn = document.getElementById("themeToggle");

toggleBtn.onclick = () => {
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
        toggleBtn.innerText = "☀️ Light Mode";
    } else {
        toggleBtn.innerText = "🌙 Dark Mode";
    }
};
