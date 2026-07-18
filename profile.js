document.addEventListener('DOMContentLoaded', () => {
    const profileForm = document.getElementById('profile-update-form');

    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(profileForm);
            const dataPayload = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('/api/profile/update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dataPayload)
                });

                const result = await response.json();
                if (result.success) {
                    alert('Vault identity configurations modified successfully.');
                    window.location.reload(); // Repaints layout components with newest metadata parameters cleanly
                } else {
                    alert('Signature mutation rejected by database arrays.');
                }
            } catch (err) {
                alert('Communication breakdown with remote data routing hubs.');
            }
        });
    }
});