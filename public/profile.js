document.addEventListener('DOMContentLoaded', () => {
    // Assume fetchProfile is a function that fetches and updates the UI with profile data
    fetchProfile();

    document.getElementById('uploadForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData();
        const image = document.getElementById('profileImage').files[0];
        formData.append('profileImage', image);

        fetch('/upload-profile-picture', {
            method: 'POST',
            body: formData,
            credentials: 'include',
        })
        .then(() => fetchProfile()) // Refresh profile info after image upload
        .catch(error => console.error('Error:', error));
    });

    document.getElementById('editBioBtn').addEventListener('click', () => {
        document.getElementById('editBioForm').style.display = 'block';
    });

    document.getElementById('editBioForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const bio = document.getElementById('bioText').value;

        fetch('/update-bio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bio }),
            credentials: 'include',
        })
        .then(() => {
            fetchProfile(); // Refresh profile info after bio update
            document.getElementById('editBioForm').style.display = 'none';
        })
        .catch(error => console.error('Error:', error));
    });
});

function fetchProfile() {
    fetch('/get-user-profile', { credentials: 'include' })
    .then(response => response.json())
    .then(data => {
        document.getElementById('profilePicture').src = data.profilePicture || './default-profile.png'; // Fallback to a default image
        document.getElementById('bio').textContent = data.bio || 'No bio set.';
        // Include additional UI updates here for followers, following, etc.
    })
    .catch(error => console.error('Error:', error));
}

function searchUsers(username) {
  fetch(`/search-users?username=${encodeURIComponent(username)}`, { 
    method: 'GET',
    credentials: 'include', // For sending cookies with the request
  })
  .then(response => response.json())
  .then(data => {
    const resultsContainer = document.getElementById('searchResults');
    resultsContainer.innerHTML = ''; // Clear previous results

    data.forEach(user => {
      const userElement = document.createElement('div');
      userElement.innerHTML = `
        <span>${user.username}</span>
        <button onclick="followUser('${user._id}')">Follow</button>
        <button onclick="unfollowUser('${user._id}')">Unfollow</button>
        <a href="/profile/${user.username}">View Profile</a>
      `;
      resultsContainer.appendChild(userElement);
    });
  })
  .catch(error => console.error('Error fetching search results:', error));
}


// Add event listener for form submission
document.getElementById('searchUserForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const username = document.getElementById('usernameSearch').value;
  searchUsers(username); // Call the searchUsers function with the username
});

// Use separate functions for updating follower and following counts
function updateFollowingCount(increment) {
  const followingCountElement = document.getElementById('followingCount');
  if (followingCountElement) {
      let followingCount = parseInt(followingCountElement.innerText) || 0;
      followingCount += increment;
      followingCountElement.innerText = followingCount.toString();
  } else {
      console.error('Following count element not found.');
  }
}

function followUser(userId) {
  fetch(`/follow-user/${userId}`, {
      method: 'POST',
      credentials: 'include',
  })
  .then(response => {
      if (!response.ok) {
          throw new Error('Response not OK');
      }
      return response.json();
  })
  .then(data => {
      console.log(data.message);
      if (data.message === 'Followed successfully') {
          updateFollowingCount(1); // Update following count when you follow someone
      } else {
          console.log(data.message); // Handle other messages like "Already following"
      }
  })
  .catch(error => console.error('Error following user:', error));
}

function unfollowUser(userId) {
  fetch(`/unfollow-user/${userId}`, {
      method: 'POST',
      credentials: 'include',
  })
  .then(response => {
      if (!response.ok) {
          throw new Error('Response not OK');
      }
      return response.json();
  })
  .then(data => {
      if (data.message === 'Unfollowed successfully') {
          updateFollowingCount(-1); // Decrement following count when you unfollow someone
      } else {
          console.error(data.message); // Handle potential errors or other messages
      }
  })
  .catch(error => console.error('Error unfollowing user:', error));
}
