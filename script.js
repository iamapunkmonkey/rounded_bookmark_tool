document.getElementById('drop-zone').addEventListener('click', () => {
    document.getElementById('upload').click();
});

document.getElementById('upload').addEventListener('change', handleImageUpload);
document.getElementById('drop-zone').addEventListener('dragover', handleDragOver);
document.getElementById('drop-zone').addEventListener('drop', handleDrop);
document.getElementById('download').addEventListener('click', downloadImage);

let originalFileName = '';

function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'copy';
}

function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();

    const file = event.dataTransfer.files[0];
    processFile(file);
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    processFile(file);
}

function processFile(file) {
    originalFileName = file.name;
    const reader = new FileReader();

    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            processImage(img);
        }
        img.src = e.target.result;
    }
    reader.readAsDataURL(file);
}

function processImage(img) {
    const displayCanvas = document.getElementById('display-canvas');
    const displayCtx = displayCanvas.getContext('2d');
    const fullCanvas = document.createElement('canvas');
    const fullCtx = fullCanvas.getContext('2d');
    const radius = 30; // Adjust the radius as needed
    const holeDiameter = 50; // Adjust the hole diameter as needed

    // Calculate scale factor to fit image within the viewport
    const maxWidth = window.innerWidth * 0.9;
    const maxHeight = window.innerHeight * 0.7;
    const scaleFactor = Math.min(maxWidth / img.width, maxHeight / img.height);

    const displayWidth = img.width * scaleFactor;
    const displayHeight = img.height * scaleFactor;

    // Set display canvas size
    displayCanvas.width = displayWidth;
    displayCanvas.height = displayHeight;

    // Draw the image with rounded corners on the display canvas
    displayCtx.clearRect(0, 0, displayCanvas.width, displayCanvas.height);
    displayCtx.save();
    displayCtx.beginPath();
    displayCtx.moveTo(radius * scaleFactor, 0);
    displayCtx.arcTo(displayCanvas.width, 0, displayCanvas.width, displayCanvas.height, radius * scaleFactor);
    displayCtx.arcTo(displayCanvas.width, displayCanvas.height, 0, displayCanvas.height, radius * scaleFactor);
    displayCtx.arcTo(0, displayCanvas.height, 0, 0, radius * scaleFactor);
    displayCtx.arcTo(0, 0, displayCanvas.width, 0, radius * scaleFactor);
    displayCtx.closePath();
    displayCtx.clip();
    displayCtx.drawImage(img, 0, 0, displayWidth, displayHeight);
    displayCtx.restore();

    // Add the transparent hole
    displayCtx.save();
    displayCtx.globalCompositeOperation = 'destination-out';
    displayCtx.beginPath();
    const displayHoleX = displayCanvas.width / 2;
    const displayHoleY = displayCanvas.height * 0.03 + (holeDiameter * scaleFactor) / 2;
    displayCtx.arc(displayHoleX, displayHoleY, (holeDiameter * scaleFactor) / 2, 0, Math.PI * 2);
    displayCtx.fill();
    displayCtx.restore();

    // Set full-size canvas dimensions
    fullCanvas.width = img.width;
    fullCanvas.height = img.height;

    // Draw the image with rounded corners on the full-size canvas
    fullCtx.clearRect(0, 0, fullCanvas.width, fullCanvas.height);
    fullCtx.save();
    fullCtx.beginPath();
    fullCtx.moveTo(radius, 0);
    fullCtx.arcTo(fullCanvas.width, 0, fullCanvas.width, fullCanvas.height, radius);
    fullCtx.arcTo(fullCanvas.width, fullCanvas.height, 0, fullCanvas.height, radius);
    fullCtx.arcTo(0, fullCanvas.height, 0, 0, radius);
    fullCtx.arcTo(0, 0, fullCanvas.width, 0, radius);
    fullCtx.closePath();
    fullCtx.clip();
    fullCtx.drawImage(img, 0, 0);
    fullCtx.restore();

    // Add the transparent hole
    fullCtx.save();
    fullCtx.globalCompositeOperation = 'destination-out';
    fullCtx.beginPath();
    const holeX = fullCanvas.width / 2;
    const holeY = fullCanvas.height * 0.03 + holeDiameter / 2;
    fullCtx.arc(holeX, holeY, holeDiameter / 2, 0, Math.PI * 2);
    fullCtx.fill();
    fullCtx.restore();

    document.getElementById('download').style.display = 'block';

    // Store the full-size canvas for downloading
    document.getElementById('download').fullCanvas = fullCanvas;
}

function downloadImage() {
    const fullCanvas = document.getElementById('download').fullCanvas;
    const link = document.createElement('a');
    link.href = fullCanvas.toDataURL();

    // Add the prefix to the original file name
    const newFileName = 'formatted_' + originalFileName;
    link.download = newFileName;

    link.click();
}
