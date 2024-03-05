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

document.getElementById('loginButton').addEventListener('click', function() {
    const username = document.querySelector('input[name="username"]').value;
    const password = document.querySelector('input[name="password"]').value;

    // Assuming you have a route set up to handle POST requests to '/login'
    fetch('/logintest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(response => {
        if (response.ok) {
            window.location.href = '/dashboard.html';
        } else if (response.status === 401) {
            alert('Invalid username or password. Please try again.');
        } else {
            alert('An error occurred. Please try again later.');
        }
    })
    .catch(error => console.error('Error:', error));
    
});
