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


app.post('/follow-user/:userId', async (req, res) => {
    if (!req.isAuthenticated()) return res.status(403).send('Not authenticated');
  
    try {
      const userToFollow = await User.findById(req.params.userId);
      const currentUser = await User.findById(req.user._id);
  
      if (!userToFollow.followers.includes(req.user._id)) {
        userToFollow.followers.push(req.user._id);
        currentUser.following.push(req.params.userId);
  
        await userToFollow.save();
        await currentUser.save();
  
        res.send({ message: 'User followed successfully.' });
      } else {
        res.status(400).send('Already following this user.');
      }
    } catch (error) {
      console.error('Error following user:', error);
      res.status(500).send('Error following user');
    }
  });
  
  app.post('/unfollow-user/:userId', async (req, res) => {
    if (!req.isAuthenticated()) return res.status(403).send('Not authenticated');
  
    try {
      const userToUnfollow = await User.findById(req.params.userId);
      const currentUser = await User.findById(req.user._id);
  
      userToUnfollow.followers = userToUnfollow.followers.filter(followerId => followerId.toString() !== req.user._id.toString());
      currentUser.following = currentUser.following.filter(followingId => followingId.toString() !== req.params.userId.toString());
  
      await userToUnfollow.save();
      await currentUser.save();
  
      res.send({ message: 'User unfollowed successfully.' });
    } catch (error) {
      console.error('Error unfollowing user:', error);
      res.status(500).send('Error unfollowing user');
    }
  });
  