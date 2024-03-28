document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const itemId = urlParams.get('itemId');

    function fetchItemData() {
        fetch(`/get-partner-info/${itemId}`, { credentials: 'include' }) // Adjust the endpoint as needed
            .then(response => response.json())
            .then(data => {
                // Populate form fields with existing data
                document.getElementById('firstName').value = data.firstName;
                document.getElementById('lastName').value = data.lastName;
                document.getElementById('contactEmail').value = data.contactEmail;
                document.getElementById('phoneNumber').value = data.phoneNumber;
                document.getElementById('orgName').value = data.orgName;
                document.getElementById('orgAddress').value = data.orgAddress;
                document.getElementById('orgCity').value = data.orgCity;
                document.getElementById('orgState').value = data.orgState;
                document.getElementById('resources').value = data.resources;
                document.getElementById('addInformation').value = data.addInformation;

                // Repeat for other fields
            })
            .catch(err => console.error('Error fetching item data:', err));
    }

    document.getElementById('editPartnerForm').addEventListener('submit', function(e) {
        e.preventDefault();

        // Validation: Check if any of the form fields are empty
        const formData = new FormData(this);
        const updatedData = Object.fromEntries(formData.entries());
        const areAllFieldsFilled = Array.from(formData.values()).every(value => value.trim() !== '');

        if (!areAllFieldsFilled) {
            alert('Please fill out all fields before submitting.');
            return; // Stop the function from proceeding
        }

        // Proceed with submitting form data if validation passes
        fetch(`/edit-partner-info/${itemId}`, {
            method: 'PUT', // or 'PATCH'
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData),
            credentials: 'include',
        })
        .then(response => {
            if(response.ok) {
                alert('Data updated successfully');
                window.location.href = '/view-data.html'; // Redirect after successful update
            } else {
                alert('Failed to update data');
            }
        })
        .catch(error => {
            console.error('Error updating data:', error);
            alert('Error updating data. Please try again.');
        });
    });

    fetchItemData();
});
