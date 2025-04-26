document.addEventListener('DOMContentLoaded', async () => {
    const loadingScreen = document.getElementById("loadingScreen");
    const body = document.body;
    body.classList.add("no-scroll");

    try {
        const settings = await fetch('/src/settings.json').then(res => res.json());

        const setContent = (id, property, value) => {
            const element = document.getElementById(id);
            if (element) element[property] = value;
        };

        setContent('page', 'textContent', settings.name || "FR3 UI");
        setContent('wm', 'textContent', `© 2025 ${settings.apiSettings.creator}. All rights reserved.` || "© 2025 FR3. All rights reserved.");
        setContent('header', 'textContent', settings.name || "FR3 UI");
        setContent('name', 'textContent', settings.name || "FR3 UI");
        setContent('version', 'textContent', settings.version || "v1.0");
        setContent('versionHeader', 'textContent', settings.header.status || "Active!");
        setContent('description', 'textContent', settings.description || "Simple API's");

        const apiContent = document.getElementById('apiContent');

        settings.categories.forEach((category) => {
            const sortedItems = category.items.sort((a, b) => a.name.localeCompare(b.name));

            const categoryContent = sortedItems.map((item, index, array) => {
                const isLastItem = index === array.length - 1;
                const itemClass = `col-md-6 col-lg-4 api-item ${isLastItem ? 'mb-4' : 'mb-2'}`;
                return `
                    <div class="${itemClass}" data-name="${item.name}" data-desc="${item.desc}" style="animation: fadeIn 0.5s ease forwards;">
                        <div class="hero-section d-flex align-items-center justify-content-between" style="height: 70px;">
                            <div class="api-label-wrapper">
                                <h5 class="mb-0" style="font-size: 16px;">${item.name}</h5>
                                <p class="text-muted mb-0" style="font-size: 0.8rem;">${item.desc}</p>
                            </div>
                            <div class="connector-line"></div>
                            <button class="btn btn-dark btn-sm get-api-btn" data-api-path="${item.path}" data-api-name="${item.name}" data-api-desc="${item.desc}">
                                GET
                            </button>
                        </div>
                    </div>
                `;
            }).join('');

            apiContent.insertAdjacentHTML('beforeend', `<div class="row">${categoryContent}</div>`);
        });

        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.toLowerCase();
            const apiItems = document.querySelectorAll('.api-item');

            apiItems.forEach(item => {
                const name = item.getAttribute('data-name').toLowerCase();
                const desc = item.getAttribute('data-desc').toLowerCase();
                item.style.display = (name.includes(searchTerm) || desc.includes(searchTerm)) ? '' : 'none';
            });
        });

    } catch (error) {
        console.error('Error loading settings:', error);
    } finally {
        setTimeout(() => {
            loadingScreen.style.display = "none";
            body.classList.remove("no-scroll");
        }, 2000);
    }
});
