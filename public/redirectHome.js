document.addEventListener("DOMContentLoaded", () => {
    // Check the user's login status
    fetch('/user-info', {
        credentials: 'include', // Ensure cookies are included with the request
    })
    .then(response => response.json())
    .then(data => {
        if (data.username) {
            // If the user is logged in, redirect to the dashboard page
            window.location.href = '/dashboard.html'; // Adjust the path as needed
        }
        // If not logged in, do nothing and stay on the current page
    })
    .catch(error => console.error('Error:', error));
});
