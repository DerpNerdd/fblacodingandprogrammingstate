document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('changeEmailForm').addEventListener('submit', e => {
        e.preventDefault();
        const newEmail = document.getElementById('newEmail').value;
        sendRequest('/change-email', { newEmail });
    });

    document.getElementById('changeUsernameForm').addEventListener('submit', e => {
        e.preventDefault();
        const newUsername = document.getElementById('newUsername').value;
        sendRequest('/change-username', { newUsername });
    });

    document.getElementById('changePasswordForm').addEventListener('submit', e => {
        e.preventDefault();
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        sendRequest('/change-password', { currentPassword, newPassword });
    });

    document.getElementById('deleteAccountBtn').addEventListener('click', () => {
        const confirmationText = "DELETE MY ACCOUNT";
        let userInput = prompt(`Please type "${confirmationText}" to confirm account deletion:`);
    
        if (userInput === confirmationText) {
            sendRequest('/delete-account', {}, 'DELETE').then(() => {
                alert('Account deleted successfully. Redirecting to home page...');
                window.location.href = '/';
            });
        } else {
            alert('Account deletion cancelled or text did not match.');
        }
    });
    
});

function sendRequest(url, data, method = 'PUT') {
    return fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Request failed');
        }
        return response.json(); // Assuming server responds with JSON
    })
    .then(result => {
        alert(result.message); // Alert the successful message
        if (url === '/change-email' || url === '/delete-account' || url === '/change-username' || url === '/change-password') {
            // For these actions, log the user out by redirecting to the logout route
            window.location.href = '/logout';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Operation failed. Please try again.');
    });
}
