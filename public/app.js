let invitadosData = [];
let currentPage = 1;
const itemsPerPage = 10;
let isPrinting = false;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/get-invitados');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        invitadosData = await response.json();
        
        const urlParams = new URLSearchParams(window.location.search);
        const targetId = urlParams.get('id');
        const loginContainer = document.getElementById('login-container');
        const appContainer = document.getElementById('app-container');

        if (targetId !== null) {
            // Modo invitado: Mostrar directamente la tarjeta
            appContainer.style.display = 'block';
            const adminHeader = document.getElementById('admin-header');
            if(adminHeader) adminHeader.style.display = 'none';
            
            const guestGift = document.getElementById('guest-gift-section');
            if(guestGift) guestGift.style.display = 'block';
            
            renderInvitations();
        } else {
            // Modo Administrador: Solicitar Login
            loginContainer.style.display = 'block';
            
            const loginBtn = document.getElementById('login-btn');
            if (loginBtn) {
                loginBtn.onclick = () => {
                    const user = document.getElementById('login-user').value;
                    const pass = document.getElementById('login-pass').value;
                    if (user === 'brika' && pass === 'Horus2126') {
                        loginContainer.style.display = 'none';
                        appContainer.style.display = 'block';
                        renderInvitations();
                    } else {
                        document.getElementById('login-error').style.display = 'block';
                    }
                };
            }
        }
        
        setupModalEvents();
        setupDownloadEvent();
        setupGiftModal();
        setupRegistryReports();
        
        // Listen to after print event to re-render paginated version
        window.addEventListener('afterprint', () => {
            isPrinting = false;
            renderInvitations();
        });
        
    } catch (error) {
        console.error("Error cargando los datos de invitados:", error);
        document.getElementById('invitations-container').innerHTML = 
            "<div style='color:red; text-align:center; padding: 2rem; background: white; border-radius: 8px;'>Error al cargar los invitados. Por favor verifica que la base de datos Turso esté configurada y <strong>/api/db-init</strong> se haya ejecutado.</div>";
    }
});

function renderInvitations() {
    const container = document.getElementById('invitations-container');
    const paginationContainer = document.getElementById('pagination-controls');
    
    container.innerHTML = '';
    
    // Revisar si la URL tiene un parámetro "id" para mostrar una sola
    const urlParams = new URLSearchParams(window.location.search);
    const targetId = urlParams.get('id');
    
    let displayData = invitadosData;
    
    if (targetId !== null) {
        // Modo de tarjeta individual cruzado contra el "id" del objeto JSON
        const targetItem = invitadosData.find(item => item.id.toString() === targetId);
        
        if (targetItem) {
            displayData = [targetItem];
            document.body.classList.add('single-card-mode');
            if(paginationContainer) paginationContainer.style.display = 'none';
        } else {
            container.innerHTML = "<div style='text-align:center;'>Invitación no encontrada (ID inválido).</div>";
            return;
        }
    } else {
        if (!isPrinting) {
            // Calcular paginación
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            displayData = invitadosData.slice(startIndex, endIndex);
            
            renderPaginationControls();
        } else {
            // Si estamos imprimiendo, mostrar todos y ocultar paginación
            if(paginationContainer) paginationContainer.style.display = 'none';
        }
    }

    displayData.forEach((item) => {
        // Wrapper superior para tarjeta y sus botones
        const wrapper = document.createElement('div');
        wrapper.className = 'card-wrapper';

        // Tarjeta
        const card = document.createElement('div');
        card.className = 'card';
        
        // Valor INVITADOS (Nombre)
        const invitadosValue = document.createElement('div');
        invitadosValue.className = 'value-invitados';
        invitadosValue.textContent = item.invitados;
        
        // Valor CUPO (Número)
        const cupoValue = document.createElement('div');
        cupoValue.className = 'value-cupo';
        cupoValue.textContent = item.cupo;
        
        // Ensamblamos la tarjeta
        card.appendChild(invitadosValue);
        card.appendChild(cupoValue);
        wrapper.appendChild(card);
        
        // Si NO estamos en modo individual, agregar botones de acción (Copiar y Editar)
        if (targetId === null && !isPrinting) {
            const actions = document.createElement('div');
            actions.className = 'card-actions';
            actions.style.display = 'flex';
            actions.style.gap = '10px';
            
            // Buscar el índice real de este ítem dentro de la data original para editar
            const realIndex = invitadosData.indexOf(item);
            
            // Botón Copiar Link
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-link-btn';
            copyBtn.textContent = '🔗 Copiar Link Individual';
            copyBtn.onclick = () => {
                const link = `${window.location.origin}${window.location.pathname}?id=${item.id}`;
                navigator.clipboard.writeText(link).then(() => {
                    const feedback = document.getElementById('copy-feedback');
                    feedback.style.display = 'block';
                    setTimeout(() => feedback.style.display = 'none', 2000);
                });
            };
            
            // Botón Editar
            const editBtn = document.createElement('button');
            editBtn.className = 'copy-link-btn'; 
            editBtn.style.backgroundColor = '#fff3cd';
            editBtn.style.borderColor = '#ffc107';
            editBtn.style.color = '#856404';
            editBtn.textContent = '✏️ Editar';
            editBtn.onclick = () => openEditModal(realIndex);
            
            actions.appendChild(copyBtn);
            actions.appendChild(editBtn);
            wrapper.appendChild(actions);
        }

        container.appendChild(wrapper);
    });
}

function renderPaginationControls() {
    const paginationContainer = document.getElementById('pagination-controls');
    if (!paginationContainer) return;
    
    paginationContainer.innerHTML = '';
    paginationContainer.style.display = 'flex';
    
    const totalPages = Math.ceil(invitadosData.length / itemsPerPage);
    
    const prevBtn = document.createElement('button');
    prevBtn.textContent = '◀ Anterior';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            renderInvitations();
            window.scrollTo(0, 0);
        }
    };
    
    const pageText = document.createElement('span');
    pageText.textContent = `Página ${currentPage} de ${totalPages}`;
    
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Siguiente ▶';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderInvitations();
            window.scrollTo(0, 0);
        }
    };
    
    paginationContainer.appendChild(prevBtn);
    paginationContainer.appendChild(pageText);
    paginationContainer.appendChild(nextBtn);
}

window.handlePrint = function() {
    isPrinting = true;
    renderInvitations();
    
    setTimeout(() => {
        window.print();
    }, 500);
};

function setupModalEvents() {
    const modal = document.getElementById('modal-overlay');
    const cancelBtn = document.getElementById('cancel-edit-btn');
    const saveBtn = document.getElementById('save-edit-btn');
    const addNewBtn = document.getElementById('add-new-btn');
    const title = document.getElementById('modal-title');
    
    if(addNewBtn) {
        addNewBtn.onclick = () => {
            document.getElementById('edit-index').value = -1; // -1 indica nuevo
            const nextId = invitadosData.length > 0 ? Math.max(...invitadosData.map(i => i.id)) + 1 : 1;
            document.getElementById('edit-id').value = nextId;
            document.getElementById('edit-nombres').value = '';
            document.getElementById('edit-cupo').value = 1;
            document.getElementById('edit-regalo').value = '';
            document.getElementById('edit-ref-url').value = '';
            
            title.textContent = 'Agregar Nueva Invitación';
            modal.style.display = 'flex';
        };
    }
    
    if(cancelBtn) cancelBtn.onclick = () => modal.style.display = 'none';
    
    if(saveBtn) saveBtn.onclick = () => {
        const indexToEdit = parseInt(document.getElementById('edit-index').value, 10);
        const newId = document.getElementById('edit-id').value;
        const newNombres = document.getElementById('edit-nombres').value;
        const newCupo = document.getElementById('edit-cupo').value;
        const newRegalo = document.getElementById('edit-regalo').value;
        const newRefUrl = document.getElementById('edit-ref-url').value;
        
        if(newId === '' || newNombres.trim() === '' || newCupo === '') {
            alert('Por favor completa los campos principales (ID, Nombres, Cupo).');
            return;
        }
        
        const newData = {
            id: parseInt(newId, 10),
            invitados: newNombres,
            cupo: parseInt(newCupo, 10),
            regalo: newRegalo,
            referencia_url: newRefUrl
        };

        if (indexToEdit === -1) {
            invitadosData.push(newData);
            currentPage = Math.ceil(invitadosData.length / itemsPerPage);
        } else {
            invitadosData[indexToEdit] = newData;
        }
        
        modal.style.display = 'none';
        
        // Guardado en tiempo real al backend o descarga de rescate estático
        guardarDatosBackend('/api/guardar-invitados', invitadosData, "¡Datos guardados con éxito en tiempo real!", "invitados.json");
        renderInvitations();
    };
    
    // Configuración del modal de Catálogo
    const editCatalogBtn = document.getElementById('edit-catalog-btn');
    const catalogModal = document.getElementById('catalog-modal-overlay');
    const cancelCatalogBtn = document.getElementById('cancel-catalog-btn');
    const saveCatalogBtn = document.getElementById('save-catalog-btn');
    
    let currentCatalog = { regalos: [] };
    
    function renderCatalogEditor() {
        const container = document.getElementById('catalog-list-container');
        container.innerHTML = '';
        
        if (!currentCatalog.regalos) currentCatalog.regalos = [];
        
        const categories = [...new Set(currentCatalog.regalos.map(r => r.categoria))];
        
        categories.forEach(cat => {
            const section = document.createElement('div');
            section.style.marginBottom = '25px';
            section.style.padding = '15px';
            section.style.border = '1px solid #ddd';
            section.style.borderRadius = '8px';
            section.style.backgroundColor = '#f9f9f9';
            
            const titleContainer = document.createElement('div');
            titleContainer.style.display = 'flex';
            titleContainer.style.justifyContent = 'space-between';
            titleContainer.style.alignItems = 'center';
            titleContainer.style.marginBottom = '15px';
            
            const title = document.createElement('h3');
            title.textContent = cat || "Sin Categoría";
            title.style.margin = '0';
            title.style.color = 'var(--primary-blue)';
            
            titleContainer.appendChild(title);
            section.appendChild(titleContainer);
            
            const regalosCat = currentCatalog.regalos.filter(r => r.categoria === cat);
            
            regalosCat.forEach(regalo => {
                const realIndex = currentCatalog.regalos.indexOf(regalo);
                const box = document.createElement('div');
                box.style.border = '1px solid #ccc';
                box.style.padding = '10px';
                box.style.borderRadius = '6px';
                box.style.marginBottom = '10px';
                box.style.backgroundColor = 'white';
                
                const nameLabel = document.createElement('label');
                nameLabel.textContent = 'Nombre del Producto:';
                nameLabel.style.display = 'block';
                nameLabel.style.fontSize = '0.9rem';
                nameLabel.style.marginBottom = '5px';
                
                const nameInput = document.createElement('input');
                nameInput.type = 'text';
                nameInput.className = 'catalog-name-input';
                nameInput.setAttribute('data-index', realIndex);
                nameInput.value = regalo.nombre || "";
                nameInput.style.width = '100%';
                nameInput.style.padding = '6px';
                nameInput.style.marginBottom = '10px';
                nameInput.style.border = '1px solid #aaa';
                nameInput.style.borderRadius = '4px';
                
                const urlLabel = document.createElement('label');
                urlLabel.textContent = 'URL de la Imagen:';
                urlLabel.style.display = 'block';
                urlLabel.style.fontSize = '0.9rem';
                urlLabel.style.marginBottom = '5px';
                
                const urlInput = document.createElement('input');
                urlInput.type = 'text';
                urlInput.className = 'catalog-url-input';
                urlInput.setAttribute('data-index', realIndex);
                urlInput.value = regalo.imagen || "";
                urlInput.style.width = '100%';
                urlInput.style.padding = '6px';
                urlInput.style.marginBottom = '10px';
                urlInput.style.border = '1px solid #aaa';
                urlInput.style.borderRadius = '4px';
                
                const delBtn = document.createElement('button');
                delBtn.textContent = '❌ Eliminar';
                delBtn.className = 'btn';
                delBtn.style.backgroundColor = '#dc3545';
                delBtn.style.padding = '5px 10px';
                delBtn.style.fontSize = '0.8rem';
                delBtn.onclick = () => {
                    syncCatalogInputs();
                    currentCatalog.regalos.splice(realIndex, 1);
                    renderCatalogEditor();
                };
                
                box.appendChild(nameLabel);
                box.appendChild(nameInput);
                box.appendChild(urlLabel);
                box.appendChild(urlInput);
                box.appendChild(delBtn);
                section.appendChild(box);
            });
            
            const addProdBtn = document.createElement('button');
            addProdBtn.textContent = '➕ Agregar Producto';
            addProdBtn.className = 'btn';
            addProdBtn.style.backgroundColor = '#28a745';
            addProdBtn.style.padding = '5px 10px';
            addProdBtn.style.fontSize = '0.8rem';
            addProdBtn.style.marginTop = '10px';
            addProdBtn.onclick = () => {
                syncCatalogInputs();
                const newId = currentCatalog.regalos.length > 0 ? Math.max(...currentCatalog.regalos.map(r => r.id)) + 1 : 1;
                currentCatalog.regalos.push({
                    id: newId,
                    categoria: cat,
                    nombre: "Nuevo Producto",
                    imagen: "",
                    alt: "Regalo"
                });
                renderCatalogEditor();
            };
            
            section.appendChild(addProdBtn);
            container.appendChild(section);
        });
    }

    function syncCatalogInputs() {
        const nameInputs = document.querySelectorAll('.catalog-name-input');
        nameInputs.forEach(input => {
            const idx = input.getAttribute('data-index');
            if(currentCatalog.regalos[idx]) currentCatalog.regalos[idx].nombre = input.value;
        });
        
        const urlInputs = document.querySelectorAll('.catalog-url-input');
        urlInputs.forEach(input => {
            const idx = input.getAttribute('data-index');
            if(currentCatalog.regalos[idx]) currentCatalog.regalos[idx].imagen = input.value;
        });
    }

    if (editCatalogBtn) {
        editCatalogBtn.onclick = async () => {
            try {
                const res = await fetch('/api/get-catalogo');
                if (res.ok) {
                    currentCatalog = await res.json();
                }
            } catch (e) {
                console.error("Error cargando catálogo", e);
            }
            renderCatalogEditor();
            catalogModal.style.display = 'flex';
        };
    }
    
    const addCatBtn = document.getElementById('add-category-btn');
    if (addCatBtn) {
        addCatBtn.onclick = () => {
            const newCat = prompt("Nombre de la nueva categoría:");
            if (newCat && newCat.trim() !== '') {
                syncCatalogInputs();
                const newId = currentCatalog.regalos.length > 0 ? Math.max(...currentCatalog.regalos.map(r => r.id)) + 1 : 1;
                currentCatalog.regalos.push({
                    id: newId,
                    categoria: newCat.trim(),
                    nombre: "Nuevo Producto",
                    imagen: "",
                    alt: "Regalo"
                });
                renderCatalogEditor();
            }
        };
    }
    
    if (cancelCatalogBtn) cancelCatalogBtn.onclick = () => catalogModal.style.display = 'none';
    
    if (saveCatalogBtn) saveCatalogBtn.onclick = () => {
        syncCatalogInputs();
        currentCatalog.regalos = currentCatalog.regalos.filter(r => r.nombre.trim() !== '');
        guardarDatosBackend('/api/guardar-catalogo', currentCatalog, "Catálogo guardado en tiempo real.", "regalos.json");
        catalogModal.style.display = 'none';
    };
}

async function guardarDatosBackend(endpoint, objArray, mensajeExito, fallbackFileName) {
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(objArray)
        });
        
        // Si responde HTML o algo que no es JSON (como hace npx serve al dar un 404), saltará al catch
        const result = await response.json();
        if(result.success && mensajeExito) {
            console.log(mensajeExito);
        } else if(!result.success) {
            throw new Error(result.message || "Error del servidor backend");
        }
    } catch(e) {
        console.warn("Modo Estático/Vercel Detectado. No hay backend Node. " + e.message);
        if (fallbackFileName) {
            // Descargar el archivo localmente como método de guardado en el PC del host sin servidor
            descargarJsonRespaldo(objArray, fallbackFileName);
            alert(`Actualización local: Hemos descargado un archivo ${fallbackFileName} actualizado ya que estás corriendo en modo estático. Reemplázalo en tu carpeta de proyecto para guardar.`);
        }
    }
}

function descargarJsonRespaldo(objArray, fileName) {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(objArray, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", fileName);
    document.body.appendChild(downloadAnchorNode); 
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function openEditModal(realIndex) {
    const item = invitadosData[realIndex];
    document.getElementById('edit-index').value = realIndex;
    document.getElementById('edit-id').value = item.id;
    document.getElementById('edit-nombres').value = item.invitados;
    document.getElementById('edit-cupo').value = item.cupo;
    document.getElementById('edit-regalo').value = item.regalo || "";
    document.getElementById('edit-ref-url').value = item.referencia_url || "";
    
    document.getElementById('modal-title').textContent = 'Editar Invitación';
    document.getElementById('modal-overlay').style.display = 'flex';
}

function setupDownloadEvent() {
    const btnDown = document.getElementById('download-json-btn');
    if(btnDown) {
        btnDown.onclick = () => {
           descargarJsonRespaldo(invitadosData, "invitados_respaldo.json");
           alert("Se ha descargado un respaldo de la base de datos.");
        };
    }
}

async function setupGiftModal() {
    const giftBtn = document.getElementById('show-gift-btn');
    const giftModal = document.getElementById('gift-modal-overlay');
    const closeGiftBtn = document.getElementById('close-gift-btn');
    const closeSuccessBtn = document.getElementById('close-success-btn');
    const closeAlreadyBtn = document.getElementById('close-already-btn');
    
    const selectionDiv = document.getElementById('gift-modal-selection');
    const successDiv = document.getElementById('gift-modal-success');
    const alreadyChosenDiv = document.getElementById('gift-modal-already-chosen');
    const chosenDisplay = document.getElementById('chosen-gift-display');
    
    if(giftBtn && giftModal) {
        
        let regalosSugeridos = [];
        try {
            const resReq = await fetch('/api/get-catalogo');
            if(resReq.ok) {
                const reqJson = await resReq.json();
                regalosSugeridos = reqJson.regalos || [];
            }
        } catch(e) {
            console.error("Error al cargar catálogo", e);
        }

        const container = document.getElementById('regalos-categorias-container');
        if (container) {
            container.innerHTML = '';
            const categorias = [...new Set(regalosSugeridos.map(r => r.categoria))];
            
            categorias.forEach(cat => {
                const section = document.createElement('div');
                section.style.marginBottom = '25px';
                
                const title = document.createElement('h4');
                title.textContent = cat;
                title.style.color = 'var(--primary-blue)';
                title.style.borderBottom = '2px solid #ccc';
                title.style.paddingBottom = '5px';
                title.style.marginBottom = '10px';
                title.style.textAlign = 'left';
                section.appendChild(title);
                
                const grid = document.createElement('div');
                grid.style.display = 'grid';
                grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(140px, 1fr))';
                grid.style.gap = '15px';
                
                const regalosCat = regalosSugeridos.filter(r => r.categoria === cat);
                regalosCat.forEach(regalo => {
                    const card = document.createElement('div');
                    card.style.border = '1px solid #eee';
                    card.style.borderRadius = '8px';
                    card.style.padding = '10px';
                    card.style.textAlign = 'center';
                    card.style.cursor = 'pointer';
                    card.style.transition = 'transform 0.2s, box-shadow 0.2s';
                    card.style.backgroundColor = 'white';
                    
                    const img = document.createElement('img');
                    img.src = regalo.imagen;
                    img.alt = regalo.alt;
                    img.style.width = '100%';
                    img.style.height = '100px';
                    img.style.objectFit = 'cover';
                    img.style.borderRadius = '6px';
                    img.style.marginBottom = '8px';
                    
                    const name = document.createElement('p');
                    name.textContent = regalo.nombre;
                    name.style.fontSize = '0.9rem';
                    name.style.margin = '0';
                    name.style.fontWeight = 'bold';
                    name.style.color = 'var(--text-dark)';
                    
                    const btn = document.createElement('button');
                    btn.textContent = 'Elegir';
                    btn.className = 'btn';
                    btn.style.width = '100%';
                    btn.style.marginTop = '10px';
                    btn.style.padding = '5px';
                    btn.style.fontSize = '0.8rem';
                    
                    card.onmouseenter = () => { card.style.transform = 'scale(1.05)'; card.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)'; };
                    card.onmouseleave = () => { card.style.transform = 'scale(1)'; card.style.boxShadow = 'none'; };
                    
                    card.onclick = () => enviarRegalo(regalo.nombre, regalo.imagen, btn);
                    
                    card.appendChild(img);
                    card.appendChild(name);
                    card.appendChild(btn);
                    grid.appendChild(card);
                });
                
                section.appendChild(grid);
                container.appendChild(section);
            });
        }
        
        giftBtn.onclick = () => {
            const urlParams = new URLSearchParams(window.location.search);
            const targetId = urlParams.get('id');
            const currentGuest = invitadosData.find(i => i.id.toString() === targetId);

            if (currentGuest && currentGuest.regalo && currentGuest.regalo.trim() !== "") {
                selectionDiv.style.display = 'none';
                successDiv.style.display = 'none';
                alreadyChosenDiv.style.display = 'block';
                chosenDisplay.textContent = currentGuest.regalo;
                giftModal.style.display = 'flex';
            } else {
                selectionDiv.style.display = 'block';
                successDiv.style.display = 'none';
                alreadyChosenDiv.style.display = 'none';
                giftModal.style.display = 'flex';
            }
        };
        
        if (closeGiftBtn) closeGiftBtn.onclick = () => giftModal.style.display = 'none';
        if (closeSuccessBtn) closeSuccessBtn.onclick = () => giftModal.style.display = 'none';
        if (closeAlreadyBtn) closeAlreadyBtn.onclick = () => giftModal.style.display = 'none';
        
        giftModal.addEventListener('click', (e) => {
            if(e.target === giftModal) giftModal.style.display = 'none';
        });

        async function enviarRegalo(regaloStr, imagenUrl, currBtn) {
            const urlParams = new URLSearchParams(window.location.search);
            const targetId = urlParams.get('id');
            if (!targetId) return;

            currBtn.textContent = "⏳...";
            currBtn.disabled = true;

            const payload = {
                id: targetId,
                regalo: regaloStr,
                referencia_url: imagenUrl || ''
            };
            
            // Actualizar memoria local al instante para mostrar la pantalla de "ya seleccionaste" si entran de nuevo
            const gIndex = invitadosData.findIndex(i => i.id.toString() === targetId);
            if (gIndex !== -1) {
                invitadosData[gIndex].regalo = regaloStr;
                invitadosData[gIndex].referencia_url = imagenUrl || '';
            }

            try {
                // Intentamos golpear el backend (por si es el admin trabajando en Node localmente)
                const response = await fetch('/api/guardar-regalo', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                
                const result = await response.json();
                if(result.success) {
                    console.log("Regalo salvado en tiempo real en PC");
                }
            } catch(e) {
                // Silencioso. El invitado real en Vercel u otro static host vendrá directo aquí.
                console.warn("Modo estático. No se persiste la data a disco, pero mostramos éxito.");
            }
            
            // SIEMPRE mostramos éxito al usuario gane o pierda el backend (tolerancia a Vercel y npx)
            selectionDiv.style.display = 'none';
            successDiv.style.display = 'block';
            alreadyChosenDiv.style.display = 'none';
        }
    }
}

// -------------------------------------------------------------
// REPORTES Y LISTA DE REGALOS (ADMIN)
// -------------------------------------------------------------
let registryPage = 1;
const registryItemsPerPage = 10;

function setupRegistryReports() {
    const viewBtn = document.getElementById('view-registry-btn');
    const registryModal = document.getElementById('registry-modal-overlay');
    const closeBtn = document.getElementById('close-registry-btn');

    if (viewBtn && registryModal) {
        viewBtn.onclick = () => {
            registryPage = 1;
            renderRegistryTable();
            registryModal.style.display = 'flex';
        };

        if (closeBtn) closeBtn.onclick = () => registryModal.style.display = 'none';

        registryModal.addEventListener('click', (e) => {
            if (e.target === registryModal) registryModal.style.display = 'none';
        });
    }
}

function renderRegistryTable() {
    const tbody = document.getElementById('registry-table-body');
    const paginationContainer = document.getElementById('registry-pagination');
    if (!tbody) return;

    tbody.innerHTML = '';
    
    // Mostramos todos (los que tienen regalo y los que no, para uso general)
    const totalPages = Math.ceil(invitadosData.length / registryItemsPerPage) || 1;
    
    // Paginar
    const startIdx = (registryPage - 1) * registryItemsPerPage;
    const endIdx = startIdx + registryItemsPerPage;
    const displayData = invitadosData.slice(startIdx, endIdx);

    displayData.forEach(item => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid #ddd';

        const tdNombre = document.createElement('td');
        tdNombre.style.padding = '12px';
        tdNombre.textContent = item.invitados;

        const tdCupo = document.createElement('td');
        tdCupo.style.padding = '12px';
        tdCupo.textContent = item.cupo;

        const tdRegalo = document.createElement('td');
        tdRegalo.style.padding = '12px';
        
        if (item.regalo && item.regalo.trim() !== '') {
            tdRegalo.innerHTML = `<strong>🎁 ${item.regalo}</strong>`;
            tdRegalo.style.color = 'var(--primary-blue)';
        } else {
            tdRegalo.innerHTML = `<span style="color: #999; font-style: italic;">Sin asignar</span>`;
        }
        
        tr.appendChild(tdNombre);
        tr.appendChild(tdCupo);
        tr.appendChild(tdRegalo);
        tbody.appendChild(tr);
    });

    // Paginación UI
    if (paginationContainer) {
        paginationContainer.innerHTML = '';
        
        const prevBtn = document.createElement('button');
        prevBtn.textContent = '◀ Ant';
        prevBtn.className = 'btn';
        prevBtn.style.padding = '6px 12px';
        prevBtn.disabled = registryPage === 1;
        prevBtn.onclick = () => {
            if (registryPage > 1) {
                registryPage--;
                renderRegistryTable();
            }
        };
        
        const pageText = document.createElement('span');
        pageText.textContent = `Pág. ${registryPage} / ${totalPages}`;
        pageText.style.fontWeight = 'bold';
        
        const nextBtn = document.createElement('button');
        nextBtn.textContent = 'Sig ▶';
        nextBtn.className = 'btn';
        nextBtn.style.padding = '6px 12px';
        nextBtn.disabled = registryPage === totalPages;
        nextBtn.onclick = () => {
            if (registryPage < totalPages) {
                registryPage++;
                renderRegistryTable();
            }
        };

        paginationContainer.appendChild(prevBtn);
        paginationContainer.appendChild(pageText);
        paginationContainer.appendChild(nextBtn);
    }
}
