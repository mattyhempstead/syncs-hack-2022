const { imageHelpers } = window.canva;
const canva = window.canva.init();

class ControlAttribute {
  constructor(label, type, values) {
    this.label = label;
    this.type = type; 
    this.values = values; // possible values to be passed to AI
    this.current = ""; // value to be passed to AI
    switch (this.type) {
      case "slider":
        this.control = canva.create("slider", {
          id: label,
          label: label,
          value: 0,
          min: 0,
          max: values.length - 1,
          step: 1,
        });
        break;
      case "checkbox":
        this.control = canva.create("checkbox", {
          id: label,
          label: label,
          disabled: false,
          checked: false,
        });
        break;
      case "select":
        this.control = canva.create("select", {
          id: label,
          value: values,
          options: values
        });
      default:
        console.log("Invalid type: ", type)
    }
  }
};

const advancedControlAttributes = {
  "Van-Go": new ControlAttribute("Van-Go", "slider", [
    "", "With a Van", "In impressionist style",
    "In post-impressionist style", "In the style of Van Gogh"]
  ),
  "Anime Style": new ControlAttribute("Anime Style", "checkbox", ["", "In the style of anime"]),
  "Synthetic": new ControlAttribute("Synthetic", "checkbox", ["", "Digital art"]),
  "Apocalypse": new ControlAttribute("Apocalypse", "checkbox", ["", "In hell, demonic, on fire, Ultra 4K"]),
  "Old": new ControlAttribute("Old", "checkbox", ["", "circa 1920"]),
  "Realistic": new ControlAttribute("Realistic", "checkbox", ["", "Realistic photo, shot with Nikon d950 sigma 50mm 1.4 lens"]),
  "Art Style": new ControlAttribute("Art Style", "select", ["", "Abstract", "Impressionist", "Pop art", "Cubism", "Surrealism", "Contemporary", "Fantasy"]),
}

const getControlQueryString = () => {
  let queryString = "";
  for (let control of Object.values(advancedControlAttributes)) {
    if (control.current !== "") {
      queryString = queryString + ", " + control.current;
    }
  }
  return queryString
}

const state = {
  canvas: null,
  imageElement: null,
  captionText: null,
  showAdvancedControls: false,
};

canva.onReady(async (opts) => {
  //window.localStorage.setItem('hi', 'hello');
  const image = await imageHelpers.fromElement(opts.element, "preview");
  state.canvas = await imageHelpers.toCanvas(image);
  state.imageElement = await imageHelpers.toImageElement(image);
  document.body.appendChild(state.canvas);
  renderControls();
});

// Event listener for all the UI elements
canva.onControlsEvent(async (opts) => {
  let mval = opts.message.message.value;
  if (opts.message.controlId === "startRemoteImageProcessingButton") {
      console.log("generate image button pressed");
      canva.toggleSpinner("preview",true);
      console.log("calling canva.remoteProcess with opts:");
      opts = {
        settings: JSON.stringify({
            caption: state.captionText + " " + getControlQueryString(),
        }),
      };
      const result = await canva.remoteProcess(opts);
      console.log("received remoteProcess result:");
      console.log(result);
      const image = await imageHelpers.fromUrl(result.fullImage.url);
      state.imageElement = await imageHelpers.toImageElement(image);
      renderImage();
      canva.toggleSpinner("preview",false);

  } else if (opts.message.controlType === "text_input") {
      console.log("Updating text state");
      state[opts.message.controlId] = opts.message.message.value;
  } else if (opts.message.controlType === "slider") {
     const advancedControl = advancedControlAttributes[opts.message.controlId];
     const val = advancedControlAttributes[opts.message.controlId].values[mval]
     advancedControl.control.value = opts.message.message.value; 
     advancedControl.current = val;
  } else if (opts.message.controlType === "checkbox") {
    if (opts.message.controlId === "showAdvancedControlsButton") {
      state.showAdvancedControls = !state.showAdvancedControls
    } else {
      const advancedControl = advancedControlAttributes[opts.message.controlId];
      const val = advancedControl.values[advancedControl.control.checked ? 0 : 1]
      advancedControl.current = val;
      advancedControl.control.checked = !advancedControl.control.checked;
    }
  } else if (opts.message.controlType === "select") {
     const advancedControl = advancedControlAttributes[opts.message.controlId];
     const val = advancedControlAttributes[opts.message.controlId].values[mval]
     advancedControl.control.value = opts.message.message.value; 
     advancedControl.current = val;
  }
  console.log("Query string:")
  console.log(getControlQueryString());
  //const result = await canva.remoteProcess();
  //console.log(result);
  renderControls();
});

canva.onImageUpdate(async (opts) => {
    renderImage();
});

canva.onSaveRequest(async () => {
    const canvas = document.querySelector("canvas");
    return await imageHelpers.fromCanvas("image/jpeg", canvas);
});

function renderControls() {
  // Controls that are always shown
  const mainControls = [
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
    canva.create("checkbox", {
      id: "showAdvancedControlsButton",
      label: "Show Advanced Controls",
      disabled: false,
      checked: state.showAdvancedControls
    }),
  ];

  const advancedControls = Object.values(advancedControlAttributes).map(
    attr => attr.control
  );

  const controls = state.showAdvancedControls
    ? mainControls.concat(advancedControls)
    : mainControls
  canva.updateControlPanel(controls);
}

function renderImage() {
    const context = state.canvas.getContext("2d");
    console.log("rendering image");
    console.log(state.imageElement);
    console.log(state.imageElement)
    context.drawImage(state.imageElement, 0, 0, state.canvas.width, state.canvas.height);
}
