import { useState, useEffect } from 'react';
import { Country, State } from 'country-state-city';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { useUser } from './UserData';

function Weather() {
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [alertData, setAlertData] = useState(null);
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null); //declare the image to display related background image

  const { userId } = useUser();

  const countries = Country.getAllCountries();
  const states = State.getStatesOfCountry(country);

  const APIKEY_WEATHER = "33859b42938f41308af85015250205";
  const APIKEY_ICONIC = "35193368-4e77f65738df9f6044ab18420";
  const FORECAST_DAYS = 3; // number of days for forecast
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

    const query = `${selectedState.name},${selectedCountry.name}`;
    const queryState = selectedState.name;
    const current_weather_api = `http://api.weatherapi.com/v1/current.json?key=${APIKEY_WEATHER}&q=${query}&aqi=no`;
    const forecas_api = `http://api.weatherapi.com/v1/forecast.json?key=${APIKEY_WEATHER}&q=${query}&days=${FORECAST_DAYS}&aqi=no&alerts=yes`;
    const weather_alert_api = `http://api.weatherapi.com/v1/alerts.json?key=${APIKEY_WEATHER}&q=${query}`;

    // const country_state_iconic_api = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${queryState}`);
    const country_state_iconic_api = await fetch(`https://pixabay.com/api/?key=${APIKEY_ICONIC}&q=${queryState}&category=places&image_type=photo`);


    try {
      const image = await country_state_iconic_api.json();
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

  useEffect(() => {
    console.log("User ID from context:", userId);
  }, [userId]);

  async function saveWeatherData() {
    try {
     const response = await fetch('http://localhost:5000/save-weather', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        location: weatherData.location,
        current: weatherData.current,
        iconic_image: image,
        saved_at: new Date()
      })
    });
    
    if (response.status == 200) {
      alert("Weather data saved successfully.");
    } else {
      alert("Failed to save weather data. Please try again.");
    }
  } catch (error) {
    console.error("Error saving weather data:", error);
    alert("An error occurred while saving the data.");
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

        <div className="col-md-3 mb-3 d-flex align-items-end ">
          <button className="btn btn-primary w-100" onClick={fetchWeatherData}>
            Get Weather
          </button>
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
            <div
              className="card mb-4 text-white weather-section"
              style={{
                // the url of placeholder image is to indicate user when the image is not found
                backgroundImage: `url(${image || "https://placehold.co/600x400/beige/white?text=No+Iconic+Image+Found"})`,
                backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundAttachment: 'fixed', height: '500px'
              }}
            >
              <div className="card-body text-center bg-dark bg-opacity-50 rounded">
                <h4>Current Weather in {weatherData.location.name}, {weatherData.location.country}</h4>
                <img src={weatherData.current.condition.icon} alt="Icon" />
                <p>{weatherData.current.condition.text}</p>
                <p><strong>Temperature:</strong> {weatherData.current.temp_c ?? 'N/A'}°C</p>
                <p><strong>Humidity:</strong> {weatherData.current.humidity ?? 'N/A'}%</p>
                <p><strong>Wind:</strong> {weatherData.current.wind_kph ?? 'N/A'} kph</p>
                <p><strong>Last Updated:</strong> {weatherData.current.last_updated ?? 'N/A'}</p>
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
                <div className="mt-3 alert alert-danger text-start">
                  <p className="text-danger">Weather Alerts:</p>
                  <p><strong>Effective Date: </strong>{alertData.alerts.alert[0].effective ?? 'N/A'}</p>
                  <p><strong>Event: </strong>{alertData.alerts.alert[0].event ?? 'N/A'}</p>
                  <p><strong>Severity: </strong>{alertData.alerts.alert[0].severity ?? 'N/A'}</p>
                  <p><strong>Area: </strong>{alertData.alerts.alert[0].areas ?? 'N/A'}</p>
                  <p><strong>Description: </strong>{alertData.alerts.alert[0].desc ?? 'N/A'}</p>
                  <p><strong>Instructions: </strong>{alertData.alerts.alert[0].instruction ?? 'N/A'}</p>
                </div>
              )}
            </>
          )}
        </div>
        {weatherData && (
          <div className="col-md-4">
            <div className="card text-dark mb-4 shadow-sm">
              <div className="card-body">
                <h5 className="card-title text-center mb-4">Additional Weather Details</h5>

                {/* pressure, visibility, humidity */}
                <div className="row text-center mb-3">
                  <div className="col-md-4 border-end">
                    <p className="mb-1"><strong>Pressure</strong></p>
                    <p>{weatherData.current.pressure_mb ?? 'N/A'} mb</p>
                  </div>
                  <div className="col-md-4 border-end">
                    <p className="mb-1"><strong>Visibility</strong></p>
                    <p>{weatherData.current.vis_km ?? 'N/A'} km</p>
                  </div>
                  <div className="col-md-4">
                    <p className="mb-1"><strong>Humidity</strong></p>
                    <p>{weatherData.current.humidity ?? 'N/A '}%</p>
                  </div>
                </div>

                {/* wind */}
                <div className="row text-center mb-3">
                  <div className="col-md-12">
                    <p className="mb-1"><strong>Wind</strong></p>
                    <p>{weatherData.current.wind_dir} at {weatherData.current.wind_kph} kph</p>
                  </div>
                </div>

                {/* time-based temperature */}
                <h6 className="text-center mt-4">Temperature by Time of Day</h6>
                <div className="row text-center">
                  <div className="col-md-3 border-end">
                    <p className="mb-1"><strong>Morning</strong></p>
                    <p>{forecastData?.forecast?.forecastday[0]?.hour[8]?.temp_c ?? 'N/A'}°C</p>
                  </div>
                  <div className="col-md-3 border-end">
                    <p className="mb-1"><strong>Afternoon</strong></p>
                    <p>{forecastData?.forecast?.forecastday[0]?.hour[14]?.temp_c ?? 'N/A'}°C</p>
                  </div>
                  <div className="col-md-3 border-end">
                    <p className="mb-1"><strong>Evening</strong></p>
                    <p>{forecastData?.forecast?.forecastday[0]?.hour[18]?.temp_c ?? 'N/A'}°C</p>
                  </div>
                  <div className="col-md-3">
                    <p className="mb-1"><strong>Night</strong></p>
                    <p>{forecastData?.forecast?.forecastday[0]?.hour[22]?.temp_c ?? 'N/A'}°C</p>
                  </div>
                </div>
              </div>
              <button className="btn btn-secondary mt-3 w-100" onClick={saveWeatherData}>Save Current Weather</button>
            </div>
          </div>
        )}
      </div>


      {/* the selected country's forecast data from api */}
      {forecastData?.forecast?.forecastday && (
        <div className="card mb-4">
          <div className="card-body">
            <h5>3-Day Forecast</h5>
            <div className="row">
              {forecastData.forecast.forecastday.map((forecast, i) => (
                <div className="col-md-4" key={i}>
                  <div className="border p-3 mb-2">
                    <h6>{forecast.date}</h6>
                    <img src={forecast.day.condition.icon} alt="icon" />
                    <p>{forecast.day.condition.text}</p>
                    <p><strong>Max: </strong>{forecast.day.maxtemp_c}°C</p>
                    <p><strong>Min: </strong>{forecast.day.mintemp_c}°C</p>

                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Weather;
