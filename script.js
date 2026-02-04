// Get all DOM elements
const imageUpload = document.getElementById('imageUpload');
const previewImg = document.getElementById('previewImg');
const imagePreview = document.getElementById('imagePreview');
const noImageText = imagePreview.querySelector('.no-image');
const addButtons = document.querySelector('.add-buttons');

const addToCircleBtn = document.getElementById('addToCircleBtn');
const addToHexadecagonBtn = document.getElementById('addToHexadecagonBtn');
const addToFlowerBtn = document.getElementById('addToFlowerBtn');
const addToSquareBtn = document.getElementById('addToSquareBtn');
const addToRectBtn = document.getElementById('addToRectBtn');
const rectHeightControl = document.getElementById('rectHeightControl');
const rectHeight = document.getElementById('rectHeight');
const rectHeightValue = document.getElementById('rectHeightValue');

const teluguText = document.getElementById('teluguText');
const imageSize = document.getElementById('imageSize');
const sizeValue = document.getElementById('sizeValue');
const resultContainer = document.getElementById('resultContainer');
const downloadBtn = document.getElementById('downloadBtn');
const sizeModal = document.getElementById('sizeModal');
const closeModal = document.getElementById('closeModal');
const sizeOptionBtns = document.querySelectorAll('.size-option-btn');

// Control elements
const imageAdjustControl = document.getElementById('imageAdjustControl');
const borderColorControl = document.getElementById('borderColorControl');
const positionControl = document.getElementById('positionControl');
const shapeBorderColor = document.getElementById('shapeBorderColor');
const textColor = document.getElementById('textColor');

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
addToSquareBtn.addEventListener('click', () => setShape('square'));
// Add Rectangle Handler
addToRectBtn.addEventListener('click', () => setShape('rectangle'));

// Add Slider Handler
rectHeight.addEventListener('input', (e) => {
    rectHeightValue.textContent = e.target.value + 'px';
    updatePreview();
});

function setShape(shape) {
    currentShape = shape;
    
    // 1. Show standard controls
    // Note: If you have a variable for imageAdjustControl, make sure it matches. 
    // If your code uses 'imageAdjustControl', keep it. 
    // If your previous code used specific IDs, ensure they match.
    // Based on your previous uploads, this is the standard set:
    if (document.getElementById('imageAdjustControl')) document.getElementById('imageAdjustControl').style.display = 'block';
    if (document.getElementById('borderColorControl')) document.getElementById('borderColorControl').style.display = 'flex';
    if (document.getElementById('positionControl')) document.getElementById('positionControl').style.display = 'block';

    // 2. Show height slider ONLY for rectangle
    if (shape === 'rectangle') {
        rectHeightControl.style.display = 'block';
    } else {
        rectHeightControl.style.display = 'none';
    }
    
    // 3. Reset position variables
    // (We use global variables typically found in your script)
    if (typeof imageX !== 'undefined') imageX = 0;
    if (typeof imageY !== 'undefined') imageY = 0;
    if (typeof imageScale !== 'undefined') imageScale = 1;
    
    // 4. Reset zoom slider if it exists
    const zoomSlider = document.getElementById('imageZoom');
    if (zoomSlider) zoomSlider.value = 1;
    
    // 5. Update the drawing
    updatePreview();
    
    // 6. Scroll to result
    const resultContainer = document.getElementById('resultContainer');
    if (resultContainer) resultContainer.scrollIntoView({ behavior: 'smooth' });
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
// TEXT INPUT
// ============================================

teluguText.addEventListener('input', updatePreview);

// ============================================
// UPDATE PREVIEW
// ============================================

function updatePreview() {
    const text = teluguText.value.trim();
    
    if (!currentShape || !currentImageSrc || !text) {
        resultContainer.innerHTML = '<p class="placeholder">Choose image and shape to start</p>';
        downloadBtn.style.display = 'none';
        return;
    }
    
    createShapePreview(text);
    downloadBtn.style.display = 'block';
}

function createShapePreview(text) {
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
    
    // NEW: Calculate height for rectangle
    if (shape === 'rectangle') {
        const currentW = parseInt(document.getElementById('imageSize').value);
        const currentH = parseInt(document.getElementById('rectHeight').value);
        // Calculate ratio so it works for both Preview and Download
        const ratio = currentH / currentW; 
        outerDiv.style.height = (size * ratio) + 'px';
    } else {
        outerDiv.style.height = size + 'px';
    }
    
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
     // Apply shape
if (shape === 'circle') {
    outerDiv.style.borderRadius = '50%';
    outerDiv.style.shapeOutside = 'circle(50%)';
    outerDiv.style.clipPath = 'circle(50%)';
    
    innerDiv.style.borderRadius = '50%';
    innerDiv.style.clipPath = 'circle(50%)';
    
    img.style.borderRadius = '50%';
    
} else if (shape === 'square' || shape === 'rectangle') {
    // 1. Reset standard shape properties
    outerDiv.style.borderRadius = '0';
    outerDiv.style.shapeOutside = 'none';
    outerDiv.style.clipPath = 'none';
    
    innerDiv.style.borderRadius = '0';
    innerDiv.style.clipPath = 'none';
    
    img.style.borderRadius = '0';
    img.style.clipPath = 'none';
    
    // 2. FIX: Remove the background color
    outerDiv.style.background = 'transparent';
    
    // 3. FIX: Add a real border
    var borderThick = Math.round(size * 0.04);
    
    outerDiv.style.border = borderThick + 'px solid ' + borderColor;
    outerDiv.style.boxSizing = 'border-box';
    
    // 4. Make sure inner content fills the space
    innerDiv.style.width = '100%';
    innerDiv.style.height = '100%';

} else {
    // Logic for Hexadecagon and Flower
    // (We put this in an ELSE so it doesn't overwrite the others!)
    const poly = shape === 'hexadecagon' ? hexadecagonPoly : flowerPoly;
    outerDiv.style.clipPath = poly;
    outerDiv.style.shapeOutside = poly;
    innerDiv.style.clipPath = poly;
    img.style.clipPath = poly;
}
        // Logic for Hexadecagon and Flower
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
        
        const wrapper = createShapeWrapper(shapeSize, currentShape, currentImageSrc, currentBorderColor);
        wrapper.style.float = currentPosition;
        wrapper.style.margin = currentPosition === 'left' ? `0 ${fontSize * 1.2}px ${fontSize * 0.5}px 0` : `0 0 ${fontSize * 0.5}px ${fontSize * 1.2}px`;
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

// Suppress harmless CSS errors
const originalError = console.error;
console.error = function(...args) {
    if (args[0] && args[0].includes('cssRules')) {
        return;
    }
    originalError.apply(console, args);
};