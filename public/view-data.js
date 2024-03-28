document.addEventListener('DOMContentLoaded', function() {
  fetchData();
  populateStates();
  document.getElementById('stateFilter').addEventListener('change', populateCities);
  applyFilters(); // Apply filters on page load as well
});

function fetchData() {
  fetch('/get-all-partner-info', { credentials: 'include' })
    .then(response => response.json())
    .then(submissions => {
      const table = document.getElementById('data-table');
      // Clear existing table rows except the header
      while (table.rows.length > 1) {
        table.deleteRow(1);
      }
      
      submissions.forEach((submission, index) => {
        const row = table.insertRow();
        row.insertCell(0).textContent = index + 1; // Index or another identifier
        row.insertCell(1).textContent = submission.firstName;
        row.insertCell(2).textContent = submission.lastName;
        row.insertCell(3).textContent = submission.contactEmail;
        row.insertCell(4).textContent = submission.phoneNumber;
        row.insertCell(5).textContent = submission.orgName;
        row.insertCell(6).textContent = submission.orgAddress;
        row.insertCell(7).textContent = submission.orgCity;
        row.insertCell(8).textContent = submission.orgState;
        row.insertCell(9).textContent = submission.resources;
        row.insertCell(10).textContent = submission.addInformation;

        const actionsCell = row.insertCell(11);
        actionsCell.innerHTML = submission.isOwner ? 
          `<button onclick="editItem('${submission._id}')">Edit</button> <button onclick="deleteItem('${submission._id}')">Delete</button>` :
          ''; // No actions for non-owners
      });
    })
    .catch(err => console.error('Error fetching submissions:', err));
}

// Make sure the editItem and deleteItem functions are properly defined as well.


function editItem(itemId) {
  window.location.href = `/edit-data.html?itemId=${itemId}`;
}

function deleteItem(itemId) {
  if (!confirm('Are you sure you want to delete this item?')) return;
  fetch(`/delete-partner-info/${itemId}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  .then(response => {
    if (response.ok) {
      alert('Item deleted successfully.');
      fetchData(); // Refresh the list after deletion
    } else {
      alert('Failed to delete item.');
    }
  })
  .catch(error => {
    console.error('Error deleting item:', error);
    alert('Error deleting item.');
  });
}


function editItem(itemId) {
  window.location.href = `/edit-data.html?itemId=${itemId}`; // Redirect to an edit page or handle with a modal
}

function deleteItem(itemId) {
  if (!confirm('Are you sure you want to delete this item?')) return;
  fetch(`/delete-partner-info/${itemId}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  .then(response => {
    if (response.ok) {
      alert('Item deleted successfully.');
      fetchData(); // Refresh the list after deletion
    } else {
      alert('Failed to delete item.');
    }
  })
  .catch(error => {
    console.error('Error deleting item:', error);
    alert('Error deleting item.');
  });
}




function applyFilters() {
  const search = document.getElementById('searchInput').value;
  const state = document.getElementById('stateFilter').value;
  const city = document.getElementById('cityFilter').value;
  const name = document.getElementById('nameSort').value;

  let queryURL = '/get-partner-info?';
  if (search) queryURL += `search=${search}&`;
  if (state) queryURL += `state=${state}&`;
  if (city) queryURL += `city=${city}&`;
  if (name) queryURL += `name=${name}`;

  fetch(queryURL, { credentials: 'include' }) // Ensure credentials are included for session-based auth
    .then(response => response.json())
    .then(data => {
      const table = document.getElementById('data-table');
      while (table.rows.length > 1) {
        table.deleteRow(1);
      }

      data.forEach((submission, index) => {
        const row = table.insertRow();
        // Assume the first cell is for indexing
        row.insertCell().textContent = index + 1;
        row.insertCell().textContent = submission.firstName || '';
        row.insertCell().textContent = submission.lastName || '';
        row.insertCell().textContent = submission.contactEmail || '';
        row.insertCell().textContent = submission.phoneNumber || '';
        row.insertCell().textContent = submission.orgName || '';
        row.insertCell().textContent = submission.orgAddress || '';
        row.insertCell().textContent = submission.orgCity || '';
        row.insertCell().textContent = submission.orgState || '';
        row.insertCell().textContent = submission.resources || '';
        row.insertCell().textContent = submission.addInformation || '';

        const actionsCell = row.insertCell();
        if (submission.isOwner) {
          actionsCell.innerHTML = `<button onclick="editItem('${submission._id}')">Edit</button> <button onclick="deleteItem('${submission._id}')">Delete</button>`;
        } else {
          actionsCell.textContent = ''; // Empty for non-owners
        }
      });
    })
    .catch(err => console.error('Error fetching data:', err));
}


  function populateStates() {
    fetch('/unique-states')
      .then(response => response.json())
      .then(states => {
        const stateSelect = document.getElementById('stateFilter');
        stateSelect.innerHTML = '<option value="">Select State</option>';
        states.forEach(state => {
          const option = new Option(state, state);
          stateSelect.appendChild(option);
        });
      })
      .catch(err => console.error('Error fetching states:', err));
  }
  
  // Trigger population of states on page load
  populateStates();
  
  // Event listener to populate cities based on selected state
  document.getElementById('stateFilter').addEventListener('change', function() {
    const state = this.value;
    fetch(`/unique-cities?state=${encodeURIComponent(state)}`)
      .then(response => response.json())
      .then(cities => {
        const citySelect = document.getElementById('cityFilter');
        citySelect.innerHTML = '<option value="">Select City</option>';
        cities.forEach(city => {
          const option = new Option(city, city);
          citySelect.appendChild(option);
        });
      })
      .catch(err => console.error('Error fetching cities:', err));
  });

  document.addEventListener('DOMContentLoaded', applyFilters); // Apply filters on page load as well
  
