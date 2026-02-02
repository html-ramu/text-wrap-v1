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
const textCircleBtn = document.getElementById('textCircleBtn');

const posLeftBtn = document.getElementById('posLeftBtn');
const posRightBtn = document.getElementById('posRightBtn');

const sizePresets = document.querySelectorAll('.size-preset');
const imageSize = document.getElementById('imageSize');
const sizeValue = document.getElementById('sizeValue');

const teluguText = document.getElementById('teluguText');
const resultContainer = document.getElementById('resultContainer');
const downloadBtn = document.getElementById('downloadBtn');
const sizeModal = document.getElementById('sizeModal');
const closeModal = document.getElementById('closeModal');
const sizeOptionBtns = document.querySelectorAll('.size-option-btn');
const screenshotWarning = document.getElementById('screenshotWarning');

// Store current state
let currentImageSrc = null;
let currentShape = null; // 'circle', 'hexadecagon', 'flower', 'textCircle'
let currentSize = 150;
let currentPos = 'left'; 
let dominantColor = '#667eea';

// POLYGON STRINGS
const hexadecagonPoly = 'polygon(50% 0%, 69% 4%, 85% 15%, 96% 31%, 100% 50%, 96% 69%, 85% 85%, 69% 96%, 50% 100%, 31% 96%, 15% 85%, 4% 69%, 0% 50%, 4% 31%, 15% 15%, 31% 4%)';
const flowerPoly = 'polygon(50% 0%, 56% 12%, 60% 2%, 65% 13%, 69% 4%, 73% 16%, 77% 8%, 80% 20%, 85% 15%, 85% 26%, 92% 23%, 89% 34%, 98% 33%, 91% 42%, 100% 44%, 91% 51%, 98% 57%, 89% 60%, 92% 69%, 85% 68%, 85% 78%, 78% 74%, 75% 86%, 69% 79%, 64% 91%, 60% 82%, 54% 93%, 50% 84%, 46% 93%, 40% 82%, 36% 91%, 31% 79%, 25% 86%, 22% 74%, 15% 78%, 15% 68%, 8% 69%, 11% 60%, 2% 57%, 9% 51%, 0% 44%, 9% 42%, 2% 33%, 11% 34%, 8% 23%, 15% 26%, 15% 15%, 20% 20%, 23% 8%, 27% 16%, 31% 4%, 35% 13%, 40% 2%, 44% 12%)';

// INVERSE CORNER POLYGONS (For Text Circle)
// These shapes block the corners of the square, forcing text into the middle circle
const cornerLeftPoly = 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%, 0% 100%, 100% 100%, 100% 100%, 0% 100%, 0% 50%, 4% 60%, 15% 85%, 31% 96%, 50% 100%, 0% 100%, 0% 0%, 50% 0%, 31% 4%, 15% 15%, 4% 40%, 0% 50%)'; 
// Simplified approximation for left corners
const simpleCornerLeft = 'polygon(0 0, 100% 0, 50% 0, 15% 15%, 0 50%, 15% 85%, 50% 100%, 100% 100%, 0 100%)';
const simpleCornerRight = 'polygon(100% 0, 0 0, 50% 0, 85% 15%, 100% 50%, 85% 85%, 50% 100%, 0 100%, 100% 100%)';


// Initialize ColorThief
const colorThief = new ColorThief();

// ============================================
// SAFE SECURITY LOGIC
// ============================================
document.addEventListener('contextmenu', event => event.preventDefault());
document.addEventListener('keydown', (e) => {
    if (e.key === 'PrintScreen' || (e.metaKey && e.shiftKey && e.key === 'S') || (e.ctrlKey && (e.key === 'p' || e.key === 's'))) {
        try { navigator.clipboard.writeText(''); } catch(err) {}
        showSecurityWarning();
    }
});

function showSecurityWarning() {
    if(screenshotWarning) {
        screenshotWarning.style.display = 'flex';
        setTimeout(() => screenshotWarning.style.display = 'none', 2000);
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
                } catch (error) { dominantColor = '#667eea'; }
            };
        };
        reader.readAsDataURL(file);
    }
});

// BUTTON LISTENERS
addToCircleBtn.addEventListener('click', () => setShape('circle'));
addToHexadecagonBtn.addEventListener('click', () => setShape('hexadecagon'));
addToFlowerBtn.addEventListener('click', () => setShape('flower'));
textCircleBtn.addEventListener('click', () => setTextCircleMode());

// POSITION CONTROL
posLeftBtn.addEventListener('click', () => updatePos('left', posLeftBtn));
posRightBtn.addEventListener('click', () => updatePos('right', posRightBtn));

// SIZE PRESETS
sizePresets.forEach(btn => {
    btn.addEventListener('click', () => {
        const size = parseInt(btn.dataset.size);
        imageSize.value = size;
        updateSize(size);
    });
});

// SIZE SLIDER
imageSize.addEventListener('input', (e) => updateSize(e.target.value));

function updateSize(size) {
    currentSize = size;
    sizeValue.textContent = currentSize + 'px';
    updatePreview();
}

function updatePos(pos, btn) {
    currentPos = pos;
    document.querySelectorAll('#positionControl .toggle-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    updatePreview();
}

// MODE SETTERS
function setShape(shape) {
    if (currentImageSrc) {
        currentShape = shape;
        positionControl.style.display = 'block'; // Show pos controls for images
        updatePreview();
    }
}

function setTextCircleMode() {
    currentShape = 'textCircle';
    positionControl.style.display = 'none'; // Hide pos controls (it's always centered)
    updatePreview();
}

// TEXT INPUT
teluguText.addEventListener('input', updatePreview);

// UPDATE PREVIEW
function updatePreview() {
    const text = teluguText.value.trim();
    
    // Check if we can proceed (need image OR textCircle mode)
    if ((!currentImageSrc && currentShape !== 'textCircle') || !text || !currentShape) {
        resultContainer.innerHTML = '<p class="placeholder">Choose image/shape to start</p>';
        downloadBtn.style.display = 'none';
        return;
    }
    
    resultContainer.innerHTML = '';
    
    if (currentShape === 'textCircle') {
        // --- TEXT CIRCLE MODE ---
        const spacers = createTextCircleSpacers(currentSize);
        // Container to hold text and spacers
        const circleContainer = document.createElement('div');
        circleContainer.style.width = currentSize + 'px';
        circleContainer.style.height = currentSize + 'px';
        circleContainer.style.borderRadius = '50%';
        circleContainer.style.border = `2px dashed ${dominantColor}`; // Guide border
        circleContainer.style.position = 'relative';
        circleContainer.style.margin = '0 auto'; // Center horizontally
        circleContainer.style.overflow = 'hidden';
        circleContainer.style.textAlign = 'center';
        circleContainer.style.fontSize = Math.max(10, currentSize / 15) + 'px'; // Dynamic font size
        
        // Add spacers to push text into circle shape
        circleContainer.appendChild(spacers.left);
        circleContainer.appendChild(spacers.right);
        
        // Add text span
        const textSpan = document.createElement('span');
        textSpan.textContent = text;
        circleContainer.appendChild(textSpan);
        
        resultContainer.appendChild(circleContainer);
        
    } else {
        // --- IMAGE WRAP MODE ---
        const wrapper = createShapeWrapper(currentSize, currentShape, currentImageSrc, dominantColor, currentPos);
        resultContainer.appendChild(wrapper);
        resultContainer.appendChild(document.createTextNode(text));
    }
    
    downloadBtn.style.display = 'block';
}

// HELPERS
function createShapeWrapper(size, shape, src, color, pos) {
    const div = document.createElement('div');
    const img = document.createElement('img');
    
    div.style.width = size + 'px';
    div.style.height = size + 'px';
    div.style.background = color;
    div.style.float = pos; 
    
    if (pos === 'left') div.style.margin = '0 15px 5px 0';
    else div.style.margin = '0 0 5px 15px';

    div.style.display = 'flex';
    div.style.justifyContent = 'center';
    div.style.alignItems = 'center';
    
    img.src = src;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    img.style.transform = 'scale(0.92)';
    
    let poly = '';
    if (shape === 'hexadecagon') poly = hexadecagonPoly;
    else if (shape === 'flower') poly = flowerPoly;

    if (shape === 'circle') {
        div.style.borderRadius = '50%';
        div.style.shapeOutside = 'circle(50%)';
        img.style.borderRadius = '50%';
    } else {
        div.style.clipPath = poly;
        div.style.shapeOutside = poly;
        img.style.clipPath = poly;
    }
    
    div.appendChild(img);
    return div;
}

function createTextCircleSpacers(size) {
    const leftSpacer = document.createElement('div');
    const rightSpacer = document.createElement('div');
    
    leftSpacer.style.float = 'left';
    leftSpacer.style.width = '50%';
    leftSpacer.style.height = '100%';
    leftSpacer.style.shapeOutside = simpleCornerLeft;
    leftSpacer.style.webkitShapeOutside = simpleCornerLeft;
    
    rightSpacer.style.float = 'right';
    rightSpacer.style.width = '50%';
    rightSpacer.style.height = '100%';
    rightSpacer.style.shapeOutside = simpleCornerRight;
    rightSpacer.style.webkitShapeOutside = simpleCornerRight;
    
    return { left: leftSpacer, right: rightSpacer };
}

// MODAL HANDLING
downloadBtn.addEventListener('click', () => sizeModal.classList.add('show'));
closeModal.addEventListener('click', () => sizeModal.classList.remove('show'));
sizeModal.addEventListener('click', (e) => {
    if (e.target === sizeModal) sizeModal.classList.remove('show');
});

// DOWNLOAD LOGIC
sizeOptionBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        const type = this.dataset.type;
        sizeModal.classList.remove('show');
        if (type === 'auto') downloadAutoSize();
        else downloadWithSize(parseInt(this.dataset.width), parseInt(this.dataset.height));
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
            style: { fontFamily: "'Noto Sans Telugu', sans-serif" }
        });
        triggerDownload(dataUrl, 'auto');
    } catch (error) {
        console.error(error);
        alert('Download failed');
    } finally {
        downloadBtn.disabled = false;
        downloadBtn.textContent = '⬇️ Download';
    }
}

async function downloadWithSize(width, height) {
    downloadBtn.disabled = true;
    downloadBtn.textContent = 'Processing...';
    try {
        const fontSize = width * 0.024;
        
        const tempContainer = document.createElement('div');
        tempContainer.style.width = width + 'px';
        tempContainer.style.height = height + 'px';
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
        
        // Wrap for rendering
        const hiddenParent = document.createElement('div');
        hiddenParent.style.position = 'fixed';
        hiddenParent.style.left = '0';
        hiddenParent.style.top = '0';
        hiddenParent.style.zIndex = '-9999';
        hiddenParent.appendChild(tempContainer);
        document.body.appendChild(hiddenParent);

        if (currentShape === 'textCircle') {
            // TEXT CIRCLE DOWNLOAD SCALING
            // We scale the circle size relative to the download width
            const scaleFactor = width / 800; // Approx baseline
            const dlSize = currentSize * scaleFactor * 2; // Increase size for hi-res
            
            const spacers = createTextCircleSpacers(dlSize);
            const circleContainer = document.createElement('div');
            circleContainer.style.width = dlSize + 'px';
            circleContainer.style.height = dlSize + 'px';
            circleContainer.style.borderRadius = '50%';
            circleContainer.style.border = `4px dashed ${dominantColor}`;
            circleContainer.style.margin = '0 auto';
            circleContainer.style.overflow = 'hidden';
            circleContainer.style.textAlign = 'center';
            circleContainer.style.fontSize = (dlSize / 15) + 'px';
            
            circleContainer.appendChild(spacers.left);
            circleContainer.appendChild(spacers.right);
            
            const span = document.createElement('span');
            span.textContent = teluguText.value;
            circleContainer.appendChild(span);
            
            // Center the circle vertically in the big canvas
            tempContainer.style.display = 'flex';
            tempContainer.style.alignItems = 'center';
            tempContainer.style.justifyContent = 'center';
            tempContainer.appendChild(circleContainer);
            
        } else {
            // STANDARD WRAP
            const dlImageSize = Math.min(width, height) * 0.35;
            const wrapper = createShapeWrapper(dlImageSize, currentShape, currentImageSrc, dominantColor, currentPos);
            
            if (currentPos === 'left') wrapper.style.margin = `0 ${fontSize * 1.2}px ${fontSize * 0.5}px 0`;
            else wrapper.style.margin = `0 0 ${fontSize * 0.5}px ${fontSize * 1.2}px`;
            
            tempContainer.appendChild(wrapper);
            tempContainer.appendChild(document.createTextNode(teluguText.value));
        }

        await new Promise(resolve => setTimeout(resolve, 500));
        
        const dataUrl = await htmlToImage.toPng(tempContainer, {
            backgroundColor: '#ffffff',
            width: width,
            height: height,
            pixelRatio: 1,
            style: { fontFamily: "'Noto Sans Telugu', sans-serif" }
        });
        
        document.body.removeChild(hiddenParent);
        triggerDownload(dataUrl, `${width}x${height}`);
        
    } catch (error) {
        console.error(error);
        alert('Download failed');
        downloadBtn.disabled = false;
        downloadBtn.textContent = '⬇️ Download';
    }
}

function triggerDownload(dataUrl, suffix) {
    const link = document.createElement('a');
    const timestamp = new Date().getTime();
    link.download = `telugu-${currentShape}-${suffix}-${timestamp}.png`;
    link.href = dataUrl;
    link.click();
    downloadBtn.disabled = false;
    downloadBtn.textContent = '⬇️ Download';
}

window.addEventListener('load', () => {
    if (document.fonts) document.fonts.ready.then(() => console.log('Fonts loaded'));
});