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
const captureBtn = document.getElementById('captureBtn');
const uploadImageInput = document.getElementById('uploadImage');
const removeImageBtn = document.getElementById('removeImageBtn');
const removeGlassesBtn = document.getElementById('removeGlassesBtn');
const glassesGallery = document.getElementById('glassesGallery');
const photosGallery = document.getElementById('photosGallery');
const gallerySection = document.getElementById('gallerySection');

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
    // Carregar modelos de óculos
    glassesModels = await loadGlassesModels();
    renderGlassesGallery();
    setupEventListeners();
    loadSavedPhotos();
    setupMobileControls();
}

// Configurar controles mobile
function setupMobileControls() {
    const isMobile = window.innerWidth <= 768;
    
    // Esconder controles normais no mobile
    const settingsSection = document.querySelector('.settings-section');
    if (settingsSection) {
        settingsSection.style.display = isMobile ? 'none' : 'block';
    }
    
    // Configurar controles da barra lateral
    setupSideControls();
}

// Configurar controles da barra lateral mobile
function setupSideControls() {
    const isMobile = window.innerWidth <= 768;
    const toggleBtn = document.getElementById('mobileControlsToggleBtn');
    const panel = document.getElementById('mobileControlsPanel');
    const closeBtn = document.getElementById('closePanelBtn');
    
    if (!toggleBtn || !panel) return;
    
    // Mostrar botão apenas no mobile
    if (isMobile) {
        toggleBtn.style.display = 'flex';
    } else {
        toggleBtn.style.display = 'none';
        panel.classList.remove('active');
        return;
    }
    
    // Toggle do painel
    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        panel.classList.toggle('active');
    });
    
    // Fechar painel
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            panel.classList.remove('active');
        });
    }
    
    // Fechar ao clicar fora
    document.addEventListener('click', (e) => {
        if (panel.classList.contains('active') && 
            !panel.contains(e.target) && 
            !toggleBtn.contains(e.target)) {
            panel.classList.remove('active');
        }
    });
    
    // Botões de tamanho
    const sizeDownBtn = document.getElementById('sizeDownBtn');
    const sizeUpBtn = document.getElementById('sizeUpBtn');
    const panelSizeValue = document.getElementById('panelSizeValue');
    
    if (sizeDownBtn) {
        sizeDownBtn.addEventListener('click', () => {
            glassesSize = Math.max(0.3, glassesSize - 0.1);
            sizeSlider.value = glassesSize;
            sizeValue.textContent = Math.round(glassesSize * 100) + '%';
            if (panelSizeValue) panelSizeValue.textContent = Math.round(glassesSize * 100) + '%';
            syncMobileControls();
            updateGlassesOverlay();
        });
    }
    
    if (sizeUpBtn) {
        sizeUpBtn.addEventListener('click', () => {
            glassesSize = Math.min(3, glassesSize + 0.1);
            sizeSlider.value = glassesSize;
            sizeValue.textContent = Math.round(glassesSize * 100) + '%';
            if (panelSizeValue) panelSizeValue.textContent = Math.round(glassesSize * 100) + '%';
            syncMobileControls();
            updateGlassesOverlay();
        });
    }
    
    // Botões de movimento
    const moveUpBtn = document.getElementById('moveUpBtn');
    const moveDownBtn = document.getElementById('moveDownBtn');
    const moveLeftBtn = document.getElementById('moveLeftBtn');
    const moveRightBtn = document.getElementById('moveRightBtn');
    
    const moveStep = 5; // Pixels por clique
    
    if (moveUpBtn) {
        moveUpBtn.addEventListener('click', () => {
            glassesPositionY = Math.max(-150, glassesPositionY - moveStep);
            positionYSlider.value = glassesPositionY;
            positionYValue.textContent = glassesPositionY + 'px';
            syncMobileControls();
            updateGlassesOverlay();
        });
    }
    
    if (moveDownBtn) {
        moveDownBtn.addEventListener('click', () => {
            glassesPositionY = Math.min(150, glassesPositionY + moveStep);
            positionYSlider.value = glassesPositionY;
            positionYValue.textContent = glassesPositionY + 'px';
            syncMobileControls();
            updateGlassesOverlay();
        });
    }
    
    if (moveLeftBtn) {
        moveLeftBtn.addEventListener('click', () => {
            glassesPositionX = Math.max(-150, glassesPositionX - moveStep);
            positionXSlider.value = glassesPositionX;
            positionXValue.textContent = glassesPositionX + 'px';
            syncMobileControls();
            updateGlassesOverlay();
        });
    }
    
    if (moveRightBtn) {
        moveRightBtn.addEventListener('click', () => {
            glassesPositionX = Math.min(150, glassesPositionX + moveStep);
            positionXSlider.value = glassesPositionX;
            positionXValue.textContent = glassesPositionX + 'px';
            syncMobileControls();
            updateGlassesOverlay();
        });
    }
    
    // Botões de rotação
    const rotateLeftBtn = document.getElementById('rotateLeftBtn');
    const rotateRightBtn = document.getElementById('rotateRightBtn');
    const panelRotValue = document.getElementById('panelRotValue');
    
    if (rotateLeftBtn) {
        rotateLeftBtn.addEventListener('click', () => {
            glassesRotation = Math.max(-180, glassesRotation - 5);
            rotationSlider.value = glassesRotation;
            rotationValue.textContent = glassesRotation + '°';
            if (panelRotValue) panelRotValue.textContent = glassesRotation + '°';
            syncMobileControls();
            updateGlassesOverlay();
        });
    }
    
    if (rotateRightBtn) {
        rotateRightBtn.addEventListener('click', () => {
            glassesRotation = Math.min(180, glassesRotation + 5);
            rotationSlider.value = glassesRotation;
            rotationValue.textContent = glassesRotation + '°';
            if (panelRotValue) panelRotValue.textContent = glassesRotation + '°';
            syncMobileControls();
            updateGlassesOverlay();
        });
    }
    
    // Atualizar valores iniciais
    if (panelSizeValue) panelSizeValue.textContent = Math.round(glassesSize * 100) + '%';
    if (panelRotValue) panelRotValue.textContent = glassesRotation + '°';
    
    // Sincronizar quando valores mudarem via syncMobileControls
    const originalSync = syncMobileControls;
    window.syncMobileControls = function() {
        originalSync();
        if (panelSizeValue) panelSizeValue.textContent = Math.round(glassesSize * 100) + '%';
        if (panelRotValue) panelRotValue.textContent = glassesRotation + '°';
    };
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
        overlay.innerHTML = '';
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
    
    // Atualizar transformação
    img.style.transform = `
        scale(${glassesSize})
        translate(${glassesPositionX}px, ${glassesPositionY}px)
        rotate(${glassesRotation}deg)
    `;
    img.style.transition = isDragging ? 'none' : 'transform 0.1s ease';
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
            
            // Calcular ângulo inicial para rotação
            initialTouchAngle = Math.atan2(
                touch2.clientY - touch1.clientY,
                touch2.clientX - touch1.clientX
            );
            
            dragStartX = initialTouchDistance;
            dragMode = 'resize'; // Começar com resize, pode mudar para rotate
        } else {
            dragMode = 'move';
            dragStartX = e.touches[0].clientX;
            dragStartY = e.touches[0].clientY;
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
            
            // Detectar se é rotação ou redimensionamento
            const angleChangeDeg = Math.abs((currentAngle - initialTouchAngle) * 180 / Math.PI);
            const distanceChange = Math.abs(currentDistance - initialTouchDistance);
            
            // Se mudança de ângulo for significativa, é rotação
            if (angleChangeDeg > 3 && distanceChange < 80) {
                // Rotação
                const rotationChange = (currentAngle - initialTouchAngle) * 180 / Math.PI;
                glassesRotation = initialRotation + rotationChange;
                glassesRotation = Math.max(-180, Math.min(180, glassesRotation));
                
                rotationSlider.value = glassesRotation;
                rotationValue.textContent = Math.round(glassesRotation) + '°';
                syncMobileControls();
            } else if (distanceChange > 10) {
                // Redimensionamento (só se distância mudou significativamente)
                const scaleChange = (currentDistance - initialTouchDistance) * 0.0008;
                glassesSize = Math.max(0.3, Math.min(3, initialSize + scaleChange));
                
                sizeSlider.value = glassesSize;
                sizeValue.textContent = Math.round(glassesSize * 100) + '%';
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
    captureBtn.addEventListener('click', capturePhoto);
    
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
        captureBtn.disabled = false;
        
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
        captureBtn.disabled = true;
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
        
        // Habilitar captura
        captureBtn.disabled = false;
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
    captureBtn.disabled = true;
    uploadImageInput.value = '';
}

// Capturar foto
function capturePhoto() {
    if (!stream && !isUsingImage) return;
    
    // Função auxiliar para capturar quando a imagem estiver pronta
    function doCapture() {
        let sourceWidth, sourceHeight;
        
        if (isUsingImage) {
            // Aguardar imagem carregar completamente
            if (!uploadedImageEl.complete || uploadedImageEl.naturalWidth === 0) {
                uploadedImageEl.onload = doCapture;
                return;
            }
            sourceWidth = uploadedImageEl.naturalWidth || uploadedImageEl.width;
            sourceHeight = uploadedImageEl.naturalHeight || uploadedImageEl.height;
        } else {
            sourceWidth = video.videoWidth;
            sourceHeight = video.videoHeight;
        }
        
        if (!sourceWidth || !sourceHeight) {
            alert('Erro: Não foi possível obter as dimensões da imagem/vídeo.');
            return;
        }
        
        canvas.width = sourceWidth;
        canvas.height = sourceHeight;
        
        const ctx = canvas.getContext('2d');
        
        // Desenhar imagem ou vídeo
        if (isUsingImage) {
            ctx.drawImage(uploadedImageEl, 0, 0, canvas.width, canvas.height);
        } else {
            // Desenhar vídeo (espelhado)
            ctx.save();
            ctx.scale(-1, 1);
            ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
            ctx.restore();
        }
        
        // Se não houver óculos, apenas salvar a imagem
        if (!currentGlasses) {
            const dataURL = canvas.toDataURL('image/png');
            savePhoto(dataURL);
            return;
        }
        
        // Desenhar óculos
        const glassesImg = new Image();
        
        // Não usar crossOrigin para arquivos locais
        // glassesImg.crossOrigin = 'anonymous';
        
        glassesImg.onload = function() {
            try {
                ctx.save();
                ctx.translate(canvas.width / 2, canvas.height / 2);
                
                if (!isUsingImage) {
                    ctx.scale(-1, 1); // Espelhar óculos apenas para vídeo
                }
                
                ctx.scale(glassesSize, glassesSize);
                ctx.translate(glassesPositionX, glassesPositionY);
                ctx.rotate((glassesRotation * Math.PI) / 180);
                
                // Calcular dimensões dos óculos
                const baseWidth = canvas.width * 0.6;
                const aspectRatio = glassesImg.height / glassesImg.width;
                const glassesWidth = baseWidth;
                const glassesHeight = baseWidth * aspectRatio;
                
                ctx.drawImage(glassesImg, -glassesWidth / 2, -glassesHeight / 2, glassesWidth, glassesHeight);
                ctx.restore();
                
                // Salvar foto
                const dataURL = canvas.toDataURL('image/png');
                savePhoto(dataURL);
            } catch (error) {
                console.error('Erro ao desenhar óculos:', error);
                alert('Erro ao processar a imagem. Tente novamente.');
            }
        };
        
        glassesImg.onerror = function(e) {
            console.error('Erro ao carregar imagem dos óculos:', currentGlasses.image, e);
            // Tentar carregar novamente sem cache
            const img = new Image();
            img.onload = glassesImg.onload;
            img.onerror = function() {
                alert('Erro ao carregar a imagem dos óculos: ' + currentGlasses.image + '\n\nVerifique se o arquivo existe na pasta.');
            };
            // Adicionar timestamp para evitar cache
            img.src = currentGlasses.image + '?t=' + Date.now();
        };
        
        // Tentar carregar a imagem
        if (currentGlasses && currentGlasses.image) {
            glassesImg.src = currentGlasses.image;
        } else {
            alert('Nenhum óculos selecionado.');
        }
    }
    
    // Iniciar captura
    doCapture();
}

// Salvar foto
function savePhoto(dataURL) {
    const photos = JSON.parse(localStorage.getItem('glassesPhotos') || '[]');
    photos.push(dataURL);
    localStorage.setItem('glassesPhotos', JSON.stringify(photos));
    
    displayPhotos();
}

// Exibir fotos salvas
function displayPhotos() {
    const photos = JSON.parse(localStorage.getItem('glassesPhotos') || '[]');
    
    if (photos.length === 0) {
        gallerySection.style.display = 'none';
        return;
    }
    
    gallerySection.style.display = 'block';
    photosGallery.innerHTML = '';
    
    photos.forEach((photo, index) => {
        const item = document.createElement('div');
        item.className = 'photo-item';
        item.innerHTML = `
            <img src="${photo}" alt="Foto ${index + 1}">
            <button class="delete-btn" onclick="deletePhoto(${index})">×</button>
        `;
        photosGallery.appendChild(item);
    });
}

// Deletar foto
window.deletePhoto = function(index) {
    const photos = JSON.parse(localStorage.getItem('glassesPhotos') || '[]');
    photos.splice(index, 1);
    localStorage.setItem('glassesPhotos', JSON.stringify(photos));
    displayPhotos();
};

// Carregar fotos salvas
function loadSavedPhotos() {
    displayPhotos();
}

// Inicializar quando a página carregar
init();

