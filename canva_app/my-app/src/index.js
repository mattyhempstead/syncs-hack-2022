const { imageHelpers } = window.canva;
const canva = window.canva.init();

const state = {
  canvas: null,
  imageElement: null,
  captionText: null,
};

canva.onReady(async (opts) => {
  const image = await imageHelpers.fromElement(opts.element, "preview");
  state.canvas = await imageHelpers.toCanvas(image);
  state.imageElement = await imageHelpers.toImageElement(image);
  document.body.appendChild(state.canvas);
  renderControls();
});

canva.onControlsEvent(async (opts) => {
  if (opts.message.controlId === "startRemoteImageProcessingButton") {
      console.log("generate image button pressed");
      console.log(opts);
      canva.toggleSpinner("preview",true);
      console.log("calling canva.remoteProcess with opts:");
      opts = {
        settings: JSON.stringify({
            caption: state.captionText,
        }),
      };
      console.log(opts);
      const result = await canva.remoteProcess(opts);
      console.log("received remoteProcess result:");
      console.log(result);
      const image = await imageHelpers.fromUrl(result.fullImage.url);
      state.imageElement = await imageHelpers.toImageElement(image);
      renderImage();
      canva.toggleSpinner("preview",false);

  } else if (opts.message.controlType === "text_input") {
      console.log("Updating text state");
      console.log(opts);
      console.log(state);
      state[opts.message.controlId] = opts.message.message.value;
  }
  //const result = await canva.remoteProcess();
  //console.log(result);
});

canva.onImageUpdate(async (opts) => {
    renderImage();
});

canva.onSaveRequest(async () => {
    const canvas = document.querySelector("canvas");
    return await imageHelpers.fromCanvas("image/jpeg", canvas);
});

function renderControls() {
  const controls = [
    canva.create("text_input", {
        inputType: "text",
        id: "captionText",
        placeholder: "Describe your desired image.",
        label: "Image caption",
        name: "captionText",
        disabled: false,
        value: state.captionText,
   }),
    canva.create("button", {
      id: "startRemoteImageProcessingButton",
      label: "Generate Image",
    }),
  ];
  canva.updateControlPanel(controls);
}

function renderImage() {
    const context = state.canvas.getContext("2d");
    console.log("rendering image");
    console.log(state.imageElement);
    console.log(img)
    context.drawImage(img, 0, 0, state.canvas.width, state.canvas.height);
}
