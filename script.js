// Get all DOM elements
const imageUpload = document.getElementById('imageUpload');
const previewImg = document.getElementById('previewImg');
const imagePreview = document.getElementById('imagePreview');
const noImageText = imagePreview.querySelector('.no-image');
const circleZone = document.getElementById('circleZone');
const teluguText = document.getElementById('teluguText');
const imageSize = document.getElementById('imageSize');
const sizeValue = document.getElementById('sizeValue');
const resultContainer = document.getElementById('resultContainer');
const downloadBtn = document.getElementById('downloadBtn');

// Store current state
let currentImageSrc = null;
let hasImageInCircle = false;
let currentSize = 100;

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
            previewImg.draggable = true;
        };
        
        reader.readAsDataURL(file);
    }
});

// ==========================================
// DRAG AND DROP
// ==========================================

// Start dragging
previewImg.addEventListener('dragstart', function(e) {
    e.dataTransfer.effectAllowed = 'copy';
    this.style.opacity = '0.5';
});

// End dragging
previewImg.addEventListener('dragend', function(e) {
    this.style.opacity = '1';
});

// Prevent defaults
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    circleZone.addEventListener(eventName, function(e) {
        e.preventDefault();
        e.stopPropagation();
    }, false);
});

// Highlight on drag over
['dragenter', 'dragover'].forEach(eventName => {
    circleZone.addEventListener(eventName, function() {
        circleZone.classList.add('drag-over');
    }, false);
});

['dragleave', 'drop'].forEach(eventName => {
    circleZone.addEventListener(eventName, function() {
        circleZone.classList.remove('drag-over');
    }, false);
});

// Handle drop
circleZone.addEventListener('drop', function(e) {
    if (currentImageSrc) {
        placeImageInCircle();
        updatePreview();
    }
}, false);

// Place image in circle
function placeImageInCircle() {
    circleZone.innerHTML = `
        <img src="${currentImageSrc}" 
             class="circle-image" 
             alt="Image"
             style="width: ${currentSize}px; height: ${currentSize}px;">
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
        resultContainer.innerHTML = '<p class="placeholder">Drag image to circle</p>';
        downloadBtn.style.display = 'none';
        return;
    }
    
    // Create wrapped content
    resultContainer.innerHTML = `
        <img 
            src="${currentImageSrc}" 
            class="wrapped-image"
            style="width: ${currentSize}px; height: ${currentSize}px;"
            alt="Circle">
        ${text}
    `;
    
    // Show download button
    downloadBtn.style.display = 'block';
}

// ==========================================
// HIGH QUALITY DOWNLOAD WITH FONT FIX
// ==========================================

downloadBtn.addEventListener('click', async function() {
    // Disable button during download
    downloadBtn.disabled = true;
    downloadBtn.textContent = 'Processing...';
    
    try {
        // Wait a bit to ensure fonts are rendered
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Capture with html2canvas
        const canvas = await html2canvas(resultContainer, {
            backgroundColor: '#ffffff',
            scale: 3, // 3x for good quality and reasonable file size
            logging: false,
            useCORS: true,
            allowTaint: true,
            onclone: function(clonedDoc) {
                // Ensure the cloned document has proper styles
                const clonedContainer = clonedDoc.getElementById('resultContainer');
                if (clonedContainer) {
                    clonedContainer.style.fontFamily = "'Noto Sans Telugu', sans-serif";
                }
            }
        });
        
        // Convert to blob and download
        canvas.toBlob(function(blob) {
            if (!blob) {
                throw new Error('Failed to create image');
            }
            
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const timestamp = new Date().getTime();
            
            link.download = `telugu-text-wrap-${timestamp}.png`;
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
});

// ==========================================
// MOBILE: Tap to upload
// ==========================================

imagePreview.addEventListener('click', function() {
    if (!previewImg.classList.contains('visible')) {
        imageUpload.click();
    }
});

// ==========================================
// ENSURE FONTS ARE LOADED ON PAGE LOAD
// ==========================================

window.addEventListener('load', function() {
    // Check if fonts are loaded
    if (document.fonts) {
        document.fonts.ready.then(function() {
            console.log('Telugu fonts loaded successfully');
        });
    }
});