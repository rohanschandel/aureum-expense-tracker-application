document.addEventListener('DOMContentLoaded', () => {
    const signinBlock = document.getElementById('signin-block');
    const signupBlock = document.getElementById('signup-block');
    const toSignupBtn = document.getElementById('to-signup-trigger');
    const toSigninBtn = document.getElementById('to-signin-trigger');

    // UI Tab Toggle Logic
    if (toSignupBtn && toSigninBtn) {
        toSignupBtn.addEventListener('click', (e) => {
            e.preventDefault();
            signinBlock.classList.add('opacity-0', 'scale-95');
            setTimeout(() => {
                signinBlock.classList.add('hidden');
                signupBlock.classList.remove('hidden');
                setTimeout(() => signupBlock.classList.remove('opacity-0', 'scale-95'), 20);
            }, 350);
        });

        toSigninBtn.addEventListener('click', (e) => {
            e.preventDefault();
            signupBlock.classList.add('opacity-0', 'scale-95');
            setTimeout(() => {
                signupBlock.classList.add('hidden');
                signinBlock.classList.remove('hidden');
                setTimeout(() => signinBlock.classList.remove('opacity-0', 'scale-95'), 20);
            }, 350);
        });
    }

    // 🔥 FORTIFIED GLOBAL DELEGATION EVENT LISTENER: Catches submission perfectly on all views
    document.addEventListener('submit', async (e) => {
        const targetForm = e.target;
        
        // Match the submit routes explicitly
        if (targetForm.id === 'login-form' || targetForm.id === 'signup-form') {
            e.preventDefault(); // Stop URL injection bar parameters instantly
            
            const endpointPath = targetForm.id === 'login-form' ? '/auth/login' : '/auth/signup';
            
            // Extract the secure dataset mapping arrays
            const formData = new FormData(targetForm);
            const dataPayload = Object.fromEntries(formData.entries());

            try {
                const response = await fetch(endpointPath, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dataPayload)
                });

                const result = await response.json();

                if (result.success && result.redirectUrl) {
                    window.location.href = result.redirectUrl; // Redirect smoothly to dashboard.html
                } else {
                    alert(result.message || "Credential configuration rejected.");
                }
            } catch (err) {
                console.error("Transmission Exception:", err);
                alert("Authentication engine communication fault.");
            }
        }
    });
});