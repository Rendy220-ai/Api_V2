// === Loading Screen ===
document.addEventListener('DOMContentLoaded', async () => {
    const loadingScreen = document.getElementById("loadingScreen");
    const body = document.body;
    body.classList.add("no-scroll");

    try {
        const settings = await fetch('/src/settings.json').then(res => res.json());

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

        const apiLinks = document.getElementById('apiLinks');
        if (apiLinks && Array.isArray(settings.links)) {
            settings.links.forEach(({ url, name }) => {
                const link = document.createElement('a');
                link.href = url;
                link.target = '_blank';
                link.textContent = name;
                link.className = 'lead';
                apiLinks.appendChild(link);
            });
        }

        const apiContent = document.getElementById('apiContent');
        settings.categories?.forEach(category => {
            const sortedItems = category.items.sort((a, b) => a.name.localeCompare(b.name));
            const categoryHTML = sortedItems.map(item => `
                <div class="col-md-6 col-lg-4 api-item" data-name="${item.name}" data-desc="${item.desc}">
                    <div class="hero-section d-flex align-items-center justify-content-between" style="height: 70px;">
                        <div>
                            <h5 class="mb-0" style="font-size: 16px;">${item.name}</h5>
                            <p class="text-muted mb-0" style="font-size: 0.8rem;">${item.desc}</p>
                        </div>
                        <button class="btn btn-dark btn-sm get-api-btn" data-api-path="${item.path}" data-api-name="${item.name}" data-api-desc="${item.desc}">
                            GET
                        </button>
                    </div>
                </div>
            `).join('');
            apiContent.insertAdjacentHTML('beforeend', `<div class="row">${categoryHTML}</div>`);
        });

        // Search API
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
        console.error('Error loading settings:', error);
    } finally {
        setTimeout(() => {
            if (loadingScreen) loadingScreen.style.display = "none";
            body.classList.remove("no-scroll");
        }, 1000);
    }
});

// === API Modal Handling ===
document.addEventListener('click', async event => {
    if (!event.target.classList.contains('get-api-btn')) return;

    const { apiPath, apiName, apiDesc } = event.target.dataset;
    const modal = new bootstrap.Modal(document.getElementById('apiResponseModal'));
    const refs = {
        label: document.getElementById('apiResponseModalLabel'),
        desc: document.getElementById('apiResponseModalDesc'),
        content: document.getElementById('apiResponseContent'),
        endpoint: document.getElementById('apiEndpoint'),
        spinner: document.getElementById('apiResponseLoading'),
        queryInput: document.getElementById('apiQueryInputContainer'),
        submitBtn: document.getElementById('submitQueryBtn')
    };

    refs.label.textContent = apiName;
    refs.desc.textContent = apiDesc;
    refs.content.innerHTML = '';
    refs.endpoint.textContent = '';
    refs.spinner.classList.remove('d-none');
    refs.content.classList.add('d-none');
    refs.queryInput.innerHTML = '';
    refs.submitBtn.classList.add('d-none');

    const baseUrl = `${window.location.origin}${apiPath.split('?')[0]}`;
    const params = new URLSearchParams(apiPath.split('?')[1]);
    if ([...params.keys()].length) {
        const paramDiv = document.createElement('div');
        [...params.keys()].forEach(param => {
            const input = document.createElement('input');
            input.className = 'form-control mb-2';
            input.placeholder = `Input ${param}...`;
            input.dataset.param = param;
            paramDiv.appendChild(input);
        });
        refs.queryInput.appendChild(paramDiv);
        refs.submitBtn.classList.remove('d-none');

        refs.submitBtn.onclick = async () => {
            const inputs = paramDiv.querySelectorAll('input');
            const newParams = new URLSearchParams();
            let validInput = false;
            
            inputs.forEach(input => {
                if (input.value.trim()) {
                    validInput = true;
                    newParams.append(input.dataset.param, input.value.trim());
                }
            });

            if (!validInput) {
                alert('Please fill in the input first!');
                refs.spinner.classList.add('d-none');
                return;
            }

            if ([...newParams.keys()].length) {
                await fetchAPI(`${baseUrl}?${newParams.toString()}`, refs, apiName);
            }
        };
    } else {
        await fetchAPI(apiPath, refs, apiName);
    }

    modal.show();
});

// === Fetch API ===
async function fetchAPI(url, refs, apiName) {
    try {
        refs.spinner.classList.remove('d-none');
        refs.content.innerHTML = '';

        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP Error ${res.status}`);

        const type = res.headers.get('Content-Type');
        if (type?.includes('image/')) {
            const blob = await res.blob();
            const img = document.createElement('img');
            img.src = URL.createObjectURL(blob);
            img.alt = apiName;
            img.style.maxWidth = '100%';
            refs.content.appendChild(img);
        } else {
            const data = await res.json();
            refs.content.textContent = JSON.stringify(data, null, 2);
        }
        refs.endpoint.textContent = url;
    } catch (error) {
        refs.content.innerHTML = `<div class="alert alert-danger">Failed to fetch API: ${error.message}</div>`;
    } finally {
        refs.spinner.classList.add('d-none');
        refs.content.classList.remove('d-none');
    }
}

// === Navbar Scroll ===
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// === Sidebar ===
const menuBtn = document.getElementById('menuBtn');
const sidebar = document.getElementById('sidebar');
const content = document.getElementById('content');
menuBtn?.addEventListener('click', () => {
    sidebar?.classList.toggle('active');
    content?.classList.toggle('shifted');
});

const sidebarLinks = document.querySelectorAll('.sidebar ul li a');
sidebarLinks.forEach(link => {
    link.addEventListener('click', function () {
        sidebarLinks.forEach(l => l.classList.remove('active'));
        this.classList.add('active');
    });
});

// === Battery, Clock, IP ===
const batteryLevel = document.getElementById('batteryLevel');
navigator.getBattery?.().then(battery => {
    const updateBattery = () => {
        if (batteryLevel) batteryLevel.textContent = `${Math.round(battery.level * 100)}%`;
    };
    updateBattery();
    battery.addEventListener('levelchange', updateBattery);
});

function updateTime() {
    const now = new Date();
    const time = now.toLocaleString('en-GB', { hour12: false });
    const currentTime = document.getElementById('currentTime');
    if (currentTime) currentTime.textContent = time;
}
setInterval(updateTime, 1000);
updateTime();

fetch('https://api.ipify.org?format=json')
    .then(res => res.json())
    .then(data => {
        const ip = document.getElementById('ipAddress');
        if (ip) ip.textContent = data.ip;
    })
    .catch(() => {
        const ip = document.getElementById('ipAddress');
        if (ip) ip.textContent = "Failed to fetch IP";
    });
