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

document.getElementById('signupButton').addEventListener('click', function() {
    const username = document.querySelector('input[name="username"]').value;
    const password = document.querySelector('input[name="password"]').value;
    const confirmPassword = document.querySelector('input[name="confirmPassword"]').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match.');
        return;
    }

    // Assuming you have a route set up to handle POST requests to '/signup'
    fetch('/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(response => {
        if (response.ok) {
            window.location.href = '/index.html';
        } else {
            alert('Failed to create an account. Please try again.');
        }
    })
    .catch(error => console.error('Error:', error));
});
