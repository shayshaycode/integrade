const signupForm = document.getElementById('signup-form');
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(signupForm);
    try {
      const res = await fetch('includes/register.php', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = 'login.html';
      } else {
        alert(data.error || 'Sign up failed');
      }
    } catch (err) {
      console.error('Signup error', err);
      alert('Signup request failed');
    }
  });
}
