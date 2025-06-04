const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(loginForm);
    try {
      const res = await fetch('includes/login.php', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = 'index.html';
      } else {
        alert('Login failed');
      }
    } catch (err) {
      console.error('Login error', err);
      alert('Login request failed');
    }
  });
}
