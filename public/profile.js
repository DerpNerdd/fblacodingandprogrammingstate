document.addEventListener('DOMContentLoaded', () => {
  fetchProfile(); // Fetch and display profile data on page load
  loadUserSubmissions();

  document.getElementById('editProfileBtn').addEventListener('click', () => {
      const editSection = document.getElementById('editProfileSection');
      editSection.style.display = editSection.style.display === 'block' ? 'none' : 'block';
  }); // Added missing closing bracket here

  // Event listener for profile picture upload
  document.getElementById('uploadForm').addEventListener('submit', function(e) {
      e.preventDefault();
      const formData = new FormData(this);
      fetch('/upload-profile-picture', {
          method: 'POST',
          body: formData,
          credentials: 'include',
      })
      .then(response => response.json())
      .then(data => {
          alert('Profile picture updated successfully.');
          fetchProfile(); // Refresh profile data
      })
      .catch(error => console.error('Error:', error));
  });

  // Event listener for bio update
  document.getElementById('editBioForm').addEventListener('submit', function(e) {
      e.preventDefault();
      const bio = document.getElementById('bioText').value;
      fetch('/update-bio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bio }),
          credentials: 'include',
      })
      .then(response => response.json())
      .then(data => {
          alert('Bio updated successfully.');
          fetchProfile(); // Refresh profile data
      })
      .catch(error => console.error('Error:', error));
  });
});

function fetchProfile() {
  fetch('/get-user-profile', { credentials: 'include' })
  .then(response => response.json())
  .then(data => {
      const profilePicture = document.getElementById('profilePicture');
      const bio = document.getElementById('bio');
      const email = document.getElementById('email');
      const userName = document.getElementById('userName');

      profilePicture.src = data.profilePicture || './default-profile.png';
      bio.textContent = data.bio || 'No bio set.';
      email.textContent = `Email: ${data.email}`;
      userName.textContent = data.username; // Display actual username
  })
  .catch(error => console.error('Error fetching profile:', error));
}

document.querySelector('.file-input-button').addEventListener('click', function() {
  document.getElementById('profileImage').click();
});

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('editProfileBtn').addEventListener('click', () => {
    const section = document.getElementById('editProfileSection');
    section.classList.toggle('open');
  });
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