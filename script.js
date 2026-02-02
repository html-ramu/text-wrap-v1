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

// Store current state
let currentImageSrc = null;
let hasImageInCircle = false;
let currentSize = 100;
let dominantColor = '#667eea'; // Default color

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
// HIGH QUALITY DOWNLOAD
// ==========================================

downloadBtn.addEventListener('click', async function() {
    // Disable button during download
    downloadBtn.disabled = true;
    downloadBtn.textContent = 'Processing...';
    
    try {
        // Wait a bit to ensure everything is rendered
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Capture with html2canvas
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

imagePreview.addEventListener('click', function(e) {
    // Only trigger upload if clicking on the preview area (not the button)
    if (e.target !== addToCircleBtn && !previewImg.classList.contains('visible')) {
        imageUpload.click();
    }
});

// ==========================================
// ENSURE FONTS AND LIBRARIES ARE LOADED
// ==========================================

window.addEventListener('load', function() {
    if (document.fonts) {
        document.fonts.ready.then(function() {
            console.log('Telugu fonts loaded successfully');
        });
    }
});