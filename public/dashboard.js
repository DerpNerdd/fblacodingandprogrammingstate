document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menu-toggle');
    const closeNav = document.getElementById('close-nav');
    const sideNav = document.querySelector('.side-navbar');
    const themeToggle = document.getElementById('theme-toggle');
  
    if (menuToggle && sideNav) {
      menuToggle.addEventListener('click', () => {
        sideNav.classList.add('active');
      });
    }
  
    if (closeNav && sideNav) {
      closeNav.addEventListener('click', () => {
        sideNav.classList.remove('active');
      });
    }
  
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
      });
    }

    function loadUserProfile() {
        fetch('/api/current-user')
          .then(response => response.json())
          .then(user => {
            const profilePicElement = document.getElementById('profile-pic');
            profilePicElement.src = user.profilePicture; // Use the path as provided by the server
            profilePicElement.alt = `${user.username}'s Profile Picture`;
          })
          .catch(error => console.error('Error fetching user data:', error));
    }
    
    // Call the function to load the user's profile picture
    loadUserProfile();
    
    
    const searchForm = document.getElementById('search-form');
    searchForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const query = document.getElementById('search-input').value;
        fetchSearchResults(query);


        const searchForm = document.getElementById('search-form');
  
        searchForm.addEventListener('submit', function(event) {
          event.preventDefault(); // Prevent the default form submit action
          const query = document.getElementById('search-input').value;
          const searchUrl = `view-data.html?query=${encodeURIComponent(query)}`;
          window.location.href = searchUrl; // Redirect to the search results page
        });

        
    });
    displayWelcomeMessage();
    loadUserStats();
    loadSubmissionChart();
    loadLearningResources();

    loadUserSubmissions();


});

function fetchSearchResults(query) {
    fetch(`/api/search?query=${encodeURIComponent(query)}`, { credentials: 'include' })
        .then(response => response.json())
        .then(data => {
            console.log(data); // Process and display your search results
            // For instance, update the DOM with search results
        })
        .catch(error => console.error('Search error:', error));
}

document.addEventListener('DOMContentLoaded', (event) => {
  const sidebar = document.getElementById('dashboard-sidebar');
  const offsetTopNav = 50; // Height of the top navbar

  function onScroll() {
    // When the top of the viewport reaches the bottom of the navbar
    if (window.pageYOffset > offsetTopNav) {
      // Stick the sidebar to the top of the viewport
      sidebar.style.position = 'fixed';
      sidebar.style.top = '0';
    } else {
      // Return the sidebar to its original position below the navbar
      sidebar.style.position = 'absolute';
      sidebar.style.top = '50px';
    }
  }

  window.addEventListener('scroll', onScroll);
});

function loadUserSubmissions() {
  fetch('/api/my-submissions', { credentials: 'include' })
    .then(response => response.json())
    .then(submissions => {
      const submissionsList = document.querySelector('.submission-list ul');
      submissionsList.innerHTML = '';
      
      submissions.forEach(submission => {
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = '/view-data.html'; // Change this to the appropriate link if needed
        link.textContent = `${submission.user.username}/${submission.orgName}`;
        listItem.appendChild(link);
        submissionsList.appendChild(listItem);
      });
    })
    .catch(error => console.error('Error loading submissions:', error));
}

function loadRecentSubmissions() {
  fetch('/api/recent-submissions', { credentials: 'include' })
  .then(response => response.json())
  .then(data => {
      const tableBody = document.getElementById('dashboard-data-table').querySelector('tbody');
      tableBody.innerHTML = ''; // Clear existing rows
      
      // Add new rows from fetched data
      data.forEach((submission, index) => {
          const row = tableBody.insertRow();
          row.insertCell(0).textContent = submission.firstName;
          row.insertCell(1).textContent = submission.lastName;
          row.insertCell(2).textContent = submission.orgName;
          row.insertCell(3).textContent = submission.orgCity;
          row.insertCell(4).textContent = submission.orgState;
          // More cells as per your data
      });
  })
  .catch(err => console.error('Error loading recent submissions:', err));
}

// Call this function when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  loadRecentSubmissions();
  // ... other initialization code ...
});

function displayWelcomeMessage() {
  const welcomeMessage = document.getElementById('welcome-message');
  const now = new Date();
  const hours = now.getHours();
  let message = "Welcome back! Here's what's new...";

  if (hours < 12) {
      message = "Good morning! Here's what's new...";
  } else if (hours < 18) {
      message = "Good afternoon! Here's what's new...";
  } else {
      message = "Good evening! Here's what's new...";
  }

  welcomeMessage.textContent = message;
}

function loadUserStats() {
  fetch('/api/user-stats', { credentials: 'include' })
      .then(response => response.json())
      .then(stats => {
          document.getElementById('total-submissions').textContent = stats.totalSubmissions;
          document.getElementById('most-active-month').textContent = stats.mostActiveMonth;
      })
      .catch(error => console.error('Error loading user stats:', error));
}

function loadSubmissionChart() {
  fetch('/api/submission-trends', { credentials: 'include' })
      .then(response => response.json())
      .then(data => {
          const ctx = document.getElementById('submissionChart').getContext('2d');
          const submissionChart = new Chart(ctx, {
            type: 'line', // Change this as needed
            data: {
                labels: data.labels, // Your labels array
                datasets: [{
                    label: 'Submissions',
                    data: data.values, // Your data array
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                aspectRatio: 3, // Adjust this value as needed to control height
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
      })
      .catch(error => console.error('Error loading chart:', error));
}


function loadLearningResources() {
  fetch('/api/learning-resources')
    .then(response => response.json())
    .then(resources => {
      const resourcesListElement = document.querySelector('.resources-list');
      resourcesListElement.innerHTML = ''; // Clear existing content
      resources.forEach(resource => {
        const resourceElement = document.createElement('div');
        resourceElement.className = 'resource';
        resourceElement.innerHTML = `
          <h3><a href="${resource.url}" target="_blank">${resource.title}</a></h3>
          <p>${resource.description}</p>
        `;
        resourcesListElement.appendChild(resourceElement);
      });
    })
    .catch(error => console.error('Error loading learning resources:', error));
}

// Call the function when the document is loaded
document.addEventListener('DOMContentLoaded', loadLearningResources);

