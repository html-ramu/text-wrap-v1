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

// Store current state
let currentImageSrc = null;
let currentShape = null;
let currentSize = 100;
let dominantColor = '#667eea';

// POLYGON STRINGS
const hexadecagonPoly = 'polygon(50% 0%, 69% 4%, 85% 15%, 96% 31%, 100% 50%, 96% 69%, 85% 85%, 69% 96%, 50% 100%, 31% 96%, 15% 85%, 4% 69%, 0% 50%, 4% 31%, 15% 15%, 31% 4%)';
const flowerPoly = 'polygon(50% 0%, 56% 12%, 60% 2%, 65% 13%, 69% 4%, 73% 16%, 77% 8%, 80% 20%, 85% 15%, 85% 26%, 92% 23%, 89% 34%, 98% 33%, 91% 42%, 100% 44%, 91% 51%, 98% 57%, 89% 60%, 92% 69%, 85% 68%, 85% 78%, 78% 74%, 75% 86%, 69% 79%, 64% 91%, 60% 82%, 54% 93%, 50% 84%, 46% 93%, 40% 82%, 36% 91%, 31% 79%, 25% 86%, 22% 74%, 15% 78%, 15% 68%, 8% 69%, 11% 60%, 2% 57%, 9% 51%, 0% 44%, 9% 42%, 2% 33%, 11% 34%, 8% 23%, 15% 26%, 15% 15%, 20% 20%, 23% 8%, 27% 16%, 31% 4%, 35% 13%, 40% 2%, 44% 12%)';

// Initialize ColorThief
const colorThief = new ColorThief();

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

// ADD TO CIRCLE BUTTON
addToCircleBtn.addEventListener('click', function() {
    if (currentImageSrc) {
        clearAllShapes();
        currentShape = 'circle';
        placeImageInShape(circleZone, 'circle');
        updatePreview();
    }
});

// ADD TO HEXADECAGON BUTTON
addToHexadecagonBtn.addEventListener('click', function() {
    if (currentImageSrc) {
        clearAllShapes();
        currentShape = 'hexadecagon';
        placeImageInShape(hexadecagonZone, 'hexadecagon');
        updatePreview();
    }
});

// ADD TO FLOWER BUTTON
addToFlowerBtn.addEventListener('click', function() {
    if (currentImageSrc) {
        clearAllShapes();
        currentShape = 'flower';
        placeImageInShape(flowerZone, 'flower');
        updatePreview();
    }
});

// Clear all shapes
function clearAllShapes() {
    circleZone.innerHTML = '<div class="circle-preview"><span class="drop-text">⭕</span></div>';
    hexadecagonZone.innerHTML = '<div class="hexadecagon-preview"><span class="drop-text">⚙️</span></div>';
    flowerZone.innerHTML = '<div class="flower-preview"><span class="drop-text">🌸</span></div>';
    
    circleZone.classList.remove('has-image');
    hexadecagonZone.classList.remove('has-image');
    flowerZone.classList.remove('has-image');
}

// Place image in shape
function placeImageInShape(zone, shape) {
    let shapeClass = '';
    if(shape === 'circle') shapeClass = 'circle-shape';
    else if(shape === 'hexadecagon') shapeClass = 'hexadecagon-shape';
    else if(shape === 'flower') shapeClass = 'flower-shape';
    
    zone.innerHTML = `
        <img src="${currentImageSrc}" 
             class="shape-image ${shapeClass}" 
             alt="Image"
             style="width: ${currentSize}px; height: ${currentSize}px; border: 4px solid ${dominantColor};">
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
    
    let shapeClass = '';
    if(currentShape === 'circle') shapeClass = 'circle-shape';
    else if(currentShape === 'hexadecagon') shapeClass = 'hexadecagon-shape';
    else if(currentShape === 'flower') shapeClass = 'flower-shape';
    
    resultContainer.innerHTML = `
        <img 
            src="${currentImageSrc}" 
            class="wrapped-image ${shapeClass}"
            style="width: ${currentSize}px; height: ${currentSize}px; border: 4px solid ${dominantColor};"
            alt="${currentShape}">
        ${text}
    `;
    
    downloadBtn.style.display = 'block';
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

// DOWNLOAD SIZE SELECTION
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

// AUTO SIZE DOWNLOAD
async function downloadAutoSize() {
    downloadBtn.disabled = true;
    downloadBtn.textContent = 'Processing...';
    
    try {
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const canvas = await html2canvas(resultContainer, {
            backgroundColor: '#ffffff',
            scale: 3,
            logging: false,
            useCORS: true,
            allowTaint: true,
            onclone: function(clonedDoc) {
                const clonedContainer = clonedDoc.getElementById('resultContainer');
                if (clonedContainer) {
                    clonedContainer.style.fontFamily = "'Noto Sans Telugu', sans-serif";
                }
            }
        });
        
        canvas.toBlob(function(blob) {
            if (!blob) {
                throw new Error('Failed to create image');
            }
            
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const timestamp = new Date().getTime();
            
            link.download = `telugu-text-wrap-${currentShape}-auto-${timestamp}.png`;
            link.href = url;
            link.click();
            
            setTimeout(() => URL.revokeObjectURL(url), 100);
            
            downloadBtn.disabled = false;
            downloadBtn.textContent = '⬇️ Download';
        }, 'image/png', 0.95);
        
    } catch (error) {
        console.error('Download failed:', error);
        alert('Download failed. Please try again.');
        
        downloadBtn.disabled = false;
        downloadBtn.textContent = '⬇️ Download';
    }
}

// FIXED SIZE DOWNLOAD
async function downloadWithSize(width, height) {
    downloadBtn.disabled = true;
    downloadBtn.textContent = 'Processing...';
    
    try {
        const imageCircleSize = Math.min(width, height) * 0.35;
        const borderWidth = imageCircleSize * 0.04;
        const fontSize = width * 0.024;
        
        const tempContainer = document.createElement('div');
        tempContainer.style.width = width + 'px';
        tempContainer.style.height = height + 'px';
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.background = '#ffffff';
        tempContainer.style.padding = '40px';
        tempContainer.style.boxSizing = 'border-box';
        tempContainer.style.fontFamily = "'Noto Sans Telugu', sans-serif";
        tempContainer.style.fontSize = fontSize + 'px';
        tempContainer.style.lineHeight = '1.8';
        tempContainer.style.color = '#333';
        tempContainer.style.textAlign = 'justify';
        tempContainer.style.borderRadius = '20px';
        
        const text = teluguText.value;
        let shapeCSS = '';
        
        if (currentShape === 'circle') {
            shapeCSS = 'border-radius: 50%; shape-outside: circle(50%);';
        } else if (currentShape === 'hexadecagon') {
            shapeCSS = `clip-path: ${hexadecagonPoly}; shape-outside: ${hexadecagonPoly};`;
        } else if (currentShape === 'flower') {
            shapeCSS = `clip-path: ${flowerPoly}; shape-outside: ${flowerPoly};`;
        }
        
        tempContainer.innerHTML = `
            <img 
                src="${currentImageSrc}" 
                style="float: left; 
                       margin: 0 ${fontSize * 1.2}px ${fontSize * 0.8}px 0; 
                       ${shapeCSS}
                       width: ${imageCircleSize}px; 
                       height: ${imageCircleSize}px; 
                       border: ${borderWidth}px solid ${dominantColor}; 
                       object-fit: cover;"
                alt="${currentShape}">
            ${text}
        `;
        
        document.body.appendChild(tempContainer);
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const canvas = await html2canvas(tempContainer, {
            backgroundColor: '#ffffff',
            scale: 2,
            width: width,
            height: height,
            logging: false,
            useCORS: true,
            allowTaint: true
        });
        
        document.body.removeChild(tempContainer);
        
        canvas.toBlob(function(blob) {
            if (!blob) {
                throw new Error('Failed to create image');
            }
            
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const timestamp = new Date().getTime();
            
            link.download = `telugu-text-wrap-${currentShape}-${width}x${height}-${timestamp}.png`;
            link.href = url;
            link.click();
            
            setTimeout(() => URL.revokeObjectURL(url), 100);
            
            downloadBtn.disabled = false;
            downloadBtn.textContent = '⬇️ Download';
        }, 'image/png', 0.95);
        
    } catch (error) {
        console.error('Download failed:', error);
        alert('Download failed. Please try again.');
        
        downloadBtn.disabled = false;
        downloadBtn.textContent = '⬇️ Download';
    }
}

// MOBILE: Tap to upload
imagePreview.addEventListener('click', function(e) {
    if (!e.target.closest('.add-buttons') && !previewImg.classList.contains('visible')) {
        imageUpload.click();
    }
});

// ENSURE FONTS ARE LOADED
window.addEventListener('load', function() {
    if (document.fonts) {
        document.fonts.ready.then(function() {
            console.log('Telugu fonts loaded successfully');
        });
    }
});