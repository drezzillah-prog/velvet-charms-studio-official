(() => {
  'use strict';
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contact-form');
    const status = document.getElementById('contact-status');
    if (!form || !status) return;
    form.addEventListener('submit', async event => {
      event.preventDefault();
      const button = form.querySelector('button[type="submit"]');
      const payload = Object.fromEntries(new FormData(form).entries());
      button.disabled = true;
      status.textContent = 'Sending…';
      try {
        const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || 'Your message could not be sent.');
        form.reset();
        status.textContent = 'Message sent. Thank you.';
      } catch (error) {
        status.textContent = error.message || 'Your message could not be sent.';
      } finally {
        button.disabled = false;
      }
    });
  });
})();
