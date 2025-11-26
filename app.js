// Estado da aplicação
let stream = null;
let currentGlasses = null;
let glassesSize = 1;
let glassesPositionX = 0;
let glassesPositionY = 0;
let glassesRotation = 0;
let uploadedImage = null;
let isUsingImage = false;

// Modelos de óculos (PNG)
// ADICIONE AQUI OS NOMES DOS ARQUIVOS PNG DOS ÓCULOS QUE VOCÊ COLOCOU NA PASTA
// Exemplo: se você tem oculos.png, oculos2.png, oculos3.png, adicione todos aqui
const glassesFiles = [
    'oculos.png',
    'oculos2.png',
    'oculos3.png',
    'oculos4.png',
    'oculos5.png',
    'oculos6.png',
    // Adicione mais arquivos aqui:
    // 'oculos7.png',
    // 'meu-oculos.png',
];

let glassesModels = [];

// Função para carregar os modelos de óculos
async function loadGlassesModels() {
    const models = [];
    
    for (const fileName of glassesFiles) {
        const exists = await checkImageExists(fileName);
        if (exists) {
            // Criar nome amigável a partir do nome do arquivo
            let name = fileName.replace('.png', '').replace(/[-_]/g, ' ');
            // Capitalizar primeira letra de cada palavra
            name = name.split(' ').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            ).join(' ');
            
            // Usar caminho absoluto ou relativo correto
            const imagePath = fileName.startsWith('http') || fileName.startsWith('/') 
                ? fileName 
                : './' + fileName;
            
            models.push({
                id: fileName.replace('.png', '').replace(/[-_]/g, '-'),
                name: name,
                image: imagePath
            });
        } else {
            console.warn(`Arquivo não encontrado: ${fileName}`);
        }
    }
    
    // Se não encontrou nenhum, usar o padrão
    if (models.length === 0) {
        models.push({
            id: 'oculos',
            name: 'Óculos',
            image: './oculos.png'
        });
    }
    
    return models;
}

// Função para verificar se uma imagem existe
function checkImageExists(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
        // Timeout para não ficar esperando muito
        setTimeout(() => resolve(false), 500);
    });
}

// Elementos DOM
const video = document.getElementById('video');
const uploadedImageEl = document.getElementById('uploadedImage');
const canvas = document.getElementById('canvas');
const overlay = document.getElementById('overlay');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const uploadImageInput = document.getElementById('uploadImage');
const removeImageBtn = document.getElementById('removeImageBtn');
const removeGlassesBtn = document.getElementById('removeGlassesBtn');
const glassesGallery = document.getElementById('glassesGallery');

// Controles de ajuste
const sizeSlider = document.getElementById('glassesSize');
const positionXSlider = document.getElementById('glassesPositionX');
const positionYSlider = document.getElementById('glassesPositionY');
const rotationSlider = document.getElementById('glassesRotation');
const sizeValue = document.getElementById('sizeValue');
const positionXValue = document.getElementById('positionXValue');
const positionYValue = document.getElementById('positionYValue');
const rotationValue = document.getElementById('rotationValue');

// Função auxiliar para sincronizar controles mobile
function syncMobileControls() {
    const sizeMobile = document.getElementById('glassesSizeMobile');
    const posXMobile = document.getElementById('glassesPositionXMobile');
    const posYMobile = document.getElementById('glassesPositionYMobile');
    const rotMobile = document.getElementById('glassesRotationMobile');
    const sizeValueMobile = document.getElementById('sizeValueMobile');
    const posXValueMobile = document.getElementById('positionXValueMobile');
    const posYValueMobile = document.getElementById('positionYValueMobile');
    const rotValueMobile = document.getElementById('rotationValueMobile');
    
    if (sizeMobile) sizeMobile.value = glassesSize;
    if (posXMobile) posXMobile.value = glassesPositionX;
    if (posYMobile) posYMobile.value = glassesPositionY;
    if (rotMobile) rotMobile.value = glassesRotation;
    if (sizeValueMobile) sizeValueMobile.textContent = Math.round(glassesSize * 100) + '%';
    if (posXValueMobile) posXValueMobile.textContent = Math.round(glassesPositionX) + 'px';
    if (posYValueMobile) posYValueMobile.textContent = Math.round(glassesPositionY) + 'px';
    if (rotValueMobile) rotValueMobile.textContent = glassesRotation + '°';
}

// Inicialização
async function init() {
    // Remover botão de captura caso exista (cache do navegador)
    const captureBtn = document.getElementById('captureBtn');
    if (captureBtn) {
        captureBtn.remove();
    }
    
    // Carregar modelos de óculos
    glassesModels = await loadGlassesModels();
    renderGlassesGallery();
    setupEventListeners();
    setupMobileControls();
}

// Configurar controles mobile
function setupMobileControls() {
    const isMobile = window.innerWidth <= 768;
    
    // Esconder controles da direita no mobile
    const settingsSection = document.querySelector('.settings-section');
    if (settingsSection) {
        settingsSection.style.display = isMobile ? 'none' : 'block';
    }
    
    // Mostrar controles mobile logo abaixo do quadro
    const mobileSettingsContainer = document.getElementById('mobileSettingsContainer');
    if (mobileSettingsContainer) {
        mobileSettingsContainer.style.display = isMobile ? 'block' : 'none';
    }
    
    // Sincronizar controles mobile com os principais
    const sizeMobile = document.getElementById('glassesSizeMobile');
    const posXMobile = document.getElementById('glassesPositionXMobile');
    const posYMobile = document.getElementById('glassesPositionYMobile');
    const rotMobile = document.getElementById('glassesRotationMobile');
    const sizeValueMobile = document.getElementById('sizeValueMobile');
    const posXValueMobile = document.getElementById('positionXValueMobile');
    const posYValueMobile = document.getElementById('positionYValueMobile');
    const rotValueMobile = document.getElementById('rotationValueMobile');
    
    // Configurar event listeners para controles mobile
    if (sizeMobile) {
        // Remover listener anterior se existir
        if (sizeMobile._mobileHandler) {
            sizeMobile.removeEventListener('input', sizeMobile._mobileHandler);
        }
        // Criar novo handler
        sizeMobile._mobileHandler = function(e) {
            glassesSize = parseFloat(e.target.value);
            if (sizeValueMobile) sizeValueMobile.textContent = Math.round(glassesSize * 100) + '%';
            if (sizeSlider) sizeSlider.value = glassesSize;
            if (sizeValue) sizeValue.textContent = Math.round(glassesSize * 100) + '%';
            updateGlassesOverlay();
        };
        sizeMobile.addEventListener('input', sizeMobile._mobileHandler);
    }
    
    if (posXMobile) {
        if (posXMobile._mobileHandler) {
            posXMobile.removeEventListener('input', posXMobile._mobileHandler);
        }
        posXMobile._mobileHandler = function(e) {
            glassesPositionX = parseInt(e.target.value);
            if (posXValueMobile) posXValueMobile.textContent = glassesPositionX + 'px';
            if (positionXSlider) positionXSlider.value = glassesPositionX;
            if (positionXValue) positionXValue.textContent = glassesPositionX + 'px';
            updateGlassesOverlay();
        };
        posXMobile.addEventListener('input', posXMobile._mobileHandler);
    }
    
    if (posYMobile) {
        if (posYMobile._mobileHandler) {
            posYMobile.removeEventListener('input', posYMobile._mobileHandler);
        }
        posYMobile._mobileHandler = function(e) {
            glassesPositionY = parseInt(e.target.value);
            if (posYValueMobile) posYValueMobile.textContent = glassesPositionY + 'px';
            if (positionYSlider) positionYSlider.value = glassesPositionY;
            if (positionYValue) positionYValue.textContent = glassesPositionY + 'px';
            updateGlassesOverlay();
        };
        posYMobile.addEventListener('input', posYMobile._mobileHandler);
    }
    
    if (rotMobile) {
        if (rotMobile._mobileHandler) {
            rotMobile.removeEventListener('input', rotMobile._mobileHandler);
        }
        rotMobile._mobileHandler = function(e) {
            glassesRotation = parseInt(e.target.value);
            if (rotValueMobile) rotValueMobile.textContent = glassesRotation + '°';
            if (rotationSlider) rotationSlider.value = glassesRotation;
            if (rotationValue) rotationValue.textContent = glassesRotation + '°';
            updateGlassesOverlay();
        };
        rotMobile.addEventListener('input', rotMobile._mobileHandler);
    }
    
    // Sincronizar valores iniciais
    if (sizeMobile) sizeMobile.value = glassesSize;
    if (posXMobile) posXMobile.value = glassesPositionX;
    if (posYMobile) posYMobile.value = glassesPositionY;
    if (rotMobile) rotMobile.value = glassesRotation;
    
    // Atualizar função syncMobileControls global para incluir controles mobile
    const originalSync = window.syncMobileControls || function() {};
    window.syncMobileControls = function() {
        originalSync();
        // Buscar elementos novamente para garantir referência atualizada
        const sizeMobileSync = document.getElementById('glassesSizeMobile');
        const posXMobileSync = document.getElementById('glassesPositionXMobile');
        const posYMobileSync = document.getElementById('glassesPositionYMobile');
        const rotMobileSync = document.getElementById('glassesRotationMobile');
        const sizeValueMobileSync = document.getElementById('sizeValueMobile');
        const posXValueMobileSync = document.getElementById('positionXValueMobile');
        const posYValueMobileSync = document.getElementById('positionYValueMobile');
        const rotValueMobileSync = document.getElementById('rotationValueMobile');
        
        if (sizeMobileSync) {
            sizeMobileSync.value = glassesSize;
            if (sizeValueMobileSync) sizeValueMobileSync.textContent = Math.round(glassesSize * 100) + '%';
        }
        if (posXMobileSync) {
            posXMobileSync.value = glassesPositionX;
            if (posXValueMobileSync) posXValueMobileSync.textContent = glassesPositionX + 'px';
        }
        if (posYMobileSync) {
            posYMobileSync.value = glassesPositionY;
            if (posYValueMobileSync) posYValueMobileSync.textContent = glassesPositionY + 'px';
        }
        if (rotMobileSync) {
            rotMobileSync.value = glassesRotation;
            if (rotValueMobileSync) rotValueMobileSync.textContent = glassesRotation + '°';
        }
    };
    
    // Sincronizar valores iniciais
    window.syncMobileControls();
}

// Renderizar galeria de óculos
function renderGlassesGallery() {
    glassesGallery.innerHTML = '';
    glassesModels.forEach((model, index) => {
        const item = document.createElement('div');
        item.className = 'glasses-item';
        item.innerHTML = `
            <button class="remove-glasses-btn" onclick="event.stopPropagation(); removeGlasses(${index})" title="Remover este modelo">×</button>
            <img src="${model.image}" alt="${model.name}" class="glasses-preview">
            <span>${model.name}</span>
        `;
        item.addEventListener('click', () => selectGlasses(model, item));
        glassesGallery.appendChild(item);
    });
}

// Remover óculos da lista
function removeGlasses(index) {
    if (glassesModels.length <= 1) {
        alert('Você precisa ter pelo menos um modelo de óculos!');
        return;
    }
    
    // Se o óculos removido é o atual, selecionar outro
    if (currentGlasses === glassesModels[index]) {
        const newIndex = index === 0 ? 1 : index - 1;
        currentGlasses = glassesModels[newIndex];
    }
    
    // Remover da lista
    glassesModels.splice(index, 1);
    
    // Re-renderizar galeria
    renderGlassesGallery();
    
    // Atualizar overlay se necessário
    if (currentGlasses) {
        updateGlassesOverlay();
    }
}

// Selecionar óculos
function selectGlasses(model, element) {
    currentGlasses = model;
    
    // Atualizar visual
    document.querySelectorAll('.glasses-item').forEach(item => {
        item.classList.remove('active');
    });
    if (element) {
        element.classList.add('active');
    }
    
    // Habilitar botão de remover óculos
    removeGlassesBtn.disabled = false;
    
    // Atualizar overlay
    updateGlassesOverlay();
}

// Remover óculos da imagem
function removeGlassesFromImage() {
    currentGlasses = null;
    overlay.innerHTML = '';
    
    // Desabilitar botão de remover
    removeGlassesBtn.disabled = true;
    
    // Remover seleção da galeria
    document.querySelectorAll('.glasses-item').forEach(item => {
        item.classList.remove('active');
    });
}

// Atualizar overlay dos óculos
function updateGlassesOverlay() {
    if (!currentGlasses) {
        if (overlay) overlay.innerHTML = '';
        return;
    }
    
    // Garantir que overlay existe
    if (!overlay) {
        console.warn('Overlay não encontrado');
        return;
    }
    
    // Se já existe uma imagem, apenas atualizar a transformação
    let img = document.getElementById('glassesImage');
    if (!img) {
        img = document.createElement('img');
        img.src = currentGlasses.image;
        img.alt = currentGlasses.name;
        img.id = 'glassesImage';
        img.draggable = false;
        img.style.maxWidth = '60%';
        img.style.maxHeight = '60%';
        img.style.objectFit = 'contain';
        img.style.cursor = 'move';
        img.style.userSelect = 'none';
        img.style.pointerEvents = 'auto';
        
        overlay.innerHTML = '';
        overlay.appendChild(img);
        
        // Adicionar funcionalidade de arrastar apenas uma vez
        setupDragAndDrop(img);
    }
    
    // Garantir que a imagem está visível
    img.style.display = 'block';
    img.style.visibility = 'visible';
    img.style.opacity = '1';
    
    // Atualizar transformação - garantir que os valores são números válidos
    const size = typeof glassesSize === 'number' && !isNaN(glassesSize) ? glassesSize : 1;
    const posX = typeof glassesPositionX === 'number' && !isNaN(glassesPositionX) ? glassesPositionX : 0;
    const posY = typeof glassesPositionY === 'number' && !isNaN(glassesPositionY) ? glassesPositionY : 0;
    const rot = typeof glassesRotation === 'number' && !isNaN(glassesRotation) ? glassesRotation : 0;
    
    // Aplicar transformação diretamente
    img.style.transform = `scale(${size}) translate(${posX}px, ${posY}px) rotate(${rot}deg)`;
    img.style.transition = isDragging ? 'none' : 'transform 0.1s ease';
    
    // Forçar reflow para garantir que a transformação seja aplicada
    void img.offsetHeight;
}

// Configurar arrastar e soltar
let isDragging = false;
let dragMode = 'move'; // 'move', 'resize', 'rotate'
let dragStartX = 0;
let dragStartY = 0;
let initialPositionX = 0;
let initialPositionY = 0;
let initialSize = 1;
let initialRotation = 0;

function setupDragAndDrop(img) {
    // Remover event listeners anteriores se existirem
    const newImg = img.cloneNode(true);
    img.parentNode.replaceChild(newImg, img);
    
    newImg.addEventListener('mousedown', startDrag, { passive: false });
    newImg.addEventListener('touchstart', startDragTouch, { passive: false });
    
    function startDrag(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Determinar modo baseado nas teclas pressionadas
        if (e.shiftKey) {
            dragMode = 'resize';
            newImg.style.cursor = 'nwse-resize';
        } else if (e.ctrlKey || e.metaKey) {
            dragMode = 'rotate';
            newImg.style.cursor = 'grab';
        } else {
            dragMode = 'move';
            newImg.style.cursor = 'grabbing';
        }
        
        isDragging = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        initialPositionX = glassesPositionX;
        initialPositionY = glassesPositionY;
        initialSize = glassesSize;
        initialRotation = glassesRotation;
        
        document.addEventListener('mousemove', drag, { passive: false });
        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('keydown', checkModifierKeys);
        document.addEventListener('keyup', checkModifierKeys);
    }
    
    let initialTouchAngle = 0;
    let initialTouchDistance = 0;
    let lastPinchDistance = 0;
    let isPinching = false;
    let pinchStartTime = 0;
    
    function startDragTouch(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Para touch, usar gestos: 1 dedo = mover, 2 dedos = redimensionar/rotacionar
        if (e.touches.length === 2) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            
            // Calcular distância inicial
            initialTouchDistance = Math.sqrt(
                Math.pow(touch2.clientX - touch1.clientX, 2) +
                Math.pow(touch2.clientY - touch1.clientY, 2)
            );
            lastPinchDistance = initialTouchDistance;
            
            // Calcular ângulo inicial para rotação
            initialTouchAngle = Math.atan2(
                touch2.clientY - touch1.clientY,
                touch2.clientX - touch1.clientX
            );
            
            dragStartX = initialTouchDistance;
            dragMode = 'resize'; // Começar com resize, pode mudar para rotate
            isPinching = true;
            pinchStartTime = Date.now();
        } else {
            dragMode = 'move';
            dragStartX = e.touches[0].clientX;
            dragStartY = e.touches[0].clientY;
            isPinching = false;
        }
        
        isDragging = true;
        initialPositionX = glassesPositionX;
        initialPositionY = glassesPositionY;
        initialSize = glassesSize;
        initialRotation = glassesRotation;
        
        document.addEventListener('touchmove', dragTouch, { passive: false });
        document.addEventListener('touchend', stopDrag);
    }
    
    function checkModifierKeys(e) {
        if (!isDragging) return;
        const currentImg = document.getElementById('glassesImage');
        if (!currentImg) return;
        
        if (e.shiftKey) {
            dragMode = 'resize';
            currentImg.style.cursor = 'nwse-resize';
        } else if (e.ctrlKey || e.metaKey) {
            dragMode = 'rotate';
            currentImg.style.cursor = 'grab';
        } else {
            dragMode = 'move';
            currentImg.style.cursor = 'grabbing';
        }
    }
    
    function drag(e) {
        if (!isDragging) return;
        e.preventDefault();
        
        const deltaX = e.clientX - dragStartX;
        const deltaY = e.clientY - dragStartY;
        
        // Atualizar modo se teclas mudarem
        if (e.shiftKey && dragMode !== 'resize') {
            dragMode = 'resize';
            const currentImg = document.getElementById('glassesImage');
            if (currentImg) currentImg.style.cursor = 'nwse-resize';
        } else if ((e.ctrlKey || e.metaKey) && dragMode !== 'rotate') {
            dragMode = 'rotate';
            const currentImg = document.getElementById('glassesImage');
            if (currentImg) currentImg.style.cursor = 'grab';
        } else if (!e.shiftKey && !e.ctrlKey && !e.metaKey && dragMode !== 'move') {
            dragMode = 'move';
            const currentImg = document.getElementById('glassesImage');
            if (currentImg) currentImg.style.cursor = 'grabbing';
        }
        
        const sourceRect = isUsingImage ? uploadedImageEl.getBoundingClientRect() : video.getBoundingClientRect();
        let sourceWidth = isUsingImage ? (uploadedImageEl.naturalWidth || sourceRect.width) : video.videoWidth;
        let sourceHeight = isUsingImage ? (uploadedImageEl.naturalHeight || sourceRect.height) : video.videoHeight;
        
        // Se não tiver dimensões naturais, usar as dimensões do display
        if (isUsingImage && (!sourceWidth || !sourceHeight || sourceWidth === 0 || sourceHeight === 0)) {
            sourceWidth = sourceRect.width;
            sourceHeight = sourceRect.height;
        }
        
        const sourceAspect = sourceWidth / sourceHeight;
        const displayAspect = sourceRect.width / sourceRect.height;
        
        let scaleFactor;
        if (displayAspect > sourceAspect) {
            scaleFactor = sourceRect.height / sourceHeight;
        } else {
            scaleFactor = sourceRect.width / sourceWidth;
        }
        
        if (dragMode === 'move') {
            glassesPositionX = initialPositionX + (deltaX / scaleFactor);
            glassesPositionY = initialPositionY + (deltaY / scaleFactor);
            
            glassesPositionX = Math.max(-150, Math.min(150, glassesPositionX));
            glassesPositionY = Math.max(-150, Math.min(150, glassesPositionY));
            
            positionXSlider.value = glassesPositionX;
            positionYSlider.value = glassesPositionY;
            positionXValue.textContent = Math.round(glassesPositionX) + 'px';
            positionYValue.textContent = Math.round(glassesPositionY) + 'px';
        } else if (dragMode === 'resize') {
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const direction = deltaY > 0 ? 1 : -1;
            // Reduzida sensibilidade de 0.01 para 0.005
            glassesSize = Math.max(0.3, Math.min(3, initialSize + (distance * direction * 0.005)));
            
            sizeSlider.value = glassesSize;
            sizeValue.textContent = Math.round(glassesSize * 100) + '%';
        } else if (dragMode === 'rotate') {
            const centerX = sourceRect.left + sourceRect.width / 2;
            const centerY = sourceRect.top + sourceRect.height / 2;
            const angle1 = Math.atan2(dragStartY - centerY, dragStartX - centerX);
            const angle2 = Math.atan2(e.clientY - centerY, e.clientX - centerX);
            glassesRotation = initialRotation + ((angle2 - angle1) * 180 / Math.PI);
            
            glassesRotation = Math.max(-180, Math.min(180, glassesRotation));
            
            rotationSlider.value = glassesRotation;
            rotationValue.textContent = Math.round(glassesRotation) + '°';
            syncMobileControls();
        }
        
        updateGlassesOverlay();
    }
    
    function dragTouch(e) {
        if (!isDragging) return;
        e.preventDefault();
        
        if (e.touches.length === 2) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            
            // Calcular distância atual
            const currentDistance = Math.sqrt(
                Math.pow(touch2.clientX - touch1.clientX, 2) +
                Math.pow(touch2.clientY - touch1.clientY, 2)
            );
            
            // Calcular ângulo atual
            const currentAngle = Math.atan2(
                touch2.clientY - touch1.clientY,
                touch2.clientX - touch1.clientX
            );
            
            // Calcular mudanças
            const angleChangeDeg = Math.abs((currentAngle - initialTouchAngle) * 180 / Math.PI);
            const distanceChange = Math.abs(currentDistance - initialTouchDistance);
            const distanceChangeFromLast = Math.abs(currentDistance - lastPinchDistance);
            
            // Detectar se é rotação ou redimensionamento baseado no gesto dominante
            // Se a mudança de ângulo for significativa E a mudança de distância for pequena, é rotação
            // Caso contrário, é zoom (pinch)
            // Ajustar thresholds para melhor detecção
            const timeSinceStart = Date.now() - pinchStartTime;
            const isRotationGesture = angleChangeDeg > 8 && distanceChange < 40;
            // Tornar zoom mais sensível, especialmente no início do gesto
            const zoomThreshold = timeSinceStart < 200 ? 8 : 12; // Mais sensível nos primeiros 200ms
            const isZoomGesture = distanceChange > zoomThreshold || (distanceChangeFromLast > 3 && !isRotationGesture);
            
            if (isRotationGesture && !isZoomGesture) {
                // Rotação pura
                const rotationChange = (currentAngle - initialTouchAngle) * 180 / Math.PI;
                glassesRotation = initialRotation + rotationChange;
                glassesRotation = Math.max(-180, Math.min(180, glassesRotation));
                
                rotationSlider.value = glassesRotation;
                rotationValue.textContent = Math.round(glassesRotation) + '°';
                syncMobileControls();
            } else if (isZoomGesture) {
                // Zoom/Pinch - melhorado para ser mais responsivo e suave
                // Usar razão de distância para zoom mais preciso e natural
                const scaleRatio = currentDistance / initialTouchDistance;
                let newSize = initialSize * scaleRatio;
                
                // Aplicar limites com suavização
                newSize = Math.max(0.3, Math.min(3, newSize));
                
                // Suavizar mudanças muito pequenas para evitar tremulação
                if (Math.abs(newSize - glassesSize) > 0.01) {
                    glassesSize = newSize;
                    
                    sizeSlider.value = glassesSize;
                    sizeValue.textContent = Math.round(glassesSize * 100) + '%';
                    syncMobileControls();
                }
                
                // Atualizar última distância para suavizar o zoom contínuo
                lastPinchDistance = currentDistance;
            }
            
            // Se ambos os gestos estão acontecendo, priorizar zoom mas permitir rotação leve
            if (isZoomGesture && angleChangeDeg > 2 && angleChangeDeg < 10) {
                const rotationChange = (currentAngle - initialTouchAngle) * 180 / Math.PI * 0.3; // Reduzir sensibilidade quando combinado
                glassesRotation = initialRotation + rotationChange;
                glassesRotation = Math.max(-180, Math.min(180, glassesRotation));
                
                rotationSlider.value = glassesRotation;
                rotationValue.textContent = Math.round(glassesRotation) + '°';
                syncMobileControls();
            }
            
            updateGlassesOverlay();
        } else {
            // Um dedo para mover
            const deltaX = e.touches[0].clientX - dragStartX;
            const deltaY = e.touches[0].clientY - dragStartY;
            
            const sourceRect = isUsingImage ? uploadedImageEl.getBoundingClientRect() : video.getBoundingClientRect();
            let sourceWidth = isUsingImage ? (uploadedImageEl.naturalWidth || sourceRect.width) : video.videoWidth;
            let sourceHeight = isUsingImage ? (uploadedImageEl.naturalHeight || sourceRect.height) : video.videoHeight;
            
            // Se não tiver dimensões naturais, usar as dimensões do display
            if (isUsingImage && (!sourceWidth || !sourceHeight || sourceWidth === 0 || sourceHeight === 0)) {
                sourceWidth = sourceRect.width;
                sourceHeight = sourceRect.height;
            }
            
            const sourceAspect = sourceWidth / sourceHeight;
            const displayAspect = sourceRect.width / sourceRect.height;
            
            let scaleFactor;
            if (displayAspect > sourceAspect) {
                scaleFactor = sourceRect.height / sourceHeight;
            } else {
                scaleFactor = sourceRect.width / sourceWidth;
            }
            
            glassesPositionX = initialPositionX + (deltaX / scaleFactor);
            glassesPositionY = initialPositionY + (deltaY / scaleFactor);
            
            glassesPositionX = Math.max(-150, Math.min(150, glassesPositionX));
            glassesPositionY = Math.max(-150, Math.min(150, glassesPositionY));
            
            positionXSlider.value = glassesPositionX;
            positionYSlider.value = glassesPositionY;
            positionXValue.textContent = Math.round(glassesPositionX) + 'px';
            positionYValue.textContent = Math.round(glassesPositionY) + 'px';
            
            syncMobileControls();
            updateGlassesOverlay();
        }
    }
    
    function stopDrag() {
        if (!isDragging) return;
        isDragging = false;
        isPinching = false;
        lastPinchDistance = 0;
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', stopDrag);
        document.removeEventListener('touchmove', dragTouch);
        document.removeEventListener('touchend', stopDrag);
        document.removeEventListener('keydown', checkModifierKeys);
        document.removeEventListener('keyup', checkModifierKeys);
        
        const currentImg = document.getElementById('glassesImage');
        if (currentImg) {
            currentImg.style.cursor = 'move';
        }
    }
}

// Configurar event listeners
function setupEventListeners() {
    startBtn.addEventListener('click', startCamera);
    stopBtn.addEventListener('click', stopCamera);
    
    uploadImageInput.addEventListener('change', handleImageUpload);
    removeImageBtn.addEventListener('click', removeUploadedImage);
    removeGlassesBtn.addEventListener('click', removeGlassesFromImage);
    
    sizeSlider.addEventListener('input', (e) => {
        glassesSize = parseFloat(e.target.value);
        sizeValue.textContent = Math.round(glassesSize * 100) + '%';
        syncMobileControls();
        updateGlassesOverlay();
    });
    
    positionXSlider.addEventListener('input', (e) => {
        glassesPositionX = parseInt(e.target.value);
        positionXValue.textContent = glassesPositionX + 'px';
        syncMobileControls();
        updateGlassesOverlay();
    });
    
    positionYSlider.addEventListener('input', (e) => {
        glassesPositionY = parseInt(e.target.value);
        positionYValue.textContent = glassesPositionY + 'px';
        syncMobileControls();
        updateGlassesOverlay();
    });
    
    // Atualizar limites dos sliders para corresponder ao arrastar
    positionXSlider.min = -150;
    positionXSlider.max = 150;
    positionYSlider.min = -150;
    positionYSlider.max = 150;
    
    rotationSlider.addEventListener('input', (e) => {
        glassesRotation = parseInt(e.target.value);
        rotationValue.textContent = glassesRotation + '°';
        syncMobileControls();
        updateGlassesOverlay();
    });
}

// Iniciar câmera
async function startCamera() {
    try {
        // Se houver imagem carregada, remover primeiro
        if (isUsingImage) {
            removeUploadedImage();
        }
        
        stream = await navigator.mediaDevices.getUserMedia({
            video: { 
                facingMode: 'user',
                width: { ideal: 640 },
                height: { ideal: 480 }
            }
        });
        
        video.srcObject = stream;
        video.style.display = 'block';
        uploadedImageEl.style.display = 'none';
        isUsingImage = false;
        
        startBtn.disabled = true;
        stopBtn.disabled = false;
        
        // Selecionar primeiro óculos por padrão
        if (!currentGlasses && glassesModels.length > 0) {
            const firstItem = document.querySelectorAll('.glasses-item')[0];
            selectGlasses(glassesModels[0], firstItem);
        }
        
        // Habilitar botão de remover óculos se houver óculos selecionado
        if (currentGlasses) {
            removeGlassesBtn.disabled = false;
        }
    } catch (error) {
        console.error('Erro ao acessar a câmera:', error);
        alert('Não foi possível acessar a câmera. Por favor, verifique as permissões.');
    }
}

// Parar câmera
function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
        video.srcObject = null;
        video.style.display = 'none';
        overlay.innerHTML = '';
        startBtn.disabled = false;
        stopBtn.disabled = true;
    }
}

// Lidar com upload de imagem
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Parar câmera se estiver ativa
    if (stream) {
        stopCamera();
    }
    
    const reader = new FileReader();
    reader.onload = function(event) {
        uploadedImage = event.target.result;
        uploadedImageEl.src = uploadedImage;
        uploadedImageEl.style.display = 'block';
        video.style.display = 'none';
        isUsingImage = true;
        
        removeImageBtn.style.display = 'inline-block';
        
        // Selecionar primeiro óculos por padrão se não houver
        if (!currentGlasses && glassesModels.length > 0) {
            const firstItem = document.querySelectorAll('.glasses-item')[0];
            selectGlasses(glassesModels[0], firstItem);
        } else if (currentGlasses) {
            // Atualizar overlay se já houver óculos selecionado
            updateGlassesOverlay();
            removeGlassesBtn.disabled = false;
        }
    };
    reader.readAsDataURL(file);
}

// Remover imagem carregada
function removeUploadedImage() {
    uploadedImage = null;
    uploadedImageEl.src = '';
    uploadedImageEl.style.display = 'none';
    isUsingImage = false;
    overlay.innerHTML = '';
    removeImageBtn.style.display = 'none';
    uploadImageInput.value = '';
}


// Inicializar quando a página carregar
init();

