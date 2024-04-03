document.addEventListener("DOMContentLoaded", () => {
    loadUserSubmissions();
    // Check for user information to customize the UI
    fetch('/user-info', {
        credentials: 'include', // Include cookies
    })
    .then(response => response.json())
    .then(data => {
        const logoutBtn = document.getElementById('logout-btn');
        const loginBtn = document.getElementById('login-btn');
        const registerBtn = document.getElementById('register-btn');
        const userInfoDiv = document.getElementById('user-info');

        if (data.username) {
            // User is logged in
            userInfoDiv.textContent = `Welcome, ${data.username}!`;
            logoutBtn.style.display = 'inline'; // Show logout button
            loginBtn.style.display = 'none';    // Hide login button
            registerBtn.style.display = 'none'; // Hide register button
        } else {
            // User is not logged in
            userInfoDiv.textContent = '';
            logoutBtn.style.display = 'none';    // Hide logout button
            loginBtn.style.display = 'inline';   // Show login button
            registerBtn.style.display = 'inline';// Show register button
        }
    })
    .catch(error => console.error('Error:', error));

    document.getElementById('partnerForm').addEventListener('submit', function(e) {
        e.preventDefault(); // Prevent the default form submission behavior
      
        const formData = new FormData(this);
        const data = Object.fromEntries(formData.entries());
      
        // Correctly configured fetch request to send data to the server
        fetch('/submit-partner-info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // Ensure cookies are included with the request
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
          alert(data.message); // Show success message
          // Redirect or perform additional actions upon success
        })
        .catch(error => {
          console.error('Error submitting form:', error);
          alert('Error submitting form. Please try again.');
        });
    });
      
});


function logout() {
    fetch('/logout', {
        method: 'GET',
        credentials: 'include', // Ensure cookies are included to clear the session
    })
    .then(() => {
        window.location.href = '/';
    })
    .catch(error => console.error('Logout error:', error));
}

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