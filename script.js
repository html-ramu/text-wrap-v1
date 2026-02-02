// Get all DOM elements
const imageUpload = document.getElementById('imageUpload');
const previewImg = document.getElementById('previewImg');
const imagePreview = document.getElementById('imagePreview');
const noImageText = imagePreview.querySelector('.no-image');
const addToCircleBtn = document.getElementById('addToCircleBtn');
const circleZone = document.getElementById('circleZone');
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
let hasImageInCircle = false;
let currentSize = 100;
let dominantColor = '#667eea';

// Initialize ColorThief
const colorThief = new ColorThief();

// ==========================================
// IMAGE UPLOAD
// ==========================================

imageUpload.addEventListener('change', function(e) {
    const file = e.target.files[0];
    
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        
        reader.onload = function(event) {
            currentImageSrc = event.target.result;
            previewImg.src = currentImageSrc;
            previewImg.classList.add('visible');
            noImageText.classList.add('hidden');
            
            // Show "Add to Circle" button
            addToCircleBtn.style.display = 'inline-block';
            
            // Extract dominant color when image loads
            previewImg.onload = function() {
                try {
                    const color = colorThief.getColor(previewImg);
                    dominantColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
                    console.log('Dominant color:', dominantColor);
                } catch (error) {
                    console.log('Using default color');
                    dominantColor = '#667eea';
                }
            };
        };
        
        reader.readAsDataURL(file);
    }
});

// ==========================================
// ADD TO CIRCLE BUTTON
// ==========================================

addToCircleBtn.addEventListener('click', function() {
    if (currentImageSrc) {
        placeImageInCircle();
        updatePreview();
    }
});

// Place image in circle with colored border
function placeImageInCircle() {
    circleZone.innerHTML = `
        <img src="${currentImageSrc}" 
             class="circle-image" 
             alt="Image"
             style="width: ${currentSize}px; height: ${currentSize}px; border: 4px solid ${dominantColor};">
    `;
    circleZone.classList.add('has-image');
    hasImageInCircle = true;
}

// ==========================================
// SIZE CONTROL
// ==========================================

imageSize.addEventListener('input', function(e) {
    currentSize = e.target.value;
    sizeValue.textContent = currentSize + 'px';
    
    // Update circle image if exists
    if (hasImageInCircle) {
        placeImageInCircle();
    }
    
    updatePreview();
});

// ==========================================
// TEXT INPUT
// ==========================================

teluguText.addEventListener('input', updatePreview);

// ==========================================
// UPDATE PREVIEW
// ==========================================

function updatePreview() {
    const text = teluguText.value.trim();
    
    // If no image in circle or no text
    if (!hasImageInCircle || !currentImageSrc || !text) {
        resultContainer.innerHTML = '<p class="placeholder">Choose image and add to circle</p>';
        downloadBtn.style.display = 'none';
        return;
    }
    
    // Create wrapped content with colored border
    resultContainer.innerHTML = `
        <img 
            src="${currentImageSrc}" 
            class="wrapped-image"
            style="width: ${currentSize}px; height: ${currentSize}px; border: 4px solid ${dominantColor};"
            alt="Circle">
        ${text}
    `;
    
    // Show download button
    downloadBtn.style.display = 'block';
}

// ==========================================
// MODAL HANDLING
// ==========================================

// Show modal when download button clicked
downloadBtn.addEventListener('click', function() {
    sizeModal.classList.add('show');
});

// Close modal when X clicked
closeModal.addEventListener('click', function() {
    sizeModal.classList.remove('show');
});

// Close modal when clicking outside
sizeModal.addEventListener('click', function(e) {
    if (e.target === sizeModal) {
        sizeModal.classList.remove('show');
    }
});

// ==========================================
// DOWNLOAD WITH SIZE SELECTION
// ==========================================

sizeOptionBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        const width = parseInt(this.dataset.width);
        const height = parseInt(this.dataset.height);
        
        // Close modal
        sizeModal.classList.remove('show');
        
        // Start download with selected size
        downloadWithSize(width, height);
    });
});

async function downloadWithSize(width, height) {
    // Show processing state
    downloadBtn.disabled = true;
    downloadBtn.textContent = 'Processing...';
    
    try {
        // Create a temporary container with exact size
        const tempContainer = document.createElement('div');
        tempContainer.style.width = width + 'px';
        tempContainer.style.height = height + 'px';
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.background = '#ffffff';
        tempContainer.style.padding = '30px';
        tempContainer.style.boxSizing = 'border-box';
        tempContainer.style.fontFamily = "'Noto Sans Telugu', sans-serif";
        tempContainer.style.fontSize = '16px';
        tempContainer.style.lineHeight = '1.7';
        tempContainer.style.color = '#333';
        tempContainer.style.textAlign = 'justify';
        
        // Clone the content
        const text = teluguText.value;
        tempContainer.innerHTML = `
            <img 
                src="${currentImageSrc}" 
                style="float: left; margin: 0 20px 15px 0; border-radius: 50%; 
                       width: ${currentSize * 1.5}px; height: ${currentSize * 1.5}px; 
                       border: 6px solid ${dominantColor}; object-fit: cover;
                       shape-outside: circle(50%);"
                alt="Circle">
            ${text}
        `;
        
        document.body.appendChild(tempContainer);
        
        // Wait for fonts and images to load
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Capture with html2canvas
        const canvas = await html2canvas(tempContainer, {
            backgroundColor: '#ffffff',
            scale: 2,
            width: width,
            height: height,
            logging: false,
            useCORS: true,
            allowTaint: true
        });
        
        // Remove temp container
        document.body.removeChild(tempContainer);
        
        // Convert to blob and download
        canvas.toBlob(function(blob) {
            if (!blob) {
                throw new Error('Failed to create image');
            }
            
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const timestamp = new Date().getTime();
            
            link.download = `telugu-text-wrap-${width}x${height}-${timestamp}.png`;
            link.href = url;
            link.click();
            
            // Cleanup
            setTimeout(() => URL.revokeObjectURL(url), 100);
            
            // Re-enable button
            downloadBtn.disabled = false;
            downloadBtn.textContent = '⬇️ Download';
        }, 'image/png', 0.95);
        
    } catch (error) {
        console.error('Download failed:', error);
        alert('Download failed. Please try again.');
        
        // Re-enable button
        downloadBtn.disabled = false;
        downloadBtn.textContent = '⬇️ Download';
    }
}

// ==========================================
// MOBILE: Tap to upload
// ==========================================

imagePreview.addEventListener('click', function(e) {
    if (e.target !== addToCircleBtn && !previewImg.classList.contains('visible')) {
        imageUpload.click();
    }
});

// ==========================================
// ENSURE FONTS ARE LOADED
// ==========================================

window.addEventListener('load', function() {
    if (document.fonts) {
        document.fonts.ready.then(function() {
            console.log('Telugu fonts loaded successfully');
        });
    }
});