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

// Initialize function to check for any stored data and set up the initial state
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
    // If both API key and region are stored, display results by calling the API
    displayCarbonUsage(storedApiKey, storedRegion);
    results.style.display = 'none';
    form.style.display = 'none';
    clearBtn.style.display = 'block';
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
  localStorage.setItem('apiKey', apiKey); // Store the API key
  localStorage.setItem('regionName', regionName); // Store the region name
  loading.style.display = 'block'; // Show the loading spinner
  errors.textContent = ''; // Clear any previous error messages
  clearBtn.style.display = 'block'; // Show the clear button to allow resetting
  // Fetch and display carbon usage data based on user input
  displayCarbonUsage(apiKey, regionName);
};

// Handle the form submission, storing user input and triggering data fetch
const handleSubmit = (e) => {
  e.preventDefault(); // Prevent the default form submission behavior
  setUpUser(apiKey.value, region.value); // Set up user input and initiate the process
};

// Fetch and display carbon usage data from the API based on API key and region
import axios from '../node_modules/axios'; // Import Axios for making HTTP requests
const displayCarbonUsage = async (apiKey, region) => {
  try {
    // Make an API request to fetch the latest carbon usage data
    await axios
      .get('https://api.co2signal.com/v1/latest', {
        params: {
          countryCode: region, // Pass the region as a query parameter
        },
        headers: {
          'auth-token': apiKey, // Include the API key in the request header
        },
      })
      .then((response) => {
        // Extract carbon intensity data from the response
        let CO2 = response.data.data.carbonIntensity;
        
        // Extract fossil fuel data from response
        let fuelPercentage = response.data.data.fossilFuelPercentage;

        // Hide the loading spinner and form, show the result
        loading.style.display = 'none';
        form.style.display = 'none';
        myregion.textContent = region; // Display the region name
        usage.textContent =
          Math.round(CO2) + ' grams (C02 emitted per kilowatt hour)'; // Display carbon usage
        fossilfuel.textContent =
          fuelPercentage.toFixed(2) +
          '% (percentage of fossil fuels used to generate electricity)'; // Display fossil fuel percentage
        results.style.display = 'block'; // Show the result container
      });
  } catch (error) {
    // Handle errors by logging and displaying a message to the user
    console.log(error);
    loading.style.display = 'none';
    results.style.display = 'none';
    errors.textContent =
      'Sorry, we have no data for the region you have requested.';
  }
};

// Set event listeners for form submission and reset button click
form.addEventListener('submit', (e) => handleSubmit(e)); // Handle form submission
clearBtn.addEventListener('click', (e) => reset(e)); // Handle reset button click
init(); // Initialize the app when the script loads
