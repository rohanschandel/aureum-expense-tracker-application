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

    // Submission Handler matching backend JSON responses
    const handleFormSubmit = (formId, endpointPath) => {
        const formElement = document.getElementById(formId);
        if (!formElement) return;

        formElement.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(formElement);
            const dataPayload = Object.fromEntries(formData.entries());

            try {
                const response = await fetch(endpointPath, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dataPayload)
                });

                const result = await response.json();

                if (result.success && result.redirectUrl) {
                    window.location.href = result.redirectUrl;
                } else {
                    alert(result.message || "Credential configuration rejected.");
                }
            } catch (err) {
                alert("Gateway communication blackout.");
            }
        });
    };

    handleFormSubmit('login-form', '/auth/login');
    handleFormSubmit('signup-form', '/auth/signup');
});