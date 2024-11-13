async function fetchMessage() {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/school-name');  // Correct URL to your Flask endpoint
        console.log('API Response Status:', response.status);

        // Check if the response was successful
        if (!response.ok) {
            console.error('API request failed with status:', response.status);
            return;
        }

        const data = await response.json();  // Attempt to parse the response as JSON
        console.log('Full API Response:', data);

        if (data && data.school_name) {
            const school_message = data.school_name;
            console.log('Type of school_message:', typeof school_message);
            console.log('Value of school_message:', school_message);

            // Update the DOM with the school name
            document.querySelector('#school-message').textContent = school_message;
        } else {
            console.log('school_name not found in API response');
        }
    } catch (error) {
        console.error('Error fetching message:', error);
    }
}

fetchMessage();