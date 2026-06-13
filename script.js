document.getElementById('contact-form').addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent page reload

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;
    const statusText = document.getElementById('form-status');

    statusText.innerText = "Sending...";

    try {
        const response = await fetch('http://localhost:3000/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, message })
        });

        if (response.ok) {
            statusText.innerText = "Message sent successfully!";
            statusText.style.color = "green";
            document.getElementById('contact-form').reset();
        } else {
            statusText.innerText = "Failed to send message.";
            statusText.style.color = "red";
        }
    } catch (error) {
        statusText.innerText = "Server error. Is the backend running?";
        statusText.style.color = "red";
    }
});