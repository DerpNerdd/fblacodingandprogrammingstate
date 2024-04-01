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
    });
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
