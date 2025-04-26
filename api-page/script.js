
document.addEventListener('DOMContentLoaded', () => {
  const hasVisited = localStorage.getItem('hasVisited');

  if (!hasVisited) {
    // Kalau belum pernah masuk, tandai dan redirect
    localStorage.setItem('hasVisited', 'true');
    window.location.href = 'dashboard.html';
  }
  // Kalau sudah pernah, tidak redirect
});

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
        setContent('wm', 'textContent', `© 2025 ${settings.apiSettings.creator}` || "© 2025 FR3. All rights reserved.");
        setContent('header', 'textContent', settings.name || "FR3 UI");
        setContent('name', 'textContent', settings.name || "FR3 UI");
        setContent('version', 'textContent', settings.version || "v1.0");
        setContent('versionHeader', 'textContent', settings.header.status || "Active!");
        setContent('description', 'textContent', settings.description || "Simple API's");

        const apiLinksContainer = document.getElementById('apiLinks');
        if (apiLinksContainer && settings.links?.length) {
            settings.links.forEach(({ url, name }) => {
                const link = Object.assign(document.createElement('a'), {
                    href: url,
                    textContent: name,
                    target: '_blank',
                    className: 'lead'
                });
                apiLinksContainer.appendChild(link);
            });
        }

        const apiContent = document.getElementById('apiContent');
        settings.categories.forEach((category) => {
            const sortedItems = category.items.sort((a, b) => a.name.localeCompare(b.name));
            const categoryContent = sortedItems.map((item) => `
                <div class="col-md-6 col-lg-4 api-item">
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
            `).join('');
            apiContent.insertAdjacentHTML('beforeend', `<div class="row">${categoryContent}</div>`);
        });

        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.toLowerCase();
            const apiItems = document.querySelectorAll('.api-item');

            apiItems.forEach(item => {
                const name = item.getAttribute('data-name')?.toLowerCase() || '';
                const desc = item.getAttribute('data-desc')?.toLowerCase() || '';
                item.style.display = (name.includes(searchTerm) || desc.includes(searchTerm)) ? '' : 'none';
            });
        });

        document.addEventListener('click', event => {
            if (!event.target.classList.contains('get-api-btn')) return;

            const { apiPath, apiName, apiDesc } = event.target.dataset;
            const modal = new bootstrap.Modal(document.getElementById('apiResponseModal'));
            const modalRefs = {
                label: document.getElementById('apiResponseModalLabel'),
                desc: document.getElementById('apiResponseModalDesc'),
                content: document.getElementById('apiResponseContent'),
                endpoint: document.getElementById('apiEndpoint'),
                spinner: document.getElementById('apiResponseLoading'),
                queryInputContainer: document.getElementById('apiQueryInputContainer'),
                submitBtn: document.getElementById('submitQueryBtn')
            };

            modalRefs.label.textContent = apiName;
            modalRefs.desc.textContent = apiDesc;
            modalRefs.content.textContent = '';
            modalRefs.endpoint.textContent = '';
            modalRefs.spinner.classList.add('d-none');
            modalRefs.content.classList.add('d-none');
            modalRefs.endpoint.classList.add('d-none');

            modalRefs.queryInputContainer.innerHTML = '';
            modalRefs.submitBtn.classList.add('d-none');

            let baseApiUrl = `${window.location.origin}${apiPath}`;
            let params = new URLSearchParams(apiPath.split('?')[1]);
            let hasParams = params.toString().length > 0;

            if (hasParams) {
                const paramContainer = document.createElement('div');
                paramContainer.className = 'param-container';

                const paramsArray = Array.from(params.keys());
                paramsArray.forEach((param) => {
                    const inputField = document.createElement('input');
                    inputField.type = 'text';
                    inputField.className = 'form-control mb-2';
                    inputField.placeholder = `Input ${param}...`;
                    inputField.dataset.param = param;
                    paramContainer.appendChild(inputField);
                });

                modalRefs.queryInputContainer.appendChild(paramContainer);
                modalRefs.submitBtn.classList.remove('d-none');

                modalRefs.submitBtn.onclick = async () => {
                    const inputs = modalRefs.queryInputContainer.querySelectorAll('input');
                    const newParams = new URLSearchParams();
                    let valid = true;

                    inputs.forEach(input => {
                        if (!input.value.trim()) {
                            input.classList.add('is-invalid');
                            valid = false;
                        } else {
                            input.classList.remove('is-invalid');
                            newParams.append(input.dataset.param, input.value.trim());
                        }
                    });

                    if (!valid) return;

                    const newUrl = `${window.location.origin}${apiPath.split('?')[0]}?${newParams.toString()}`;
                    modalRefs.queryInputContainer.innerHTML = '';
                    modalRefs.submitBtn.classList.add('d-none');
                    handleApiRequest(newUrl, modalRefs, apiName);
                };
            } else {
                handleApiRequest(baseApiUrl, modalRefs, apiName);
            }

            modal.show();
        });

        async function handleApiRequest(apiUrl, modalRefs, apiName) {
            modalRefs.spinner.classList.remove('d-none');
            modalRefs.content.classList.add('d-none');

            try {
                const response = await fetch(apiUrl);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                const contentType = response.headers.get('Content-Type');
                if (contentType && contentType.startsWith('image/')) {
                    const blob = await response.blob();
                    const imageUrl = URL.createObjectURL(blob);

                    const img = document.createElement('img');
                    img.src = imageUrl;
                    img.alt = apiName;
                    img.style.maxWidth = '100%';
                    img.style.borderRadius = '5px';

                    modalRefs.content.innerHTML = '';
                    modalRefs.content.appendChild(img);
                } else {
                    const data = await response.json();
                    modalRefs.content.textContent = JSON.stringify(data, null, 2);
                }
                modalRefs.endpoint.textContent = apiUrl;
                modalRefs.endpoint.classList.remove('d-none');
            } catch (error) {
                modalRefs.content.textContent = `Error: ${error.message}`;
            } finally {
                modalRefs.spinner.classList.add('d-none');
                modalRefs.content.classList.remove('d-none');
            }
        }

    } catch (error) {
        console.error('Error loading settings:', error);
    } finally {
        setTimeout(() => {
            loadingScreen.style.display = "none";
            body.classList.remove("no-scroll");
        }, 2000);
    }
});

// Navbar behavior
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Toggle slide menu
function toggleMenu() {
    const menu = document.getElementById("slideMenu");
    menu.style.display = menu.style.display === "flex" ? "none" : "flex";
}

// Close popup
function closePopup() {
    document.getElementById('popup').style.display = 'none';
                }

const batteryLevelElement = document.getElementById('batteryLevel');

// Fungsi untuk update data baterai
function updateBatteryInfo(battery) {
  const level = Math.round(battery.level * 100);
  batteryLevelElement.textContent = `${level}%`;
}

// Cek apakah browser support
if ('getBattery' in navigator) {
  navigator.getBattery().then(battery => {
    updateBatteryInfo(battery);

    // Update kalau level baterai berubah
    battery.addEventListener('levelchange', () => updateBatteryInfo(battery));
    battery.addEventListener('chargingchange', () => updateBatteryInfo(battery));
  }).catch(() => {
    batteryLevelElement.textContent = "Cannot access battery info.";
  });
} else {
  batteryLevelElement.textContent = "Battery info not supported.";
}

// Update waktu
function updateTime() {
  const now = new Date();
  const formattedTime = now.toLocaleString('en-US', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false
  });
  document.getElementById('currentTime').textContent = formattedTime;
}
setInterval(updateTime, 1000);
updateTime();

// Fetch IP Address
fetch('https://api.ipify.org?format=json')
  .then(response => response.json())
  .then(data => {
    document.getElementById('ipAddress').textContent = data.ip;
  })
  .catch(() => {
    document.getElementById('ipAddress').textContent = "Failed to fetch IP";
  });
