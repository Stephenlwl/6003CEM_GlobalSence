import { useState, useEffect } from 'react';
import { Country, State } from 'country-state-city';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function Weather() {
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [alertData, setAlertData] = useState(null);
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null); //declare the image to display related background image


  const countries = Country.getAllCountries();
  const states = State.getStatesOfCountry(country);

  const APIKEY = "33859b42938f41308af85015250205";
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
    const current_weather_api = `http://api.weatherapi.com/v1/current.json?key=${APIKEY}&q=${query}&aqi=no`;
    const forecas_api = `http://api.weatherapi.com/v1/forecast.json?key=${APIKEY}&q=${query}&days=${FORECAST_DAYS}&aqi=no&alerts=yes`;
    const weather_alert_api = `http://api.weatherapi.com/v1/alerts.json?key=${APIKEY}&q=${query}`;

    const country_state_iconic_api = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${queryState}`);
    
    const image = await country_state_iconic_api.json();
      if (image.originalimage?.source) {
        setImage(image.originalimage.source); // Set the image from the API response
      } else {
        setImage(null); // No result
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
      {weatherData && (
        <div className="card mb-4">
          {image ? (
              <img src={image} alt="The iconic place of the state" className="card-img-top" style={{height: 'auto', width: '250px;', objectFit: 'cover'}} />
            ) : (
              <img src="https://via.placeholder.com/600x300?text=No+Image+Found" alt="No image found" className="card-img-top" />
            )}
          <div className="card-body text-center">
            <h4>Current Weather in {weatherData.location.name}, {weatherData.location.country}</h4>
            <img src={weatherData.current.condition.icon} alt="Icon" />
            <p>{weatherData.current.condition.text}</p>
            <p><strong>Temperature:</strong> {weatherData.current.temp_c}°C</p>
            <p><strong>Humidity:</strong> {weatherData.current.humidity}%</p>
            <p><strong>Wind:</strong> {weatherData.current.wind_kph} kph</p>
            <p><strong>Last Updated:</strong> {weatherData.current.last_updated}</p>
          </div>
          <div>
            {alertData?.alerts?.alert.length < 1 ? (
              <p className="text-success">No weather alerts.</p>
            ) : (
              <>
                <p className="text-danger">Weather Alerts:</p>
                {alertData && (
                  <div className="mt-3 alert alert-danger">
                    <p><strong>Effective Date: </strong>{alertData.alerts.alert[0].effective}</p>
                    <p><strong>Event: </strong>{alertData.alerts.alert[0].event}</p>
                    <p><strong>Severity: </strong>{alertData.alerts.alert[0].severity}</p>
                    <p><strong>Area: </strong>{alertData.alerts.alert[0].areas}</p>
                    <p><strong>Description: </strong>{alertData.alerts.alert[0].desc}</p>
                    <p><strong>Instructions: </strong>{alertData.alerts.alert[0].instruction}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

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
