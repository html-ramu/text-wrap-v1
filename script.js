// Get all DOM elements
const imageUpload = document.getElementById('imageUpload');
const previewImg = document.getElementById('previewImg');
const imagePreview = document.getElementById('imagePreview');
const noImageText = imagePreview.querySelector('.no-image');
const addButtons = document.querySelector('.add-buttons');

const addToCircleBtn = document.getElementById('addToCircleBtn');
const addToHexadecagonBtn = document.getElementById('addToHexadecagonBtn');
const addToFlowerBtn = document.getElementById('addToFlowerBtn');
const textCircleBtn = document.getElementById('textCircleBtn');

const teluguText = document.getElementById('teluguText');
const imageSize = document.getElementById('imageSize');
const sizeValue = document.getElementById('sizeValue');
const resultContainer = document.getElementById('resultContainer');
const downloadBtn = document.getElementById('downloadBtn');
const sizeModal = document.getElementById('sizeModal');
const closeModal = document.getElementById('closeModal');
const sizeOptionBtns = document.querySelectorAll('.size-option-btn');
const screenshotWarning = document.getElementById('screenshotWarning');

// New controls
const imageAdjustControl = document.getElementById('imageAdjustControl');
const borderColorControl = document.getElementById('borderColorControl');
const positionControl = document.getElementById('positionControl');
const shapeBorderColor = document.getElementById('shapeBorderColor');
const textColor = document.getElementById('textColor');
const circleTextSection = document.getElementById('circleTextSection');
const circleTextInput = document.getElementById('circleTextInput');
const circleTextColor = document.getElementById('circleTextColor');
const circleBorderColor = document.getElementById('circleBorderColor');

// Position buttons
const moveUp = document.getElementById('moveUp');
const moveDown = document.getElementById('moveDown');
const moveLeft = document.getElementById('moveLeft');
const moveRight = document.getElementById('moveRight');
const zoomIn = document.getElementById('zoomIn');
const zoomOut = document.getElementById('zoomOut');
const resetPosition = document.getElementById('resetPosition');

// Position toggles
const posLeftBtn = document.getElementById('posLeftBtn');
const posRightBtn = document.getElementById('posRightBtn');

// Store current state
let currentImageSrc = null;
let currentShape = null;
let currentSize = 150;
let currentTextSize = 0.85;
let currentTextColor = '#333333';
let currentBorderColor = '#8B6914';
let currentPosition = 'left';
let currentCircleText = '';
let currentCircleTextColor = '#8B6914';
let currentCircleTextSize = 18;
let currentCircleBorderColor = '#8B6914';
let warningTimeout = null;

// Image adjustment state
let imageOffsetX = 0;
let imageOffsetY = 0;
let imageZoom = 1;

// POLYGON STRINGS
const hexadecagonPoly = 'polygon(50% 0%, 69% 4%, 85% 15%, 96% 31%, 100% 50%, 96% 69%, 85% 85%, 69% 96%, 50% 100%, 31% 96%, 15% 85%, 4% 69%, 0% 50%, 4% 31%, 15% 15%, 31% 4%)';
const flowerPoly = 'polygon(50% 0%, 56% 12%, 60% 2%, 65% 13%, 69% 4%, 73% 16%, 77% 8%, 80% 20%, 85% 15%, 85% 26%, 92% 23%, 89% 34%, 98% 33%, 91% 42%, 100% 44%, 91% 51%, 98% 57%, 89% 60%, 92% 69%, 85% 68%, 85% 78%, 78% 74%, 75% 86%, 69% 79%, 64% 91%, 60% 82%, 54% 93%, 50% 84%, 46% 93%, 40% 82%, 36% 91%, 31% 79%, 25% 86%, 22% 74%, 15% 78%, 15% 68%, 8% 69%, 11% 60%, 2% 57%, 9% 51%, 0% 44%, 9% 42%, 2% 33%, 11% 34%, 8% 23%, 15% 26%, 15% 15%, 20% 20%, 23% 8%, 27% 16%, 31% 4%, 35% 13%, 40% 2%, 44% 12%)';

// Initialize ColorThief
const colorThief = new ColorThief();

// ============================================
// ANTI-SCREENSHOT PROTECTION
// ============================================

document.addEventListener('touchstart', (e) => {
    if (e.touches.length >= 3) {
        e.preventDefault();
        showSecurityWarning();
    }
}, { passive: false });

document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    showSecurityWarning();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'PrintScreen') {
        navigator.clipboard.writeText('');
        showSecurityWarning();
    }
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        showSecurityWarning();
    }
    if (e.ctrlKey && ['p', 's', 'u', 'c'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        showSecurityWarning();
    }
});

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
        showSecurityWarning();
    } else {
        hideSecurityWarning();
    }
});

window.addEventListener('blur', () => showSecurityWarning());
window.addEventListener('focus', () => hideSecurityWarning());

function showSecurityWarning() {
    if (screenshotWarning) {
        screenshotWarning.style.display = 'flex';
        clearTimeout(warningTimeout);
        warningTimeout = setTimeout(() => hideSecurityWarning(), 2000);
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
                    currentBorderColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
                    shapeBorderColor.value = rgbToHex(color[0], color[1], color[2]);
                    console.log('Dominant color extracted:', currentBorderColor);
                } catch (error) {
                    console.warn('Color extraction failed, using default');
                    currentBorderColor = '#8B6914';
                }
            };
        };
        
        reader.readAsDataURL(file);
    }
});

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// ============================================
// SHAPE SELECTION
// ============================================

addToCircleBtn.addEventListener('click', () => setShape('circle'));
addToHexadecagonBtn.addEventListener('click', () => setShape('hexadecagon'));
addToFlowerBtn.addEventListener('click', () => setShape('flower'));
textCircleBtn.addEventListener('click', () => setShape('text-circle'));

function setShape(shape) {
    if (!currentImageSrc && shape !== 'text-circle') return;
    
    currentShape = shape;
    resetImageAdjustment();
    
    // Show/hide controls based on shape
    if (shape === 'text-circle') {
        imageAdjustControl.style.display = 'none';
        borderColorControl.style.display = 'none';
        positionControl.style.display = 'none';
        circleTextSection.style.display = 'block';
    } else {
        imageAdjustControl.style.display = 'block';
        borderColorControl.style.display = 'block';
        positionControl.style.display = 'block';
        circleTextSection.style.display = 'none';
    }
    
    updatePreview();
}

// ============================================
// IMAGE POSITION ADJUSTMENT
// ============================================

moveUp.addEventListener('click', () => {
    imageOffsetY -= 5;
    updatePreview();
});

moveDown.addEventListener('click', () => {
    imageOffsetY += 5;
    updatePreview();
});

moveLeft.addEventListener('click', () => {
    imageOffsetX -= 5;
    updatePreview();
});

moveRight.addEventListener('click', () => {
    imageOffsetX += 5;
    updatePreview();
});

zoomIn.addEventListener('click', () => {
    imageZoom += 0.1;
    updatePreview();
});

zoomOut.addEventListener('click', () => {
    imageZoom -= 0.1;
    if (imageZoom < 0.5) imageZoom = 0.5;
    updatePreview();
});

resetPosition.addEventListener('click', () => {
    resetImageAdjustment();
    updatePreview();
});

function resetImageAdjustment() {
    imageOffsetX = 0;
    imageOffsetY = 0;
    imageZoom = 1;
}

// ============================================
// COLOR CONTROLS
// ============================================

shapeBorderColor.addEventListener('input', (e) => {
    currentBorderColor = e.target.value;
    updatePreview();
});

textColor.addEventListener('input', (e) => {
    currentTextColor = e.target.value;
    updatePreview();
});

circleTextColor.addEventListener('input', (e) => {
    currentCircleTextColor = e.target.value;
    updatePreview();
});

circleBorderColor.addEventListener('input', (e) => {
    currentCircleBorderColor = e.target.value;
    updatePreview();
});

// Color preset buttons
document.querySelectorAll('.color-preset').forEach(btn => {
    btn.addEventListener('click', function() {
        const color = this.dataset.color;
        const target = this.dataset.target;
        
        if (target === 'circleTextColor') {
            circleTextColor.value = color;
            currentCircleTextColor = color;
        } else if (target === 'circleBorderColor') {
            circleBorderColor.value = color;
            currentCircleBorderColor = color;
        } else if (this.closest('#borderColorControl')) {
            shapeBorderColor.value = color;
            currentBorderColor = color;
        } else {
            textColor.value = color;
            currentTextColor = color;
        }
        
        updatePreview();
    });
});

// ============================================
// POSITION TOGGLE
// ============================================

posLeftBtn.addEventListener('click', () => {
    currentPosition = 'left';
    posLeftBtn.classList.add('active');
    posRightBtn.classList.remove('active');
    updatePreview();
});

posRightBtn.addEventListener('click', () => {
    currentPosition = 'right';
    posRightBtn.classList.add('active');
    posLeftBtn.classList.remove('active');
    updatePreview();
});

// ============================================
// SIZE CONTROLS
// ============================================

imageSize.addEventListener('input', function(e) {
    currentSize = parseInt(e.target.value);
    sizeValue.textContent = currentSize + 'px';
    
    // Remove active from presets
    document.querySelectorAll('.size-preset').forEach(btn => btn.classList.remove('active'));
    
    updatePreview();
});

document.querySelectorAll('.size-preset').forEach(btn => {
    btn.addEventListener('click', function() {
        currentSize = parseInt(this.dataset.size);
        imageSize.value = currentSize;
        sizeValue.textContent = currentSize + 'px';
        
        document.querySelectorAll('.size-preset').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        updatePreview();
    });
});

// ============================================
// TEXT SIZE CONTROLS
// ============================================

document.querySelectorAll('.text-size-preset').forEach(btn => {
    btn.addEventListener('click', function() {
        currentTextSize = parseFloat(this.dataset.size);
        
        document.querySelectorAll('.text-size-preset').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        updatePreview();
    });
});

// ============================================
// CIRCLE TEXT CONTROLS
// ============================================

circleTextInput.addEventListener('input', (e) => {
    currentCircleText = e.target.value;
    updatePreview();
});

document.querySelectorAll('.circle-text-size-preset').forEach(btn => {
    btn.addEventListener('click', function() {
        currentCircleTextSize = parseInt(this.dataset.size);
        
        document.querySelectorAll('.circle-text-size-preset').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        updatePreview();
    });
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
    
    if (!currentShape || (!currentImageSrc && currentShape !== 'text-circle')) {
        resultContainer.innerHTML = '<p class="placeholder">Choose image/shape to start</p>';
        downloadBtn.style.display = 'none';
        return;
    }
    
    if (currentShape === 'text-circle') {
        createTextCirclePreview();
    } else {
        createShapePreview(text);
    }
    
    downloadBtn.style.display = 'block';
}

function createTextCirclePreview() {
    const text = teluguText.value.trim();
    if (!text) {
        resultContainer.innerHTML = '<p class="placeholder">Enter text to see preview</p>';
        return;
    }
    
    const svg = createCircleTextSVG(currentCircleText || 'Your Text Here', currentSize, currentCircleTextColor, currentCircleTextSize, currentCircleBorderColor);
    
    resultContainer.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.style.float = currentPosition;
    wrapper.style.margin = currentPosition === 'left' ? '0 15px 10px 0' : '0 0 10px 15px';
    wrapper.innerHTML = svg;
    
    const textNode = document.createElement('span');
    textNode.textContent = text;
    textNode.style.color = currentTextColor;
    textNode.style.fontSize = currentTextSize + 'em';
    
    resultContainer.appendChild(wrapper);
    resultContainer.appendChild(textNode);
}

function createShapePreview(text) {
    if (!text) {
        resultContainer.innerHTML = '<p class="placeholder">Enter text to see preview</p>';
        return;
    }
    
    const wrapper = createShapeWrapper(currentSize, currentShape, currentImageSrc, currentBorderColor);
    wrapper.style.float = currentPosition;
    wrapper.style.margin = currentPosition === 'left' ? '0 15px 10px 0' : '0 0 10px 15px';
    
    const textNode = document.createElement('span');
    textNode.textContent = text;
    textNode.style.color = currentTextColor;
    textNode.style.fontSize = currentTextSize + 'em';
    
    resultContainer.innerHTML = '';
    resultContainer.appendChild(wrapper);
    resultContainer.appendChild(textNode);
}

function createShapeWrapper(size, shape, src, borderColor) {
    const outerDiv = document.createElement('div');
    const innerDiv = document.createElement('div');
    const img = document.createElement('img');
    
    // Outer div (border)
    outerDiv.style.width = size + 'px';
    outerDiv.style.height = size + 'px';
    outerDiv.style.background = borderColor;
    outerDiv.style.display = 'flex';
    outerDiv.style.justifyContent = 'center';
    outerDiv.style.alignItems = 'center';
    outerDiv.style.position = 'relative';
    outerDiv.style.overflow = 'hidden';
    
    // Inner div (holds image with adjustment)
    innerDiv.style.width = '92%';
    innerDiv.style.height = '92%';
    innerDiv.style.position = 'relative';
    innerDiv.style.overflow = 'hidden';
    
    // Image with position adjustment
    img.src = src;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    img.style.transform = `translate(${imageOffsetX}%, ${imageOffsetY}%) scale(${imageZoom})`;
    img.style.transition = 'transform 0.2s';
    img.crossOrigin = 'anonymous';
    
    // Apply shape
    if (shape === 'circle') {
        outerDiv.style.borderRadius = '50%';
        outerDiv.style.shapeOutside = 'circle(50%)';
        innerDiv.style.borderRadius = '50%';
        img.style.borderRadius = '50%';
    } else {
        const poly = shape === 'hexadecagon' ? hexadecagonPoly : flowerPoly;
        outerDiv.style.clipPath = poly;
        outerDiv.style.shapeOutside = poly;
        innerDiv.style.clipPath = poly;
        img.style.clipPath = poly;
    }
    
    innerDiv.appendChild(img);
    outerDiv.appendChild(innerDiv);
    return outerDiv;
}

function createCircleTextSVG(text, size, textColor, textSize, borderColor) {
    const radius = size / 2;
    const textRadius = radius - 30;
    
    return `
        <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <path id="circlePath" d="M ${radius},${radius} m -${textRadius},0 a ${textRadius},${textRadius} 0 1,1 ${textRadius * 2},0 a ${textRadius},${textRadius} 0 1,1 -${textRadius * 2},0"/>
            </defs>
            <circle cx="${radius}" cy="${radius}" r="${radius - 5}" fill="none" stroke="${borderColor}" stroke-width="8"/>
            <text font-family="Noto Sans Telugu, sans-serif" font-size="${textSize}" font-weight="700" fill="${textColor}">
                <textPath href="#circlePath" startOffset="50%" text-anchor="middle">
                    ${text}
                </textPath>
            </text>
        </svg>
    `;
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
        const shapeSize = Math.min(width, height) * 0.35;
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
            color: ${currentTextColor};
            text-align: justify;
        `;
        
        if (currentShape === 'text-circle') {
            const svg = createCircleTextSVG(currentCircleText || 'Your Text Here', shapeSize, currentCircleTextColor, currentCircleTextSize * 1.5, currentCircleBorderColor);
            const wrapper = document.createElement('div');
            wrapper.style.float = currentPosition;
            wrapper.style.margin = currentPosition === 'left' ? `0 ${fontSize * 1.2}px ${fontSize * 0.5}px 0` : `0 0 ${fontSize * 0.5}px ${fontSize * 1.2}px`;
            wrapper.innerHTML = svg;
            tempContainer.appendChild(wrapper);
        } else {
            const wrapper = createShapeWrapper(shapeSize, currentShape, currentImageSrc, currentBorderColor);
            wrapper.style.float = currentPosition;
            wrapper.style.margin = currentPosition === 'left' ? `0 ${fontSize * 1.2}px ${fontSize * 0.5}px 0` : `0 0 ${fontSize * 0.5}px ${fontSize * 1.2}px`;
            tempContainer.appendChild(wrapper);
        }
        
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

// Suppress harmless CSS errors
const originalError = console.error;
console.error = function(...args) {
    if (args[0] && args[0].includes('cssRules')) {
        return;
    }
    originalError.apply(console, args);
};