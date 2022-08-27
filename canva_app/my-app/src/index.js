const { imageHelpers } = window.canva;
const canva = window.canva.init();

class ControlAttribute {
  constructor(label, type, values) {
    this.label = label;
    this.type = type;
    this.values = values;
    this.current = "";
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
          value: values[0],
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
  "Apocalypse": new ControlAttribute("Apocalypse", "checkbox", ["", "Everything is on fire and there are demons in my butthoole"]),
  "Art Style": new ControlAttribute("Art Style", "select", ["", "Abstract", "Impressionist", "Pop art", "Cubism", "Surrealism", "Contemporary", "Fantasy"]),
}

const getControlQueryString = () => {
  let queryString = "";
  console.log(Object.values(advancedControlAttributes));advancedControlAttributes
  for (let control of Object.values(advancedControlAttributes)) {
    console.log(control);
    queryString = queryString + ", " + control.current;
  }
  return queryString
}

const state = {
  canvas: null,
  imageElement: null,
  captionText: null,
  showAdvancedControls: false
};

canva.onReady(async (opts) => {
  const image = await imageHelpers.fromElement(opts.element, "preview");
  state.canvas = await imageHelpers.toCanvas(image);
  state.imageElement = await imageHelpers.toImageElement(image);
  document.body.appendChild(state.canvas);
  renderControls();
});

canva.onControlsEvent(async (opts) => {
  let mval = opts.message.message.value;
  if (opts.message.controlId === "startRemoteImageProcessingButton") {
      console.log("generate image button pressed");
      console.log(opts);
      canva.toggleSpinner("preview",true);
      console.log("calling canva.remoteProcess with opts:");
      opts = {
        settings: JSON.stringify({
            caption: state.captionText + " " + getControlQueryString(),
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
  }
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

const createControlsFromAttributes = (attributes) => {
  if (!state.showAdvancedControls) return [];
  const advControls = canva.create("group", {
    id: "AdvancedControls",
    label: "Advanced Controls",
    children: []
  })
  const controls = [advControls]
  Object.keys(attributes).map(attr => {
    if (attributes[attr].length > 1) {
      control = canva.create("slider", {
        id: attr,
        label: attr,
        value: 0,
        min: 0,
        max: attributes[attr].length - 1,
        step: 1
      });
    } else {
      control = canva.create("checkbox", {
        id: attr,
        label: attr,
        disabled: false,
        checked: false
      });
    }
    advControls.children.push(control);
  })
  return controls;
}

function renderControls() {
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
