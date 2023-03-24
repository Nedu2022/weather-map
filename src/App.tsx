import { useEffect, useRef, useState } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";
import "./App.css";


function App() {
  const cities = [
    "Singapore",
    "Lagos",
    "New-York",
    "Barcelona",
    "Mexico City",
    "Paris",
    "Copenhagen",
    "Cape Town",
    "Mumbai",
    "Melbourne",
    "Porto",
    "Abuja",
    "Edinburgh",
    "Chicago",
    "Taipei",
    "Lyon",
    "Marrakesh",
    "Berlin",
    "Munich",
    "Glasgow",
  ];
  const base = "https://api.mapbox.com/geocoding/v5/mapbox.places";
  const weathertoken = "a1ced4043f78b416c057b9d32d9a0645";
  mapboxgl.accessToken =
    "pk.eyJ1IjoibmVkdTAwIiwiYSI6ImNsZmdsZnczZjNvMHE0MG80M3R3YzRybTYifQ.3GjkTxIqwG1R-EFwRGHCFw";
  const mapContainerRef = useRef(null);
  const mapRef = useRef<mapboxgl.Map>();
  const [searched, setSearched] = useState(cities);
  let map: mapboxgl.Map;

  useEffect(() => {
    if (mapRef.current) return;
    map = mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current!,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-74.5, 40],
      zoom: 9,
    });
  }, []);

  return (
    <div className="appdiv">
      <aside>
        <div>
          <input
						type="search"
						placeholder="Search"
            onChange={(e) => {
              const search = e.currentTarget.value;
              const searchRegex = new RegExp(search, "i");
              const citiess = cities
                .map((city) => city.match(searchRegex))
                .filter((city) => city !== null)
                .map((city) => city!.input!);
              setSearched(citiess)
            }}
          />
        </div>
        <ul>
          {searched.map((city, i) => (
            <li key={i}>
              <button
                onClick={async (e) => {
                  const place = e.currentTarget.innerText;
                  const url = `${base}/${encodeURIComponent(
                    place
                  )}.json?access_token=${mapboxgl.accessToken}`;
                  const d = await (await fetch(url)).json();
                  const center = d.features[0].center;
                  map.flyTo({ center });
                  map.on("moveend", async () => {
                    const weatherurl = `https://api.openweathermap.org/data/2.5/forecast?lat=${center[1]}&lon=${center[0]}&cnt=16&appid=${weathertoken}&units=metric`;
                    const weatherJSON = await (await fetch(weatherurl)).json();
                    const weatherlist = [
                      weatherJSON.list[0],
                      weatherJSON.list[8],
                    ];
                    let outsideDiv = `<div>`;
                    weatherlist.forEach(
                      (mainweather: {
                        weather: { main: any }[];
                        main: { temp: any; humidity: any; pressure: any };
                        wind: { speed: any };
                        dt_txt: any;
                      }) => {
                        const weatherDiv = `<div>
                          <p>${mainweather.dt_txt}</p>
                          <h1>${mainweather.weather[0].main}</h1>
                          <h2>Temperature ${mainweather.main.temp}C</h2>
                          <div>
                            <span>Wind Speed ${mainweather.wind.speed}</span>
                            <span>Humidity ${mainweather.main.humidity}</span>
                            <span>Pressure ${mainweather.main.pressure}</span>
                          </div>
                        </div>`;
                        outsideDiv += weatherDiv;
                      }
                    );
                    outsideDiv += "</div>";
                    const info = document.createElement("div");
                    info.className = "info";
                    const popup = new mapboxgl.Popup({
                      offset: 10,
                      maxWidth: "none",
                      className: "popups",
                    })
                      .setLngLat(center)
                      .setHTML(outsideDiv);
                    new mapboxgl.Marker(info)
                      .setLngLat(center)
                      .setPopup(popup)
                      .addTo(map);
                  });
                }}
              >
                {city}
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <main ref={mapContainerRef} className="mapContainer"></main>
    </div>
  );
}

export default App;
