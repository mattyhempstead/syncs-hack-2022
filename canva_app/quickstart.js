// Get helper methods for working with images
const { imageHelpers } = window.canva;

// Initialize the client
const canva = window.canva.init();

// The extension has loaded
canva.onReady(async (opts) => {
  // Convert the CanvaElement into a CanvaImageBlob
  const image = await imageHelpers.fromElement(opts.element, "preview");

  // Convert the CanvaImageBlob into a HTMLCanvasElement
  const canvas = await imageHelpers.toCanvas(image);

  // Render the user's image in the iframe
  document.body.appendChild(canvas);

  // Get a 2D drawing context
  const context = canvas.getContext("2d");

  // Invert the colors of the user's image
  context.filter = "invert(100%)";

  // Draw the inverted image into the HTMLCanvasElement
  context.drawImage(canvas, 0, 0, canvas.width, canvas.height);

  // Render the control panel. (This is always required, even if
  // the extension doesn't have rich controls.)
  canva.updateControlPanel([]);
});

// Canva has requested the extension to update the user's image
canva.onImageUpdate(async (opts) => {
  // Get the updated image
  const img = await imageHelpers.toImageElement(opts.image);

  // Get the HTMLCanvasElement that contains the user's image
  const canvas = document.querySelector("canvas");

  // Get a 2D drawing context
  const context = canvas.getContext("2d");

  // Draw the updated image into the HTMLCanvasElement
  context.drawImage(img, 0, 0, canvas.width, canvas.height);
});

// Canva has requested the extension to save the user's image
canva.onSaveRequest(async () => {
  // Get the HTMLCanvasElement that contains the user's image
  const canvas = document.querySelector("canvas");

  // Return the image to Canva as a CanvaImageBlob
  return await imageHelpers.fromCanvas("image/jpeg", canvas);
});
