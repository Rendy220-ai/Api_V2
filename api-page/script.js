// === API Modal Handling (fixed version) ===
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

    // Reset modal content
    refs.label.textContent = apiName;
    refs.desc.textContent = apiDesc;
    refs.content.innerHTML = '';
    refs.endpoint.textContent = '';
    refs.spinner.classList.add('d-none');
    refs.content.classList.add('d-none');
    refs.queryInput.innerHTML = '';
    refs.submitBtn.classList.add('d-none');

    const baseUrl = `${window.location.origin}${apiPath.split('?')[0]}`;
    const params = new URLSearchParams(apiPath.split('?')[1]);

    if ([...params.keys()].length) {
        // If there are parameters, show inputs
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
            const newParams = new URLSearchParams();
            let emptyInput = false;
            paramDiv.querySelectorAll('input').forEach(input => {
                if (!input.value.trim()) {
                    emptyInput = true;
                }
                newParams.append(input.dataset.param, input.value.trim());
            });

            if (emptyInput) {
                alert("Please fill in the input first!");
                return;
            }

            await fetchAPI(`${baseUrl}?${newParams.toString()}`, refs, apiName);
        };
    } else {
        // If no parameters, directly fetch
        refs.submitBtn.classList.add('d-none');
        await fetchAPI(apiPath, refs, apiName);
    }

    modal.show();
});

async function fetchAPI(url, refs, apiName) {
    try {
        refs.spinner.classList.remove('d-none');
        refs.content.classList.add('d-none');

        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const type = res.headers.get('Content-Type');
        if (type?.includes('image/')) {
            const blob = await res.blob();
            const img = document.createElement('img');
            img.src = URL.createObjectURL(blob);
            img.alt = apiName;
            img.style.maxWidth = '100%';
            refs.content.innerHTML = '';
            refs.content.appendChild(img);
        } else {
            const data = await res.json();
            refs.content.textContent = JSON.stringify(data, null, 2);
        }
        refs.endpoint.textContent = url;
        refs.endpoint.classList.remove('d-none');
    } catch (error) {
        refs.content.textContent = `Error: ${error.message}`;
    } finally {
        refs.spinner.classList.add('d-none');
        refs.content.classList.remove('d-none');
    }
}
