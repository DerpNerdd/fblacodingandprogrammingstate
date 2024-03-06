document.addEventListener("DOMContentLoaded", function() {
    // Dynamically generate background spans
    const section = document.getElementById("dynamicBackground");
    const numberOfSpans = 150;
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

    // Handle signup form submission
    document.getElementById('signupButton').addEventListener('click', async (e) => {
      e.preventDefault(); // Prevent the default form submission

      const formData = new FormData(signupForm);
      const data = Object.fromEntries(formData.entries());

      if (data.password !== data.confirmPassword) {
          alert('Passwords do not match.');
          return;
      }

      try {
          const response = await fetch('/signup', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
          });

          if (response.ok) {
              alert('Signup successful');
              window.location.href = '/index.html'; // Redirect on success
          } else {
              const errorText = await response.text();
              alert(`Signup failed: ${errorText}`);
          }
      } catch (error) {
          console.error('Signup error:', error);
          alert('Signup failed. Please try again.');
      }
  });
});