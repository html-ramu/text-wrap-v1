// DOM ELEMENTS
const imageUpload = document.getElementById('imageUpload');
const textCircleModeBtn = document.getElementById('textCircleModeBtn');
const imageControlsArea = document.getElementById('imageControlsArea');
const commonControls = document.getElementById('commonControls');
const previewImg = document.getElementById('previewImg');
const resultContainer = document.getElementById('resultContainer');
const downloadBtn = document.getElementById('downloadBtn');
const screenshotWarning = document.getElementById('screenshotWarning');

// Buttons & Inputs
const posLeftBtn = document.getElementById('posLeftBtn');
const posRightBtn = document.getElementById('posRightBtn');
const borderColorPicker = document.getElementById('borderColorPicker');
const textColorPicker = document.getElementById('textColorPicker');
const bgColorPicker = document.getElementById('bgColorPicker');
const imageSizeSlider = document.getElementById('imageSizeSlider');
const teluguText = document.getElementById('teluguText');

// Adjust Controls
let imgScale = 1;
let imgX = 0;
let imgY = 0;

// STATE
let currentMode = null; // 'image' or 'textCircle'
let currentShape = 'circle';
let currentImageSrc = null;
let currentPos = 'left';
let currentSize = 150;
let currentBorderColor = '#FFD700';
let currentTextColor = '#000000';
let currentBgColor = '#ffffff';
let currentTextSizeClass = 'medium'; // small, medium, large, xl
let dominantColor = '#667eea'; // fallback

// POLYGONS
const hexPoly = 'polygon(50% 0%, 69% 4%, 85% 15%, 96% 31%, 100% 50%, 96% 69%, 85% 85%, 69% 96%, 50% 100%, 31% 96%, 15% 85%, 4% 69%, 0% 50%, 4% 31%, 15% 15%, 31% 4%)';
const flowerPoly = 'polygon(50% 0%, 56% 12%, 60% 2%, 65% 13%, 69% 4%, 73% 16%, 77% 8%, 80% 20%, 85% 15%, 85% 26%, 92% 23%, 89% 34%, 98% 33%, 91% 42%, 100% 44%, 91% 51%, 98% 57%, 89% 60%, 92% 69%, 85% 68%, 85% 78%, 78% 74%, 75% 86%, 69% 79%, 64% 91%, 60% 82%, 54% 93%, 50% 84%, 46% 93%, 40% 82%, 36% 91%, 31% 79%, 25% 86%, 22% 74%, 15% 78%, 15% 68%, 8% 69%, 11% 60%, 2% 57%, 9% 51%, 0% 44%, 9% 42%, 2% 33%, 11% 34%, 8% 23%, 15% 26%, 15% 15%, 20% 20%, 23% 8%, 27% 16%, 31% 4%, 35% 13%, 40% 2%, 44% 12%)';
const simpleCornerLeft = 'polygon(0 0, 100% 0, 50% 0, 15% 15%, 0 50%, 15% 85%, 50% 100%, 100% 100%, 0 100%)';
const simpleCornerRight = 'polygon(100% 0, 0 0, 50% 0, 85% 15%, 100% 50%, 85% 85%, 50% 100%, 0 100%, 100% 100%)';

// ===================================
// 1. INITIALIZATION & MODE SWITCHING
// ===================================

imageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            currentImageSrc = ev.target.result;
            previewImg.src = currentImageSrc;
            setMode('image');
        };
        reader.readAsDataURL(file);
    }
});

textCircleModeBtn.addEventListener('click', () => {
    setMode('textCircle');
});

function setMode(mode) {
    currentMode = mode;
    commonControls.style.display = 'block';
    
    if (mode === 'image') {
        imageControlsArea.style.display = 'block';
        document.getElementById('posControlGroup').style.display = 'block'; // Show Left/Right
        currentShape = 'circle'; // Default
        resetImageAdjust();
    } else {
        imageControlsArea.style.display = 'none';
        document.getElementById('posControlGroup').style.display = 'none'; // Always center
        currentShape = 'textCircle';
    }
    updatePreview();
}

// ===================================
// 2. CONTROLS (Colors, Size, Position)
// ===================================

// Position
posLeftBtn.addEventListener('click', () => { currentPos = 'left'; updatePosUI(); updatePreview(); });
posRightBtn.addEventListener('click', () => { currentPos = 'right'; updatePosUI(); updatePreview(); });

function updatePosUI() {
    document.querySelectorAll('#posControlGroup .toggle-btn').forEach(b => b.classList.remove('active'));
    if(currentPos === 'left') posLeftBtn.classList.add('active');
    else posRightBtn.classList.add('active');
}

// Shape Selection
document.getElementById('addToCircleBtn').addEventListener('click', () => { currentShape = 'circle'; updatePreview(); });
document.getElementById('addToHexadecagonBtn').addEventListener('click', () => { currentShape = 'hexadecagon'; updatePreview(); });
document.getElementById('addToFlowerBtn').addEventListener('click', () => { currentShape = 'flower'; updatePreview(); });

// Border Color
borderColorPicker.addEventListener('input', (e) => { currentBorderColor = e.target.value; updatePreview(); });
document.querySelectorAll('.color-preset').forEach(btn => {
    if(btn.classList.contains('text-preset')) return; // skip text presets
    btn.addEventListener('click', () => {
        currentBorderColor = btn.dataset.color;
        borderColorPicker.value = currentBorderColor;
        updatePreview();
    });
});

// Text Color
textColorPicker.addEventListener('input', (e) => { currentTextColor = e.target.value; updatePreview(); });
document.querySelectorAll('.text-preset').forEach(btn => {
    btn.addEventListener('click', () => {
        currentTextColor = btn.dataset.color;
        textColorPicker.value = currentTextColor;
        updatePreview();
    });
});

// Background Color
bgColorPicker.addEventListener('input', (e) => { currentBgColor = e.target.value; updatePreview(); });
document.querySelectorAll('.bg-preset').forEach(btn => {
    btn.addEventListener('click', () => {
        currentBgColor = btn.dataset.color;
        bgColorPicker.value = currentBgColor;
        updatePreview();
    });
});

// Text Size
document.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTextSizeClass = btn.dataset.size;
        updatePreview();
    });
});

// Shape Size
document.querySelectorAll('.shape-size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        currentSize = parseInt(btn.dataset.size);
        imageSizeSlider.value = currentSize;
        updatePreview();
    });
});
imageSizeSlider.addEventListener('input', (e) => {
    currentSize = e.target.value;
    updatePreview();
});

// Text Input
teluguText.addEventListener('input', updatePreview);

// ===================================
// 3. IMAGE ADJUSTMENT (Zoom/Move)
// ===================================
document.getElementById('zoomIn').addEventListener('click', () => { imgScale += 0.1; updatePreview(); });
document.getElementById('zoomOut').addEventListener('click', () => { imgScale = Math.max(0.1, imgScale - 0.1); updatePreview(); });
document.getElementById('moveUp').addEventListener('click', () => { imgY -= 10; updatePreview(); });
document.getElementById('moveDown').addEventListener('click', () => { imgY += 10; updatePreview(); });
document.getElementById('moveLeft').addEventListener('click', () => { imgX -= 10; updatePreview(); });
document.getElementById('moveRight').addEventListener('click', () => { imgX += 10; updatePreview(); });
document.getElementById('resetAdjust').addEventListener('click', resetImageAdjust);

function resetImageAdjust() {
    imgScale = 1; imgX = 0; imgY = 0;
    updatePreview();
}

// ===================================
// 4. RENDERING LOGIC
// ===================================

function updatePreview() {
    if (!currentMode) return;
    
    // Apply Background Color
    resultContainer.style.backgroundColor = currentBgColor;
    resultContainer.innerHTML = ''; // Clear

    // Apply Text Color & Size to Container
    resultContainer.style.color = currentTextColor;
    // Map size classes to approx pixel values for preview logic if needed, 
    // but mostly handled via CSS class on the container or element
    let fontSize = '16px';
    if(currentTextSizeClass === 'small') fontSize = '12px';
    if(currentTextSizeClass === 'medium') fontSize = '16px';
    if(currentTextSizeClass === 'large') fontSize = '20px';
    if(currentTextSizeClass === 'xl') fontSize = '24px';
    resultContainer.style.fontSize = fontSize;


    if (currentMode === 'textCircle') {
        renderTextCircle();
    } else {
        renderImageWrap();
    }
    
    downloadBtn.disabled = false;
}

function renderTextCircle() {
    // Spacers to force circle shape
    const leftSpacer = document.createElement('div');
    leftSpacer.style.float = 'left';
    leftSpacer.style.width = '50%';
    leftSpacer.style.height = '100%';
    leftSpacer.style.shapeOutside = simpleCornerLeft;
    
    const rightSpacer = document.createElement('div');
    rightSpacer.style.float = 'right';
    rightSpacer.style.width = '50%';
    rightSpacer.style.height = '100%';
    rightSpacer.style.shapeOutside = simpleCornerRight;

    // Circle Container
    const circleDiv = document.createElement('div');
    circleDiv.style.width = currentSize + 'px';
    circleDiv.style.height = currentSize + 'px';
    circleDiv.style.borderRadius = '50%';
    circleDiv.style.border = `4px solid ${currentBorderColor}`;
    circleDiv.style.margin = '0 auto';
    circleDiv.style.overflow = 'hidden';
    circleDiv.style.textAlign = 'center';
    circleDiv.style.position = 'relative';
    
    // Adjust font size relative to circle size + selection
    // Base scale factor
    let scale = 1; 
    if(currentTextSizeClass === 'small') scale = 0.8;
    if(currentTextSizeClass === 'large') scale = 1.2;
    if(currentTextSizeClass === 'xl') scale = 1.4;
    
    circleDiv.style.fontSize = (currentSize / 15 * scale) + 'px';
    circleDiv.style.color = currentTextColor;

    circleDiv.appendChild(leftSpacer);
    circleDiv.appendChild(rightSpacer);
    
    const textSpan = document.createElement('span');
    textSpan.textContent = teluguText.value;
    circleDiv.appendChild(textSpan);

    resultContainer.appendChild(circleDiv);
}

function renderImageWrap() {
    const wrapper = document.createElement('div');
    const img = document.createElement('img');
    
    wrapper.style.width = currentSize + 'px';
    wrapper.style.height = currentSize + 'px';
    wrapper.style.backgroundColor = currentBorderColor; // The "Border" is essentially the background
    // Create a slight padding to show the border color
    wrapper.style.display = 'flex';
    wrapper.style.justifyContent = 'center';
    wrapper.style.alignItems = 'center';
    
    // Position Logic
    wrapper.style.float = currentPos;
    if (currentPos === 'left') wrapper.style.margin = '0 15px 5px 0';
    else wrapper.style.margin = '0 0 5px 15px';

    // Shape Logic
    let clipStyle = '';
    if (currentShape === 'circle') {
        wrapper.style.borderRadius = '50%';
        wrapper.style.shapeOutside = 'circle(50%)';
        img.style.borderRadius = '50%';
    } else {
        const poly = currentShape === 'hexadecagon' ? hexPoly : flowerPoly;
        wrapper.style.clipPath = poly;
        wrapper.style.shapeOutside = poly;
        img.style.clipPath = poly;
    }

    // Image Styling (Adjustments)
    img.src = currentImageSrc;
    img.style.width = '100%'; 
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    // Apply Zoom & Move transform
    // Scale slightly down (0.92) to reveal border, then apply user transform
    img.style.transform = `scale(${0.92 * imgScale}) translate(${imgX}px, ${imgY}px)`;
    
    wrapper.appendChild(img);
    resultContainer.appendChild(wrapper);
    resultContainer.appendChild(document.createTextNode(teluguText.value));
}

// ===================================
// 5. DOWNLOAD LOGIC
// ===================================

const sizeModal = document.getElementById('sizeModal');
const closeModal = document.getElementById('closeModal');

downloadBtn.addEventListener('click', () => sizeModal.style.display = 'flex');
closeModal.addEventListener('click', () => sizeModal.style.display = 'none');
window.addEventListener('click', (e) => { if(e.target === sizeModal) sizeModal.style.display = 'none'; });

document.querySelectorAll('.size-option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const type = btn.dataset.type;
        const width = btn.dataset.width ? parseInt(btn.dataset.width) : null;
        const height = btn.dataset.height ? parseInt(btn.dataset.height) : null;
        sizeModal.style.display = 'none';
        
        if (type === 'auto') downloadImage(null, null, true);
        else downloadImage(width, height, false);
    });
});

async function downloadImage(width, height, isAuto) {
    downloadBtn.textContent = 'Processing...';
    downloadBtn.disabled = true;

    try {
        await new Promise(r => setTimeout(r, 200));

        let nodeToCapture = resultContainer;
        let tempContainer = null;

        // If specific size requested, create a temporary container
        if (!isAuto) {
            tempContainer = document.createElement('div');
            tempContainer.style.width = width + 'px';
            tempContainer.style.height = height + 'px';
            tempContainer.style.backgroundColor = currentBgColor;
            tempContainer.style.color = currentTextColor;
            tempContainer.style.fontFamily = "'Noto Sans Telugu', sans-serif";
            tempContainer.style.padding = '40px';
            tempContainer.style.position = 'fixed';
            tempContainer.style.left = '-9999px';
            tempContainer.style.top = '0';
            
            // Calculate Font Size for Download based on selection
            let fs = 16;
            if(currentTextSizeClass === 'small') fs = width * 0.015;
            if(currentTextSizeClass === 'medium') fs = width * 0.022;
            if(currentTextSizeClass === 'large') fs = width * 0.030;
            if(currentTextSizeClass === 'xl') fs = width * 0.040;
            tempContainer.style.fontSize = fs + 'px';

            if (currentMode === 'textCircle') {
                // Scale Circle for Download
                const scaleRatio = width / 800; // arbitrary base
                const dlSize = currentSize * scaleRatio * 1.5; 
                
                // Recreate circle structure
                const circleDiv = document.createElement('div');
                circleDiv.style.width = dlSize + 'px';
                circleDiv.style.height = dlSize + 'px';
                circleDiv.style.borderRadius = '50%';
                circleDiv.style.border = `5px solid ${currentBorderColor}`;
                circleDiv.style.margin = '0 auto';
                circleDiv.style.textAlign = 'center';
                circleDiv.style.position = 'relative';
                // Center in container
                tempContainer.style.display = 'flex';
                tempContainer.style.justifyContent = 'center';
                tempContainer.style.alignItems = 'center';

                // Spacers
                const ls = document.createElement('div');
                ls.style.float = 'left'; ls.style.width = '50%'; ls.style.height = '100%'; ls.style.shapeOutside = simpleCornerLeft;
                const rs = document.createElement('div');
                rs.style.float = 'right'; rs.style.width = '50%'; rs.style.height = '100%'; rs.style.shapeOutside = simpleCornerRight;
                
                let fontScale = 1; 
                if(currentTextSizeClass === 'small') fontScale = 0.8;
                if(currentTextSizeClass === 'xl') fontScale = 1.4;
                circleDiv.style.fontSize = (dlSize / 15 * fontScale) + 'px';
                circleDiv.style.color = currentTextColor;

                circleDiv.appendChild(ls);
                circleDiv.appendChild(rs);
                const span = document.createElement('span');
                span.textContent = teluguText.value;
                circleDiv.appendChild(span);
                tempContainer.appendChild(circleDiv);

            } else {
                // Image Wrap Mode
                // Scale Image
                const dlImgSize = Math.min(width, height) * 0.35;
                const wrapper = document.createElement('div');
                const img = document.createElement('img');
                
                wrapper.style.width = dlImgSize + 'px';
                wrapper.style.height = dlImgSize + 'px';
                wrapper.style.backgroundColor = currentBorderColor;
                wrapper.style.display = 'flex';
                wrapper.style.justifyContent = 'center';
                wrapper.style.alignItems = 'center';
                wrapper.style.float = currentPos;
                
                // Margins
                const marginSize = width * 0.02;
                if (currentPos === 'left') wrapper.style.margin = `0 ${marginSize}px ${marginSize}px 0`;
                else wrapper.style.margin = `0 0 ${marginSize}px ${marginSize}px`;

                let clipStyle = '';
                if (currentShape === 'circle') {
                    wrapper.style.borderRadius = '50%';
                    wrapper.style.shapeOutside = 'circle(50%)';
                    img.style.borderRadius = '50%';
                } else {
                    const poly = currentShape === 'hexadecagon' ? hexPoly : flowerPoly;
                    wrapper.style.clipPath = poly;
                    wrapper.style.shapeOutside = poly;
                    img.style.clipPath = poly;
                }
                
                img.src = currentImageSrc;
                img.style.width = '100%'; img.style.height = '100%'; img.style.objectFit = 'cover';
                img.style.transform = `scale(${0.92 * imgScale}) translate(${imgX}px, ${imgY}px)`;

                wrapper.appendChild(img);
                tempContainer.appendChild(wrapper);
                tempContainer.appendChild(document.createTextNode(teluguText.value));
            }

            document.body.appendChild(tempContainer);
            nodeToCapture = tempContainer;
        }

        const dataUrl = await htmlToImage.toPng(nodeToCapture, {
            backgroundColor: currentBgColor, // Use custom BG
            pixelRatio: 2
        });

        if(tempContainer) document.body.removeChild(tempContainer);

        const link = document.createElement('a');
        link.download = `telugu-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();

    } catch (err) {
        console.error(err);
        alert('Error downloading.');
    } finally {
        downloadBtn.textContent = '⬇️ Download';
        downloadBtn.disabled = false;
    }
}

// Security: Print Screen Block
document.addEventListener('keydown', (e) => {
    if (e.key === 'PrintScreen') {
        try { navigator.clipboard.writeText(''); } catch(e){}
        screenshotWarning.style.display = 'flex';
        setTimeout(() => screenshotWarning.style.display = 'none', 2000);
    }
});
document.addEventListener('contextmenu', e => e.preventDefault());