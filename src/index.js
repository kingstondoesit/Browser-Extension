// Select form elements from the DOM
const form = document.querySelector('.form-data'); // The form containing user input fields for API key and region
const region = document.querySelector('.region-name'); // The input field where the user enters the region name
const apiKey = document.querySelector('.api-key'); // The input field where the user enters their API key

// Select result and status elements from the DOM
const errors = document.querySelector('.errors'); // An element to display any error messages
const loading = document.querySelector('.loading'); // An element to show loading status while data is being fetched
const results = document.querySelector('.result-container'); // A container for displaying results like carbon usage
const usage = document.querySelector('.carbon-usage'); // An element to display carbon usage data
const fossilfuel = document.querySelector('.fossil-fuel'); // An element to display fossil fuel percentage data
const myregion = document.querySelector('.my-region'); // An element to display the region name for which data is fetched
const clearBtn = document.querySelector('.clear-btn'); // A button to clear the current region and reset the form

// Initialize the app based on stored data
const init = () => {
  // Retrieve the stored API key and region name from localStorage
  const storedApiKey = localStorage.getItem('apiKey');
  const storedRegion = localStorage.getItem('regionName');

  // TODO: Set icon to a generic green (currently not implemented)

  if (storedApiKey === null || storedRegion === null) {
    // If no API key or region is stored, display the form for user input
    form.style.display = 'block';
    results.style.display = 'none';
    loading.style.display = 'none';
    clearBtn.style.display = 'none';
    errors.textContent = '';

    // If the API key is stored but region is not, pre-fill/populate the API key field
    if (storedApiKey != null) {
      apiKey.value = storedApiKey;
    }
  } else {
    // Set up user data if both API key and region are stored
    clearBtn.style.display = 'block';
    setUpUser(storedApiKey, storedRegion);
  }
};

// Reset the form, clearing only the region and retaining the API key
const reset = (e) => {
  e.preventDefault();
  // Remove the region name from localStorage while keeping the API key
  localStorage.removeItem('regionName');

  // Optionally reset the region input field, but leave the API key as is
  region.value = '';

  // Reinitialize the app to reflect the reset state
  init();
};

// Store the user's API key and region in localStorage and initiate data fetch
const setUpUser = (apiKey, regionName) => {
  localStorage.setItem('apiKey', apiKey);
  localStorage.setItem('regionName', regionName);
  loading.style.display = 'block';
  errors.textContent = '';
  clearBtn.style.display = 'block';
  displayCarbonUsage(apiKey, regionName);
};

// Handle form submission
const handleSubmit = (e) => {
  e.preventDefault();
  setUpUser(apiKey.value, region.value);
};

// Fetch and display carbon usage and zone name data
import axios from 'axios'; // Import Axios for HTTP requests

const displayCarbonUsage = async (apiKey, region) => {
  try {
    // Fetch carbon usage data
    const carbonResponse = await axios.get(
      'https://api.co2signal.com/v1/latest',
      {
        params: { countryCode: region },
        headers: { 'auth-token': apiKey },
      }
    );

    // Extract data from response
    const CO2 = carbonResponse.data.data.carbonIntensity;
    const fuelPercentage = carbonResponse.data.data.fossilFuelPercentage;

    // Fetch zone name data
    const zoneResponse = await axios.get(
      'https://api.electricitymap.org/v3/zones'
    );
    const zoneData = zoneResponse.data;

    // Determine zone display name
    const zoneInfo = zoneData[region] || {};
    const displayName = zoneInfo.countryName
      ? `${zoneInfo.countryName} - ${zoneInfo.zoneName}`
      : zoneInfo.zoneName || region;

    // Update UI with results
    loading.style.display = 'none';
    form.style.display = 'none';
    myregion.textContent = displayName;
    usage.textContent = `${Math.round(
      CO2
    )} grams (CO2 emitted per kilowatt hour)`;
    fossilfuel.textContent = `${fuelPercentage.toFixed(
      2
    )}% (percentage of fossil fuels used to generate electricity)`;
    results.style.display = 'block';
    
  } catch (error) {
    // Handle errors and update UI
    console.error('Error fetching data:', error);
    loading.style.display = 'none';
    results.style.display = 'none';
    errors.textContent = `Sorry, we have no data for the region: ${region}.`;
  }
};

// Set event listeners for form submission and reset button click
form.addEventListener('submit', (e) => handleSubmit(e));
clearBtn.addEventListener('click', (e) => reset(e));
init(); // Initialize the app when the script loads
