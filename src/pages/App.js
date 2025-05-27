import { useState, useEffect } from 'react';
import { Country, State } from 'country-state-city';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { useUser } from './UserData';
import { Link, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { BsClockHistory } from "react-icons/bs";
import { WiHumidity, WiStrongWind, WiSunrise, WiSunset, WiRaindrop, WiBarometer, WiDaySunny, WiFog, WiCloudyGusts, WiThermometer } from "react-icons/wi";
import { FaRegSun } from "react-icons/fa";

function Weather() {
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [alertData, setAlertData] = useState(null);
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null); //declare the image to display related background image
  const [allIconicImage, setAllIconicImage] = useState([]); // declare the image to display related background image for all countries
  const [iconicVideo, setIconicVideo] = useState(null); // declare the video to display related background video
  const [saving, setSaving] = useState(false);

  const { userId } = useUser();
  const weather_id = uuidv4(); // generate uniqueID for the weather data
  const navigation = useNavigate();
  const countries = Country.getAllCountries();
  const states = State.getStatesOfCountry(country);

  // handling API keys
  const APIKEY_WEATHER = "33859b42938f41308af85015250205";
  const APIKEY_ICONIC = "35193368-4e77f65738df9f6044ab18420";
  const FORECAST_DAYS = 3; // number of days for forecast

  useEffect(() => {
    const fetchGlobalIconicMedia = async () => {
      try {
        const all_country_state_iconic_api = await fetch(`https://pixabay.com/api/?key=${APIKEY_ICONIC}&category=places&image_type=photo&orientation=horizontal`);
        const allCountryImageData = await all_country_state_iconic_api.json();

        if (allCountryImageData.hits && allCountryImageData.hits.length > 0) {
          const suffledIconicImage = allCountryImageData.hits.sort(() => Math.random() - 0.5); // shuffle the images
          setAllIconicImage(suffledIconicImage.slice(0, 8));
        } else {
          setAllIconicImage([]);
        }
      } catch (error) {
        console.error("Error fetching all images:", error);
        setAllIconicImage([]);
      }

      try {
        const country_state_iconic_video_api = await fetch(`https://pixabay.com/api/videos/?key=${APIKEY_ICONIC}&category=places&video_type=all`);
        const videoData = await country_state_iconic_video_api.json();

        if (videoData.hits && videoData.hits.length > 0) {
          const randomIconicVideo = videoData.hits[Math.floor(Math.random() * videoData.hits.length)]; // shuffle the videos
          setIconicVideo(randomIconicVideo.videos.medium.url);
        } else {
          setIconicVideo(null);
        }
      } catch (error) {
        console.error("Error fetching video:", error);
        setIconicVideo(null);
      }
    };

    fetchGlobalIconicMedia();
  }, []);

  // get the weather data from the API
  const fetchWeatherData = async () => {
    setHasSearched(true);
    setLoading(true);

    const selectedState = states.find(s => s.isoCode === state);
    const selectedCountry = countries.find(c => c.isoCode === country);

    if (!country && !state) {
      alert("Please select a country and state selected.");
      setLoading(false);
      return;
    } else if (!state) {
      alert("Please select a state.");
      setLoading(false);
      return;
    } else if (!country) {
      alert("Please select a country.");
      setLoading(false);
      return;
    }

    // declare the selected country and state
    const query = `${selectedState.name},${selectedCountry.name}`;
    const queryState = selectedState.name;

    // Weather API endpoints
    const current_weather_api = `http://api.weatherapi.com/v1/current.json?key=${APIKEY_WEATHER}&q=${query}&aqi=no`;
    const forecas_api = `http://api.weatherapi.com/v1/forecast.json?key=${APIKEY_WEATHER}&q=${query}&days=${FORECAST_DAYS}&aqi=no&alerts=yes`;
    const weather_alert_api = `http://api.weatherapi.com/v1/alerts.json?key=${APIKEY_WEATHER}&q=${query}`;

    // Iconic places API endpoints
    const specific_country_state_iconic_api = await fetch(`https://pixabay.com/api/?key=${APIKEY_ICONIC}&q=${queryState}&category=places&image_type=photo&orientation=horizontal`);

    // Fetching data from the APIs
    try {
      const image = await specific_country_state_iconic_api.json();
      if (image.hits && image.hits.length > 0) {
        setImage(image.hits[0].largeImageURL); // set the image from the API response
      } else {
        setImage(null);
      }
    } catch (error) {
      console.error("Error fetching image:", error);
      setImage(null);
    }

    try {
      const currentRes = await fetch(current_weather_api);
      const currentData = await currentRes.json();
      setWeatherData(currentData);

      const forecastRes = await fetch(forecas_api);
      const forecastData = await forecastRes.json();
      setForecastData(forecastData);

      const alertRes = await fetch(weather_alert_api);
      const alertData = await alertRes.json();
      setAlertData(alertData);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to load weather data.");
    } finally {
      setLoading(false);
    }

  };

  // Check if user is logged in
  useEffect(() => {
    console.log("User ID from context:", userId);

    if (!userId) {
      navigation('/login', { replace: true })
      return;
    }

  }, [userId, navigation]);

  // Save weather data to the db
  async function saveWeatherData() {
    setSaving(true);
    try {
      const response = await fetch('http://localhost:5000/save-weather', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weather_id: weather_id,
          user_id: userId,
          location: weatherData.location,
          current: weatherData.current,
          iconic_image: image,
          saved_at: new Date()
        })
      });

      if (response.status === 200) {
        alert("Weather data saved successfully.");
        setSaving(false);
      } else {
        alert("You have saved same weather data. Please try others.");
        setSaving(false);
      }
    } catch (error) {
      console.error("Error saving weather data:", error);
      alert("An error occurred while saving the data.");
      setSaving(false);
    }
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Weather Forecast</h2>

      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <label>Country</label>
          <select className="form-control" value={country}
            onChange={(e) => setCountry(e.target.value)}>
            <option value="">Select Country</option>
            {countries.map((c) => (
              <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
            ))}
            {/* isoCode example MYR,US,UK like that as a abbriviation of the country name */}
          </select>
        </div>

        <div className="col-md-4 mb-3">
          <label>State</label>
          <select className="form-control" value={state}
            onChange={(e) => setState(e.target.value)}>
            <option value="">Select State</option>
            {states.map((s) => (
              <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="col-md-2 mb-3 d-flex align-items-end ">
          <button className="btn btn-outline-primary w-100" onClick={fetchWeatherData}>
            Get Weather
          </button>
        </div>
        <div className="col-md-2 mb-3 d-flex align-items-end">
          <Link to="/saved-weather" className="btn btn-outline-info mt-3 w-100">View Saved Weather</Link>
        </div>
      </div>

      {!hasSearched && (
        <div className="alert alert-info">
          <strong>Note:</strong><br></br>
          Search for a country and state to view the current weather and 3-day forecast.
        </div>
      )}
      {loading && (
        <div className="text-center mb-4">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only"></span>
          </div>
          <p className="mt-2">Please be patient, We are getting related weather info for you...</p>
        </div>
      )}
      {/* display the selected country's state current weather info from api */}
      <div className="row">
        <div className="col-md-8 text-center">
          {weatherData && (
            <div className="card mb-4 text-white weather-section"
              style={{
                // the url of placeholder image is to indicate user when the image is not found
                backgroundImage: `url(${image || "https://placehold.co/600x400/beige/white?text=No+Iconic+Image+Found"})`,
                backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundAttachment: 'fixed', height: '500px'
              }}
            >
              <div className="card-body text-center bg-dark bg-opacity-50 rounded d-flex flex-column justify-content-center align-items-center h-500">
                <h4>Current Weather in {weatherData.location.name}, {weatherData.location.country}</h4>
                <img src={weatherData.current.condition.icon} alt="Weather Icon" />
                <p className="fs-5">{weatherData.current.condition.text}</p>
                <p><WiDaySunny className="me-2" size={24} /><strong>Temperature:</strong> {weatherData.current.temp_c ?? 'N/A'}°C</p>
                <p><WiHumidity className="me-2" size={24} /><strong>Humidity:</strong> {weatherData.current.humidity ?? 'N/A'}%</p>
                <p><WiStrongWind className="me-2" size={24} /><strong>Wind:</strong> {weatherData.current.wind_kph ?? 'N/A'} kph</p>
                <p><BsClockHistory className="me-2" /><strong>Last Updated:</strong> {weatherData.current.last_updated ?? 'N/A'}</p>
              </div>
            </div>
          )}
          {alertData?.alerts?.alert.length < 1 ? (
            <div className="mt-3 alert alert-info">
              <p className="text-success">No Weather Alerts For Today in This State.</p>
            </div>
          ) : (
            <>

              {alertData && (
                <div className="alert alert-danger text-start">
                  <h6><span className="badge bg-danger me-2">Weather Alert:</span>{alertData.alerts.alert[0].event}</h6>
                  <ul className="mb-0">
                    <li><strong>Effective:</strong> {new Date(alertData.alerts.alert[0].effective).toLocaleString() ?? 'N/A'}</li>
                    <li><strong>Severity:</strong> {alertData.alerts.alert[0].severity ?? 'N/A'}</li>
                    <li><strong>Area:</strong> {alertData.alerts.alert[0].areas ?? 'N/A'}</li>
                    <li><strong>Description:</strong> {alertData.alerts.alert[0].desc ?? 'N/A'}</li>
                    <li><strong>Instructions:</strong> {alertData.alerts.alert[0].instruction ?? 'N/A'}</li>
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
        {weatherData && (
          <div className="col-md-4">
            <div className="card text-dark mb-4 shadow-sm">
              <div className="card-header bg-primary text-white text-center"><h5 className="mb-0">Live Weather Summary</h5></div>
              <div className="card-body">
                {/* pressure, visibility, humidity */}
                <div className="row text-center mb-3">
                  <div className="col-md-4 border-end">
                    <p className="mb-1"><WiBarometer className="me-1" /> <strong>Pressure</strong></p>
                    <p>{weatherData.current.pressure_mb ?? 'N/A'} mb</p>
                  </div>
                  <div className="col-md-4 border-end">
                    <p className="mb-1"><WiFog className="me-1" /> <strong>Visibility</strong></p>
                    <p>{weatherData.current.vis_km ?? 'N/A'} km</p>
                  </div>
                  <div className="col-md-4">
                    <p className="mb-1"><WiHumidity className="me-1" /> <strong>Humidity</strong></p>
                    <p>{weatherData.current.humidity ?? 'N/A'}%</p>
                  </div>
                </div>

                {/* wind */}
                <div className="row text-center mb-3">
                  <div className="col-md-12">
                    <p className="mb-1"><WiCloudyGusts className="me-1" /> <strong>Wind</strong></p>
                    <p>{weatherData.current.wind_dir} at {weatherData.current.wind_kph} kph</p>
                  </div>
                </div>

                <h6 className="text-center mt-4 border-bottom pb-2">Temperature by Time of Day</h6>
                <div className="row row-cols-2 g-2 mt-2 text-center">
                  <div className="col">
                    <div className="p-2 rounded bg-light shadow-sm">
                      <p className="mb-1"><strong>Morning</strong></p>
                      <p>{forecastData?.forecast?.forecastday[0]?.hour[8]?.temp_c ?? 'N/A'}°C</p>
                    </div>
                  </div>
                  <div className="col">
                    <div className="p-2 rounded bg-warning bg-opacity-50 shadow-sm">
                      <p className="mb-1"><strong>Afternoon</strong></p>
                      <p>{forecastData?.forecast?.forecastday[0]?.hour[14]?.temp_c ?? 'N/A'}°C</p>
                    </div>
                  </div>
                  <div className="col">
                    <div className="p-2 rounded bg-secondary text-white shadow-sm">
                      <p className="mb-1"><strong>Evening</strong></p>
                      <p>{forecastData?.forecast?.forecastday[0]?.hour[18]?.temp_c ?? 'N/A'}°C</p>
                    </div>
                  </div>
                  <div className="col">
                    <div className="p-2 rounded bg-dark text-white shadow-sm">
                      <p className="mb-1"><strong>Night</strong></p>
                      <p>{forecastData?.forecast?.forecastday[0]?.hour[22]?.temp_c ?? 'N/A'}°C</p>
                    </div>
                  </div>
                </div>
              </div>
              <button className="btn btn-outline-secondary mt-3 w-100" onClick={saveWeatherData} disabled={saving}>{saving ? "saving..." : "Save Current Weather"}</button>
            </div>
          </div>
        )}
      </div>


      {/* the selected country's forecast data from api */}
      {forecastData?.forecast?.forecastday && (
        <div className="card mb-4 border-1 shadow-sm rounded-4">
          <div className="card-body">
            <h5 className="text-center mb-4 fw-bold">3-Day Forecast</h5>
            <div className="row g-4">
              {forecastData.forecast.forecastday.map((forecast, i) => (
                <div className="col-md-4" key={i}>
                  <div className="card text-center border-0 shadow mb-3 p-3 bg-white rounded-4">
                    <h6 className="fw-semibold mb-2">{forecast.date}</h6>
                    <div className="d-flex justify-content-center mb-3">
                      <img src={forecast.day.condition.icon} alt="Condition Icon" style={{ width: '60px', height: '60px' }}/>
                    </div>
                    <p className="text-muted mb-2">{forecast.day.condition.text}</p>
                    <div className="d-flex justify-content-around mt-3">
                      <div>
                        <WiThermometer size={28} className="text-danger" />
                        <p className="mb-0"><strong>Max:</strong> {forecast.day.maxtemp_c}°C</p>
                      </div>
                      <div>
                        <WiThermometer size={28} className="text-primary" />
                        <p className="mb-0"><strong>Min:</strong> {forecast.day.mintemp_c}°C</p>
                      </div>
                    </div>
                    <hr className="my-3" />
                    <div className="text-start small px-2">
                      <p><WiHumidity size={20} /> <strong>Humidity:</strong> {forecast.day.avghumidity}%</p>
                      <p><WiRaindrop size={20} /> <strong>Rain Chance:</strong> {forecast.day.daily_chance_of_rain}%</p>
                      <p><WiStrongWind size={20} /> <strong>Wind:</strong> {forecast.day.maxwind_kph} kph</p>
                      <p><FaRegSun size={18} className="text-warning" /> <strong>UV Index:</strong> {forecast.day.uv}</p>
                      {forecast.astro && (
                        <>
                          <p><WiSunrise size={22} className="text-orange" /> <strong>Sunrise:</strong> {forecast.astro.sunrise}</p>
                          <p><WiSunset size={22} className="text-danger" /> <strong>Sunset:</strong> {forecast.astro.sunset}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* all countries iconic places */}
      {allIconicImage?.length > 0 && (
        <div className="card mb-4">
          <div className="card-body text-center">
            <h3 className="mb-4">~ Iconic Places Around the World ~</h3>
            <div className="row">
              {allIconicImage.map((iconicPlace, index) => (
                <div key={index} className="col-6 col-md-4 col-lg-3 mb-3">
                  <img src={iconicPlace.largeImageURL} alt={`Iconic Place ${index + 1}`} className="img-fluid rounded shadow-sm" />
                  <label className="d-block mt-2 text-muted" style={{ fontSize: '0.9rem' }}>
                    {iconicPlace.tags || 'No tags available'}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* iconic video */}
      {iconicVideo && (
        <div className="card mb-4">
          <div className="card-body text-center">
            <h3 className="mb-4">~ Iconic Video ~</h3>
            <video className="w-100" style={{ height: '400px' }} controls autoPlay muted>
              <source src={iconicVideo} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}
    </div>
  );
}

export default Weather;
