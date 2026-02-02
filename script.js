// Get all DOM elements
const imageUpload = document.getElementById('imageUpload');
const previewImg = document.getElementById('previewImg');
const imagePreview = document.getElementById('imagePreview');
const noImageText = imagePreview.querySelector('.no-image');
const addButtons = document.querySelector('.add-buttons');
const positionControl = document.getElementById('positionControl');

const addToCircleBtn = document.getElementById('addToCircleBtn');
const addToHexadecagonBtn = document.getElementById('addToHexadecagonBtn');
const addToFlowerBtn = document.getElementById('addToFlowerBtn');

const posLeftBtn = document.getElementById('posLeftBtn');
const posRightBtn = document.getElementById('posRightBtn');

const circleZone = document.getElementById('circleZone');
const hexadecagonZone = document.getElementById('hexadecagonZone');
const flowerZone = document.getElementById('flowerZone');

const teluguText = document.getElementById('teluguText');
const imageSize = document.getElementById('imageSize');
const sizeValue = document.getElementById('sizeValue');
const resultContainer = document.getElementById('resultContainer');
const downloadBtn = document.getElementById('downloadBtn');
const sizeModal = document.getElementById('sizeModal');
const closeModal = document.getElementById('closeModal');
const sizeOptionBtns = document.querySelectorAll('.size-option-btn');
const screenshotWarning = document.getElementById('screenshotWarning');

// Store current state
let currentImageSrc = null;
let currentShape = null;
let currentSize = 100;
let currentPos = 'left'; // Default to left
let dominantColor = '#667eea';

// POLYGON STRINGS
const hexadecagonPoly = 'polygon(50% 0%, 69% 4%, 85% 15%, 96% 31%, 100% 50%, 96% 69%, 85% 85%, 69% 96%, 50% 100%, 31% 96%, 15% 85%, 4% 69%, 0% 50%, 4% 31%, 15% 15%, 31% 4%)';
const flowerPoly = 'polygon(50% 0%, 56% 12%, 60% 2%, 65% 13%, 69% 4%, 73% 16%, 77% 8%, 80% 20%, 85% 15%, 85% 26%, 92% 23%, 89% 34%, 98% 33%, 91% 42%, 100% 44%, 91% 51%, 98% 57%, 89% 60%, 92% 69%, 85% 68%, 85% 78%, 78% 74%, 75% 86%, 69% 79%, 64% 91%, 60% 82%, 54% 93%, 50% 84%, 46% 93%, 40% 82%, 36% 91%, 31% 79%, 25% 86%, 22% 74%, 15% 78%, 15% 68%, 8% 69%, 11% 60%, 2% 57%, 9% 51%, 0% 44%, 9% 42%, 2% 33%, 11% 34%, 8% 23%, 15% 26%, 15% 15%, 20% 20%, 23% 8%, 27% 16%, 31% 4%, 35% 13%, 40% 2%, 44% 12%)';

// Initialize ColorThief
const colorThief = new ColorThief();

// ============================================
// SAFE SECURITY LOGIC (Allows Typing)
// ============================================

// 1. Disable Right Click
document.addEventListener('contextmenu', event => {
    event.preventDefault();
});

// 2. Detect Keyboard Shortcuts (PrintScreen / Snipping)
document.addEventListener('keydown', (e) => {
    if (e.key === 'PrintScreen') {
        try { navigator.clipboard.writeText(''); } catch(err) {}
        showSecurityWarning();
    }
    // Windows Snipping Tool (Win+Shift+S)
    if (e.metaKey && e.shiftKey && e.key === 'S') { 
        showSecurityWarning();
    }
    // Prevent Printing and Saving
    if (e.ctrlKey && (e.key === 'p' || e.key === 's' || e.key === 'u')) {
        e.preventDefault();
        showSecurityWarning();
    }
});

function showSecurityWarning() {
    if(screenshotWarning) {
        screenshotWarning.style.display = 'flex';
        setTimeout(hideSecurityWarning, 2000);
    }
}

function hideSecurityWarning() {
    if(screenshotWarning) {
        screenshotWarning.style.display = 'none';
    }
}

// ============================================
// APP LOGIC
// ============================================

// IMAGE UPLOAD
imageUpload.addEventListener('change', function(e) {
    const file = e.target.files[0];
    
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        
        reader.onload = function(event) {
            currentImageSrc = event.target.result;
            previewImg.src = currentImageSrc;
            previewImg.classList.add('visible');
            noImageText.classList.add('hidden');
            
            addButtons.style.display = 'flex';
            
            previewImg.onload = function() {
                try {
                    const color = colorThief.getColor(previewImg);
                    dominantColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
                } catch (error) {
                    console.log('Using default color');
                    dominantColor = '#667eea';
                }
            };
        };
        
        reader.readAsDataURL(file);
    }
});

// SHAPE BUTTONS
addToCircleBtn.addEventListener('click', () => setShape('circle', circleZone));
addToHexadecagonBtn.addEventListener('click', () => setShape('hexadecagon', hexadecagonZone));
addToFlowerBtn.addEventListener('click', () => setShape('flower', flowerZone));

function setShape(shape, zone) {
    if (currentImageSrc) {
        clearAllShapes();
        currentShape = shape;
        placeImageInShape(zone, shape);
        // Show position controls
        positionControl.style.display = 'block';
        updatePreview();
    }
}

// POSITION CONTROL (Left/Right)
posLeftBtn.addEventListener('click', () => {
    currentPos = 'left';
    posLeftBtn.classList.add('active');
    posRightBtn.classList.remove('active');
    updatePreview();
});

posRightBtn.addEventListener('click', () => {
    currentPos = 'right';
    posRightBtn.classList.add('active');
    posLeftBtn.classList.remove('active');
    updatePreview();
});


function clearAllShapes() {
    circleZone.innerHTML = '<div class="circle-preview"><span class="drop-text">⭕</span></div>';
    hexadecagonZone.innerHTML = '<div class="hexadecagon-preview"><span class="drop-text">⚙️</span></div>';
    flowerZone.innerHTML = '<div class="flower-preview"><span class="drop-text">🌸</span></div>';
    
    circleZone.classList.remove('has-image');
    hexadecagonZone.classList.remove('has-image');
    flowerZone.classList.remove('has-image');
}

function placeImageInShape(zone, shape) {
    let poly = '';
    if (shape === 'hexadecagon') poly = hexadecagonPoly;
    else if (shape === 'flower') poly = flowerPoly;

    const clipStyle = shape === 'circle' ? `border-radius: 50%;` : `clip-path: ${poly};`;
    
    zone.innerHTML = `
        <div style="width: ${currentSize}px; height: ${currentSize}px; 
                    background: ${dominantColor}; 
                    display: flex; justify-content: center; align-items: center; 
                    ${clipStyle}">
            <img src="${currentImageSrc}" 
                 alt="Image"
                 style="width: 100%; height: 100%; object-fit: cover; 
                        transform: scale(0.92); 
                        ${clipStyle}">
        </div>
    `;
    zone.classList.add('has-image');
}

// SIZE CONTROL
imageSize.addEventListener('input', function(e) {
    currentSize = e.target.value;
    sizeValue.textContent = currentSize + 'px';
    
    if (currentShape) {
        let zone;
        if(currentShape === 'circle') zone = circleZone;
        else if(currentShape === 'hexadecagon') zone = hexadecagonZone;
        else if(currentShape === 'flower') zone = flowerZone;
        placeImageInShape(zone, currentShape);
    }
    updatePreview();
});

// TEXT INPUT
teluguText.addEventListener('input', updatePreview);

// UPDATE PREVIEW
function updatePreview() {
    const text = teluguText.value.trim();
    
    if (!currentShape || !currentImageSrc || !text) {
        resultContainer.innerHTML = '<p class="placeholder">Choose image and add to shape</p>';
        downloadBtn.style.display = 'none';
        return;
    }
    
    const wrapper = createShapeWrapper(currentSize, currentShape, currentImageSrc, dominantColor, currentPos);
    
    resultContainer.innerHTML = '';
    resultContainer.appendChild(wrapper);
    resultContainer.appendChild(document.createTextNode(text));
    
    downloadBtn.style.display = 'block';
}

// Helper to create the shape DOM structure
function createShapeWrapper(size, shape, src, color, pos) {
    const div = document.createElement('div');
    const img = document.createElement('img');
    
    div.style.width = size + 'px';
    div.style.height = size + 'px';
    div.style.background = color;
    
    // POSITION LOGIC (Left vs Right)
    div.style.float = pos; 
    
    // Add margins based on side to prevent text sticking
    if (pos === 'left') {
        div.style.margin = '0 15px 5px 0';
    } else {
        div.style.margin = '0 0 5px 15px';
    }

    div.style.display = 'flex';
    div.style.justifyContent = 'center';
    div.style.alignItems = 'center';
    
    img.src = src;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    img.style.transform = 'scale(0.92)';
    
    if (shape === 'circle') {
        div.style.borderRadius = '50%';
        div.style.shapeOutside = 'circle(50%)';
        div.style.webkitShapeOutside = 'circle(50%)';
        img.style.borderRadius = '50%';
    } else {
        const poly = shape === 'hexadecagon' ? hexadecagonPoly : flowerPoly;
        div.style.clipPath = poly;
        div.style.webkitClipPath = poly;
        div.style.shapeOutside = poly;
        div.style.webkitShapeOutside = poly;
        img.style.clipPath = poly;
        img.style.webkitClipPath = poly;
    }
    
    div.appendChild(img);
    return div;
}

// MODAL HANDLING
downloadBtn.addEventListener('click', function() {
    sizeModal.classList.add('show');
});

closeModal.addEventListener('click', function() {
    sizeModal.classList.remove('show');
});

sizeModal.addEventListener('click', function(e) {
    if (e.target === sizeModal) {
        sizeModal.classList.remove('show');
    }
});

// DOWNLOAD HANDLERS
sizeOptionBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        const type = this.dataset.type;
        sizeModal.classList.remove('show');
        
        if (type === 'auto') {
            downloadAutoSize();
        } else {
            const width = parseInt(this.dataset.width);
            const height = parseInt(this.dataset.height);
            downloadWithSize(width, height);
        }
    });
});

async function downloadAutoSize() {
    downloadBtn.disabled = true;
    downloadBtn.textContent = 'Processing...';
    
    try {
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const dataUrl = await htmlToImage.toPng(resultContainer, {
            backgroundColor: '#ffffff',
            pixelRatio: 3,
            style: {
                fontFamily: "'Noto Sans Telugu', sans-serif"
            }
        });
        
        triggerDownload(dataUrl, `auto`);
        
    } catch (error) {
        console.error('Download failed:', error);
        alert('Download failed. Please try again.');
        downloadBtn.disabled = false;
        downloadBtn.textContent = '⬇️ Download';
    }
}

async function downloadWithSize(width, height) {
    downloadBtn.disabled = true;
    downloadBtn.textContent = 'Processing...';
    
    try {
        const imageCircleSize = Math.min(width, height) * 0.35;
        const fontSize = width * 0.024;
        
        const tempContainer = document.createElement('div');
        tempContainer.style.width = width + 'px';
        tempContainer.style.height = height + 'px';
        
        // Use z-index to keep on screen but hidden (fixes blank download)
        tempContainer.style.position = 'fixed'; 
        tempContainer.style.left = '0';
        tempContainer.style.top = '0';
        tempContainer.style.zIndex = '-9999'; 
        
        tempContainer.style.background = '#ffffff';
        tempContainer.style.padding = '40px';
        tempContainer.style.boxSizing = 'border-box';
        tempContainer.style.fontFamily = "'Noto Sans Telugu', sans-serif";
        tempContainer.style.fontSize = fontSize + 'px';
        tempContainer.style.lineHeight = '1.8';
        tempContainer.style.color = '#333';
        tempContainer.style.textAlign = 'justify';
        
        // Create wrapper with current position (left/right)
        const wrapper = createShapeWrapper(imageCircleSize, currentShape, currentImageSrc, dominantColor, currentPos);
        
        // Scale margins for download
        if (currentPos === 'left') {
            wrapper.style.margin = `0 ${fontSize * 1.2}px ${fontSize * 0.5}px 0`;
        } else {
            wrapper.style.margin = `0 0 ${fontSize * 0.5}px ${fontSize * 1.2}px`;
        }
        
        tempContainer.appendChild(wrapper);
        tempContainer.appendChild(document.createTextNode(teluguText.value));
        
        document.body.appendChild(tempContainer);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const dataUrl = await htmlToImage.toPng(tempContainer, {
            backgroundColor: '#ffffff',
            width: width,
            height: height,
            pixelRatio: 1, 
            style: {
                 fontFamily: "'Noto Sans Telugu', sans-serif"
            }
        });
        
        document.body.removeChild(tempContainer);
        triggerDownload(dataUrl, `${width}x${height}`);
        
    } catch (error) {
        console.error('Download failed:', error);
        alert('Download failed. Please try again.');
        downloadBtn.disabled = false;
        downloadBtn.textContent = '⬇️ Download';
    }
}

function triggerDownload(dataUrl, suffix) {
    const link = document.createElement('a');
    const timestamp = new Date().getTime();
    
    link.download = `telugu-text-wrap-${currentShape}-${suffix}-${timestamp}.png`;
    link.href = dataUrl;
    link.click();
    
    downloadBtn.disabled = false;
    downloadBtn.textContent = '⬇️ Download';
}

// FONTS LOAD
window.addEventListener('load', function() {
    if (document.fonts) {
        document.fonts.ready.then(function() {
            console.log('Telugu fonts loaded successfully');
        });
    }
});