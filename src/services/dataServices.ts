/**
 * Weather Service using Open-Meteo (Free)
 */
export async function getWeather(lat: number, lon: number) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min,uv_index_max&timezone=auto`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Weather fetch failed");
  return response.json();
}

export async function getWeatherByCity(city: string) {
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
  const geoRes = await fetch(geoUrl);
  const geoData = await geoRes.json();
  
  if (!geoData.results || geoData.results.length === 0) {
    throw new Error("City not found");
  }
  
  const { latitude, longitude, name } = geoData.results[0];
  const weather = await getWeather(latitude, longitude);
  return { ...weather, city: name };
}

/**
 * News Service proxying through server
 */
export async function getTopNews(category: string = "general") {
  const url = `/api/news?category=${category}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("News fetch failed");
  return response.json();
}

/**
 * Exchange Rate Service proxying through server
 */
export async function getExchangeRates(base: string = "USD") {
  const url = `/api/exchange-rates?base=${base}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Exchange rate fetch failed");
  return response.json();
}
