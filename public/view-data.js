document.addEventListener('DOMContentLoaded', function() {
    function fetchData() {
      fetch('/get-partner-info')
        .then(response => response.json())
        .then(data => {
          const table = document.getElementById('data-table');
          // Clear existing table rows except the header
          while (table.rows.length > 1) {
            table.deleteRow(1);
          }
          // Populate table with new data
          data.forEach(item => {
            const row = table.insertRow();
            Object.values(item).forEach(text => {
              const cell = row.insertCell();
              cell.textContent = text;
            });
          });
        })
        .catch(err => console.error('Error fetching data:', err));
    }
    // Fetch and populate unique states
    fetch('/unique-states')
    .then(response => response.json())
    .then(states => {
      const stateSelect = document.getElementById('stateFilter');
      states.forEach(state => {
        const option = new Option(state, state);
        stateSelect.appendChild(option);
      });
    });

  // Add event listener to state select dropdown to fetch cities
  document.getElementById('stateFilter').addEventListener('change', function() {
    const state = this.value;
    fetch(`/unique-cities?state=${encodeURIComponent(state)}`)
      .then(response => response.json())
      .then(cities => {
        const citySelect = document.getElementById('cityFilter');
        citySelect.innerHTML = '<option value="">Select City</option>'; // Clear previous options
        cities.forEach(city => {
          const option = new Option(city, city);
          citySelect.appendChild(option);
        });
      });
  });
    // Call fetchData to refresh the data
    fetchData();
  
    // Optional: Set an interval to refresh data every few seconds
    // setInterval(fetchData, 5000);
  });


  function applyFilters() {
    const search = document.getElementById('searchInput').value;
    const state = document.getElementById('stateFilter').value;
    const city = document.getElementById('cityFilter').value;
    const name = document.getElementById('nameSort').value;
  
    // Construct query URL
    let queryURL = '/get-partner-info?';
    if (search) queryURL += `search=${search}&`;
    if (state) queryURL += `state=${state}&`;
    if (city) queryURL += `city=${city}&`;
    if (name) queryURL += `name=${name}`;
  
    fetch(queryURL)
      .then(response => response.json())
      .then(data => {
        const table = document.getElementById('data-table');
        // Clear existing table rows except the header
        while (table.rows.length > 1) {
          table.deleteRow(1);
        }
        // Populate table with new data
        data.forEach(item => {
          const row = table.insertRow();
          Object.values(item).forEach(text => {
            const cell = row.insertCell();
            cell.textContent = text;
          });
        });
      })
      .catch(err => console.error('Error fetching data:', err));
  }
  
  document.addEventListener('DOMContentLoaded', applyFilters); // Apply filters on page load as well
  
