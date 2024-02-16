document.addEventListener('DOMContentLoaded', function() {
    fetch('/get-partner-info')
        .then(response => response.json())
        .then(data => {
            const table = document.getElementById('data-table');
            data.forEach(item => {
                const row = table.insertRow();
                Object.values(item).forEach(text => {
                    const cell = row.insertCell();
                    cell.textContent = text;
                });
            });
        })
        .catch(err => console.error('Error fetching data: ', err));
});
