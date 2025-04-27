document.addEventListener('DOMContentLoaded', async () => {
    try {
        const settings = await fetch('/src/settings.json').then(res => res.json());
        if (settings.maintenance) {
            window.location.href = '/maintenance.html';
        }
    } catch (err) {
        console.error('Error loading settings:', err);
    }
});
