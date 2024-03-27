document.addEventListener("DOMContentLoaded", () => {
    console.log('Document loaded');
    fetch('/user-info')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('User info:', data);
            if (data.username) {
                document.getElementById('user-info').textContent = `Welcome, ${data.username}!`;
                document.getElementById('logout-btn').style.display = 'block';
                document.getElementById('login-btn').style.display = 'none';
                document.getElementById('register-btn').style.display = 'none';
            } else {
                document.getElementById('login-btn').style.display = 'block';
                document.getElementById('register-btn').style.display = 'block';
                document.getElementById('logout-btn').style.display = 'none';
            }
        })
        .catch(error => console.error('Error fetching user info:', error));
});



function logout() {
    fetch('/logout')
        .then(() => {
            window.location.href = '/';
        });
}


document.getElementById('partnerForm').addEventListener('submit', function(e) {
e.preventDefault(); // Prevent the default form submission

const formData = new FormData(this);
const data = Object.fromEntries(formData.entries());

fetch('/submit-partner-info', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify(data)
})
.then(response => {
if(response.ok) {
return response.json(); // Make sure the server sends back JSON
} else {
throw new Error('Failed to submit data');
}
})
.then(data => {
alert('Data submitted successfully');
// Optionally, call a function to refresh the data view
})
.catch(error => {
console.error('Submission error:', error);
alert('Error submitting data');
});
});
