document.addEventListener('DOMContentLoaded', () => {
  fetchProfile(); // Fetch profile data on page load

  const uploadForm = document.getElementById('uploadForm');
  if (uploadForm) {
    uploadForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const formData = new FormData(this); // 'this' refers to the form
      fetch('/upload-profile-picture', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })
      .then(response => response.json())
      .then(data => {
        console.log('Upload success:', data);
        fetchProfile(); // Refresh profile data
      })
      .catch(error => console.error('Upload error:', error));
    });
  }

  const editBioBtn = document.getElementById('editBioBtn');
  if (editBioBtn) {
    editBioBtn.addEventListener('click', () => {
      document.getElementById('editBioForm').style.display = 'block';
    });
  }

  const editBioForm = document.getElementById('editBioForm');
  if (editBioForm) {
    editBioForm.addEventListener('submit', function(e) {
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
  }

  const searchUserForm = document.getElementById('searchUserForm');
  if (searchUserForm) {
    searchUserForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const username = document.getElementById('usernameSearch').value;
      searchUsers(username); // Call the searchUsers function with the username
    });
  }
});

function fetchProfile() {
  fetch('/get-user-profile', { credentials: 'include' })
  .then(response => response.json())
  .then(updatePageWithProfileData) // Make sure this is properly invoking your function
  .catch(error => console.error('Error fetching profile:', error));
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


function followUser(userId) {
  fetch(`/follow-user/${userId}`, { method: 'POST', credentials: 'include' })
  .then(response => response.json())
  .then(data => {
      if (data.message === 'Followed successfully') {
          updateFollowingCountDirectly(data.currentUserFollowingCount);
          updateFollowerCountDirectly(data.targetUserFollowerCount);
          // Dynamic button update
          document.querySelectorAll(`button[data-user-id="${userId}"]`).forEach(btn => {
              btn.textContent = 'Unfollow';
              btn.onclick = () => unfollowUser(userId);
          });
      } else {
          console.log(data.message);
      }
  })
  .catch(error => console.error('Error following user:', error));
}

function unfollowUser(userId) {
  fetch(`/unfollow-user/${userId}`, { method: 'POST', credentials: 'include' })
  .then(response => response.json())
  .then(data => {
      if (data.message === 'Unfollowed successfully') {
          updateFollowingCountDirectly(data.currentUserFollowingCount);
          updateFollowerCountDirectly(data.targetUserFollowerCount);
          // Dynamic button update
          document.querySelectorAll(`button[data-user-id="${userId}"]`).forEach(btn => {
              btn.textContent = 'Follow';
              btn.onclick = () => followUser(userId);
          });
      } else {
          console.error(data.message);
      }
  })
  .catch(error => console.error('Error unfollowing user:', error));
}



function updateFollowerCountDirectly(newCount) {
  const followerCountElement = document.getElementById('followerCount');
  if (followerCountElement) {
    followerCountElement.textContent = `Followers: ${newCount}`;
  }
}

function updateFollowingCountDirectly(newCount) {
  const followingCountElement = document.getElementById('followingCount');
  if (followingCountElement) {
    followingCountElement.textContent = `Following: ${newCount}`;
  }
}



function updatePageWithProfileData(data) {
  const profilePicture = document.getElementById('profilePicture');
  const bio = document.getElementById('bio');
  const followingCountElement = document.getElementById('followingCount');
  const followerCountElement = document.getElementById('followerCount');

  if(profilePicture) profilePicture.src = data.profilePicture || './default-profile.png';
  if(bio) bio.textContent = data.bio || 'No bio set.';
  if(followingCountElement) followingCountElement.textContent = `Following: ${data.following ? data.following.length : 0}`;
  if(followerCountElement) followerCountElement.textContent = `Followers: ${data.followers ? data.followers.length : 0}`;
}
