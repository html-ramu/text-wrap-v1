// Get all DOM elements
const imageUpload = document.getElementById('imageUpload');
const previewImg = document.getElementById('previewImg');
const imagePreview = document.getElementById('imagePreview');
const noImageText = imagePreview.querySelector('.no-image');
const addButtons = document.querySelector('.add-buttons');

const addToCircleBtn = document.getElementById('addToCircleBtn');
const addToHexadecagonBtn = document.getElementById('addToHexadecagonBtn');
const addToFlowerBtn = document.getElementById('addToFlowerBtn');

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
let dominantColor = '#667eea';
let warningTimeout = null;

// POLYGON STRINGS
const hexadecagonPoly = 'polygon(50% 0%, 69% 4%, 85% 15%, 96% 31%, 100% 50%, 96% 69%, 85% 85%, 69% 96%, 50% 100%, 31% 96%, 15% 85%, 4% 69%, 0% 50%, 4% 31%, 15% 15%, 31% 4%)';
const flowerPoly = 'polygon(50% 0%, 56% 12%, 60% 2%, 65% 13%, 69% 4%, 73% 16%, 77% 8%, 80% 20%, 85% 15%, 85% 26%, 92% 23%, 89% 34%, 98% 33%, 91% 42%, 100% 44%, 91% 51%, 98% 57%, 89% 60%, 92% 69%, 85% 68%, 85% 78%, 78% 74%, 75% 86%, 69% 79%, 64% 91%, 60% 82%, 54% 93%, 50% 84%, 46% 93%, 40% 82%, 36% 91%, 31% 79%, 25% 86%, 22% 74%, 15% 78%, 15% 68%, 8% 69%, 11% 60%, 2% 57%, 9% 51%, 0% 44%, 9% 42%, 2% 33%, 11% 34%, 8% 23%, 15% 26%, 15% 15%, 20% 20%, 23% 8%, 27% 16%, 31% 4%, 35% 13%, 40% 2%, 44% 12%)';

// Initialize ColorThief
const colorThief = new ColorThief();

// ============================================
// ANTI-SCREENSHOT PROTECTION
// ============================================

// Detect 3-finger touch (mobile screenshot gesture)
document.addEventListener('touchstart', (e) => {
    if (e.touches.length >= 3) {
        e.preventDefault();
        showSecurityWarning();
    }
}, { passive: false });

// Disable right-click
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    showSecurityWarning();
});

// Detect keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // PrintScreen
    if (e.key === 'PrintScreen') {
        navigator.clipboard.writeText('');
        showSecurityWarning();
    }
    // Windows Snipping Tool (Win + Shift + S)
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        showSecurityWarning();
    }
    // Prevent Ctrl+P, Ctrl+S, Ctrl+U, Ctrl+C
    if (e.ctrlKey && ['p', 's', 'u', 'c'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        showSecurityWarning();
    }
});

// Mobile app visibility change detection
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
        showSecurityWarning();
    } else {
        hideSecurityWarning();
    }
});

// Window focus/blur detection
window.addEventListener('blur', () => {
    showSecurityWarning();
});

window.addEventListener('focus', () => {
    hideSecurityWarning();
});

// Security warning functions
function showSecurityWarning() {
    if (screenshotWarning) {
        screenshotWarning.style.display = 'flex';
        
        // Auto-hide after 2 seconds
        clearTimeout(warningTimeout);
        warningTimeout = setTimeout(() => {
            hideSecurityWarning();
        }, 2000);
    }
}

function hideSecurityWarning() {
    if (screenshotWarning) {
        screenshotWarning.style.display = 'none';
    }
    clearTimeout(warningTimeout);
}

// ============================================
// IMAGE UPLOAD
// ============================================

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
                    console.log('Dominant color extracted:', dominantColor);
                } catch (error) {
                    console.warn('Color extraction failed, using default');
                    dominantColor = '#667eea';
                }
            };
        };
        
        reader.readAsDataURL(file);
    }
});

// ============================================
// SHAPE SELECTION
// ============================================

addToCircleBtn.addEventListener('click', () => setShape('circle', circleZone));
addToHexadecagonBtn.addEventListener('click', () => setShape('hexadecagon', hexadecagonZone));
addToFlowerBtn.addEventListener('click', () => setShape('flower', flowerZone));

function setShape(shape, zone) {
    if (currentImageSrc) {
        clearAllShapes();
        currentShape = shape;
        placeImageInShape(zone, shape);
        updatePreview();
    }
}

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

    const clipStyle = shape === 'circle' ? 'border-radius: 50%;' : `clip-path: ${poly};`;
    
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

// ============================================
// SIZE CONTROL
// ============================================

imageSize.addEventListener('input', function(e) {
    currentSize = parseInt(e.target.value);
    sizeValue.textContent = currentSize + 'px';
    
    if (currentShape) {
        const zones = {
            'circle': circleZone,
            'hexadecagon': hexadecagonZone,
            'flower': flowerZone
        };
        
        placeImageInShape(zones[currentShape], currentShape);
        updatePreview();
    }
});

// ============================================
// TEXT INPUT
// ============================================

teluguText.addEventListener('input', updatePreview);

// ============================================
// UPDATE PREVIEW
// ============================================

function updatePreview() {
    const text = teluguText.value.trim();
    
    if (!currentShape || !currentImageSrc || !text) {
        resultContainer.innerHTML = '<p class="placeholder">Choose image and add to shape</p>';
        downloadBtn.style.display = 'none';
        return;
    }
    
    const wrapper = createShapeWrapper(currentSize, currentShape, currentImageSrc, dominantColor);
    wrapper.classList.add('wrapped-image');
    
    resultContainer.innerHTML = '';
    resultContainer.appendChild(wrapper);
    resultContainer.appendChild(document.createTextNode(text));
    
    downloadBtn.style.display = 'block';
}

function createShapeWrapper(size, shape, src, color) {
    const div = document.createElement('div');
    const img = document.createElement('img');
    
    div.style.width = size + 'px';
    div.style.height = size + 'px';
    div.style.background = color;
    div.style.float = 'left';
    div.style.margin = '0 15px 5px 0';
    div.style.display = 'flex';
    div.style.justifyContent = 'center';
    div.style.alignItems = 'center';
    
    img.src = src;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    img.style.transform = 'scale(0.92)';
    img.crossOrigin = 'anonymous';
    
    if (shape === 'circle') {
        div.style.borderRadius = '50%';
        div.style.shapeOutside = 'circle(50%)';
        img.style.borderRadius = '50%';
    } else {
        const poly = shape === 'hexadecagon' ? hexadecagonPoly : flowerPoly;
        div.style.clipPath = poly;
        div.style.shapeOutside = poly;
        img.style.clipPath = poly;
    }
    
    div.appendChild(img);
    return div;
}

// ============================================
// MODAL HANDLING
// ============================================

downloadBtn.addEventListener('click', () => sizeModal.classList.add('show'));
closeModal.addEventListener('click', () => sizeModal.classList.remove('show'));

sizeModal.addEventListener('click', (e) => {
    if (e.target === sizeModal) {
        sizeModal.classList.remove('show');
    }
});

// ============================================
// DOWNLOAD SIZE SELECTION
// ============================================

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

// ============================================
// AUTO SIZE DOWNLOAD
// ============================================

async function downloadAutoSize() {
    downloadBtn.disabled = true;
    downloadBtn.textContent = 'Processing...';
    
    try {
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const dataUrl = await htmlToImage.toPng(resultContainer, {
            backgroundColor: '#ffffff',
            pixelRatio: 4,
            quality: 1,
            cacheBust: true,
            style: {
                fontFamily: "'Noto Sans Telugu', sans-serif"
            }
        });
        
        triggerDownload(dataUrl, 'auto');
        
    } catch (error) {
        console.error('Download failed:', error);
        alert('Download failed. Please try again.');
    } finally {
        downloadBtn.disabled = false;
        downloadBtn.textContent = '⬇️ Download';
    }
}

// ============================================
// FIXED SIZE DOWNLOAD
// ============================================

async function downloadWithSize(width, height) {
    downloadBtn.disabled = true;
    downloadBtn.textContent = 'Processing...';
    
    try {
        const imageCircleSize = Math.min(width, height) * 0.35;
        const fontSize = width * 0.024;
        
        const tempContainer = document.createElement('div');
        tempContainer.style.cssText = `
            width: ${width}px;
            height: ${height}px;
            position: fixed;
            left: 0;
            top: 0;
            z-index: -9999;
            background: #ffffff;
            padding: 40px;
            box-sizing: border-box;
            font-family: 'Noto Sans Telugu', sans-serif;
            font-size: ${fontSize}px;
            line-height: 1.8;
            color: #333;
            text-align: justify;
        `;
        
        const wrapper = createShapeWrapper(imageCircleSize, currentShape, currentImageSrc, dominantColor);
        wrapper.style.margin = `0 ${fontSize * 1.2}px ${fontSize * 0.5}px 0`;
        
        tempContainer.appendChild(wrapper);
        tempContainer.appendChild(document.createTextNode(teluguText.value));
        
        document.body.appendChild(tempContainer);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const dataUrl = await htmlToImage.toPng(tempContainer, {
            backgroundColor: '#ffffff',
            width: width,
            height: height,
            pixelRatio: 2,
            quality: 1,
            cacheBust: true,
            style: {
                fontFamily: "'Noto Sans Telugu', sans-serif"
            }
        });
        
        document.body.removeChild(tempContainer);
        triggerDownload(dataUrl, `${width}x${height}`);
        
    } catch (error) {
        console.error('Download failed:', error);
        alert('Download failed. Please try again.');
    } finally {
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
}

// ============================================
// FONT LOADING
// ============================================

window.addEventListener('load', () => {
    if (document.fonts) {
        document.fonts.ready.then(() => {
            console.log('Telugu fonts loaded successfully');
        });
    }
});