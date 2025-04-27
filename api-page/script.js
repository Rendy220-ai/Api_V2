// === Loading Screen ===
document.addEventListener('DOMContentLoaded', async () => {
    const loadingScreen = document.getElementById("loadingScreen");
    document.body.classList.add("no-scroll");

    try {
        const settings = await fetch('/src/settings.json').then(res => res.json());

        // === Maintenance Check ===
        if (settings.maintenance) {
            showMaintenanceMode();
            throw new Error('Maintenance mode active.');
        }

        // Normal Loading
        const setContent = (id, property, value) => {
            const el = document.getElementById(id);
            if (el) el[property] = value;
        };

        setContent('page', 'textContent', settings.name || "FR3 UI");
        setContent('wm', 'textContent', `© 2025 ${settings.apiSettings?.creator || "FR3"}`);
        setContent('header', 'textContent', settings.name || "FR3 UI");
        setContent('name', 'textContent', settings.name || "FR3 UI");
        setContent('version', 'textContent', settings.version || "v1.0");
        setContent('versionHeader', 'textContent', settings.header?.status || "Active!");
        setContent('description', 'textContent', settings.description || "Simple API's");

        const apiContent = document.getElementById('apiContent');
        settings.categories?.forEach(category => {
            const sortedItems = category.items.sort((a, b) => a.name.localeCompare(b.name));
            const categoryHTML = sortedItems.map(item => `
                <div class="col-md-6 col-lg-4 api-item" data-name="${item.name}" data-desc="${item.desc}">
                    <div class="hero-section d-flex align-items-center justify-content-between" style="height: 80px;">
                        <div>
                            <h5 class="mb-1" style="font-size: 16px;">${item.name}</h5>
                            <p class="text-muted mb-1" style="font-size: 0.8rem;">${item.desc}</p>
                        </div>
                        <button class="btn btn-dark btn-sm get-api-btn" data-api-path="${item.path}" data-api-name="${item.name}" data-api-desc="${item.desc}">
                            GET
                        </button>
                    </div>
                </div>
            `).join('');
            apiContent.insertAdjacentHTML('beforeend', `<div class="row">${categoryHTML}</div>`);
        });

        const searchInput = document.getElementById('searchInput');
        searchInput?.addEventListener('input', () => {
            const term = searchInput.value.toLowerCase();
            document.querySelectorAll('.api-item').forEach(item => {
                const name = item.dataset.name.toLowerCase();
                const desc = item.dataset.desc.toLowerCase();
                item.style.display = (name.includes(term) || desc.includes(term)) ? '' : 'none';
            });
        });

    } catch (error) {
        console.error(error.message);
    } finally {
        setTimeout(() => {
            if (loadingScreen) loadingScreen.style.display = "none";
            document.body.classList.remove("no-scroll");
        }, 1000);
    }
});

// === Function Show Maintenance ===
function showMaintenanceMode() {
    document.getElementById('content').innerHTML = `
        <div style="min-height:80vh; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center;">
            <h1 class="shimmer" style="font-size: 2.5rem; color: #007bff;">Maintenance Mode</h1>
            <p style="font-size: 1.2rem; color: #555;">We are currently improving our services.<br>Please come back later!</p>
        </div>
    `;
}

// === API Modal Handling (Optional, kalau kamu butuh modal GET API) ===
// (bisa disisipkan seperti biasa, kalau mau saya sekalian buatkan final lagi)
