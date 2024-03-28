document.addEventListener("DOMContentLoaded", function() {
    const section = document.getElementById("dynamicBackground");
    const numberOfSpans = 150; // Adjust the number of spans you want to generate

    for (let i = 0; i < numberOfSpans; i++) {
        const span = document.createElement("span");
        section.appendChild(span);

        span.addEventListener("mouseover", () => {
            span.style.transition = "0s";
            span.style.background = "#3c0568";
        });

        span.addEventListener("mouseout", () => {
            span.style.transition = "1.5s";
            span.style.background = "#181818";
        });
    }
});
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.querySelector('input[name="username"]').value;
    const password = document.querySelector('input[name="password"]').value;

    fetch('/logintest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json()) // Assuming the server responds with JSON
    .then(data => {
        if (data.isAuthenticated) {
            window.location.href = '/dashboard.html';
        } else {
            // Dynamically create or show an error message element
            alert(data.message || 'Invalid username or password. Please try again.'); // Replace alert with dynamic error display
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again later.');
    });
});

