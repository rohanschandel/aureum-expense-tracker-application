document.addEventListener('DOMContentLoaded', () => {
    const signinBlock = document.getElementById('signin-block');
    const signupBlock = document.getElementById('signup-block');
    const toSignupBtn = document.getElementById('to-signup-trigger');
    const toSigninBtn = document.getElementById('to-signin-trigger');

    // UI View Toggle Transitions
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

    // Capture submissions globally via Document Event Delegation
    document.addEventListener('submit', async (e) => {
        const targetForm = e.target;
        
        if (targetForm.id === 'login-form' || targetForm.id === 'signup-form') {
            e.preventDefault(); // Stop native HTML browser parameters reloading into the URL bar
            
            const endpointPath = targetForm.id === 'login-form' ? '/auth/login' : '/auth/signup';
            
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
                    // Force the browser directly into the target dashboard EJS endpoint matrix
                    window.location.href = result.redirectUrl; 
                } else {
                    alert(result.message || "Authentication rejected.");
                }
            } catch (err) {
                console.error("Transmission error:", err);
                alert("Authentication engine communication fault.");
            }
        }
    });
});