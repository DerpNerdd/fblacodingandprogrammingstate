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
  
    // Call fetchData to refresh the data
    fetchData();
  
    // Optional: Set an interval to refresh data every few seconds
    // setInterval(fetchData, 5000);
  });
  