//initial setup of canvas, blank white fullscreen
var canvas = document.querySelector("canvas");
var width = window.innerWidth;
var height = window.innerHeight;
var screen_ratio = width / height;
let themeSelector = document.getElementById("theme-select");
let upperStatusCountContainer = document.getElementById("popup");
let statusCardContainer = document.getElementById("status_cards");
canvas.width = width;
canvas.height = height;
var c = canvas.getContext("2d");
let agent_info_container = document.createElement("div");
agent_info_container.style.position = "absolute";
agent_info_container.style.display = "none";
let aic_p1 = document.createElement("p");
let aic_p2 = document.createElement("p");
agent_info_container.appendChild(aic_p1);
agent_info_container.appendChild(aic_p2);
//mouse stuff
var mouse = {
  x: undefined,
  y: undefined,
};

canvas.addEventListener("click", () => {
  if (agent_info_container.style.display == "none") {
    agent_info_container.style.display = "flex";
  } else {
    agent_info_container.style.display = "none";
  }
});

window.addEventListener("mousemove", (event) => {
  mouse.x = event.x;
  mouse.y = event.y;
  drawPopup(mouse.x, mouse.y, c);
});

window.addEventListener("resize", () => {
  resizeCanvas();
});

//global API Data
var GLOBAL_ID = "";
var GLOBAL_STATUS = "";
var GLOBAL_TIME = "";
var GLOBAL_NAME = "";
var GLOBAL_LOCATION = "";
var GLOBAL_OTHER = "";

if (localStorage.getItem("id") != null) {
  GLOBAL_ID = localStorage.getItem("id");
}
if (localStorage.getItem("status") != null) {
  GLOBAL_STATUS = localStorage.getItem("status");
}
if (localStorage.getItem("time") != null) {
  GLOBAL_TIME = localStorage.getItem("time");
}
if (localStorage.getItem("Name") != null) {
  GLOBAL_NAME = localStorage.getItem("Name");
}
if (localStorage.getItem("Location") != null) {
  GLOBAL_LOCATION = localStorage.getItem("Location");
}
if (localStorage.getItem("Other") != null) {
  GLOBAL_OTHER = localStorage.getItem("Other");
}

//data
let circleArray = [];
let agentDictionary = {};
let idarray = [];

let radius = 50;
var gaps = radius * 2;
var x_axis_range = parseInt(window.innerWidth / gaps);
var y_axis_range = parseInt(window.innerHeight / gaps);
var curr_x_axis = 0;
var curr_y_axis = 0;

let x_amount = 0;
let y_amount = 0;
let previous_x_position = 0;
let previous_previous_x_position = 0;
let previous_y_position = parseInt(window.innerHeight / gaps);
let max_x_amount = parseInt(window.innerWidth / gaps);
let max_y_amount = parseInt(window.innerHeight / gaps);

let colorSchemeDefault = [
  "hsl(150, 50%, 60%)",
  "hsl(0, 100%, 50%)",
  "hsl(200, 50%, 90%)",
  "hsl(210, 100%, 50%)",
  "hsl(210, 20%, 10%)",
];
let colorSchemeBlue = [
  "hsl(180, 100%, 75%)",
  "hsl(220, 50%, 40%)",
  "hsl(180, 40%, 75%)",
  "hsl(190, 60%, 70%)",
  "hsl(220, 100%, 25%)",
];
let colorSchemeGreen = [
  "hsl(180, 10%, 25%)",
  "hsl(150, 20%, 30%)",
  "hsl(160, 30%, 40%)",
  "hsl(160, 40%, 50%)",
  "hsl(160, 100%, 75%)",
];
let colorSchemeOrange = [
  "hsl(10, 100%, 50%)",
  "hsl(30, 90%, 50%)",
  "hsl(40, 70%, 60%)",
  "hsl(40, 75%, 70%)",
  "hsl(40, 80%, 80%)",
];
let colorSchemeDry = [
  "hsl(270, 40%, 60%)",
  "hsl(330, 50%, 60%)",
  "hsl(20, 50%, 70%)",
  "hsl(40, 70%, 75%)",
  "hsl(50, 100%, 75%)",
];
let colorSchemeGrey = [
  "hsl(0, 0%, 18%)",
  "hsl(0, 0%, 32%)",
  "hsl(0, 0%, 50%)",
  "hsl(0, 0%, 63%)",
  "hsl(0, 0%, 80%)",
];
let colorSchemePastel = [
  "hsl(300, 50%, 75%)",
  "hsl(290, 50%, 75%)",
  "hsl(280, 60%, 85%)",
  "hsl(260, 70%, 90%)",
  "hsl(240, 100%, 95%)",
];
let colorSchemePurple = [
  "hsl(270, 100%, 50%)",
  "hsl(260, 50%, 25%)",
  "hsl(260, 10%, 20%)",
  "hsl(300, 10%, 90%)",
  "hsl(290, 10%, 80%)",
];
let colorSchemeSky = [
  "hsl(210, 100%, 50%)",
  "hsl(220, 80%, 75%)",
  "hsl(220, 70%, 85%)",
  "hsl(220, 60%, 90%)",
  "hsl(220, 40%, 95%)",
];

var colorSchemeArray = [
  colorSchemeDefault,
  colorSchemeBlue,
  colorSchemeGreen,
  colorSchemeOrange,
  colorSchemeDry,
  colorSchemeGrey,
  colorSchemePastel,
  colorSchemePurple,
  colorSchemeSky,
];

var colorScheme = colorSchemeArray[0];

var agentsPerStatus = {
  // Available: 0,
  // On_Call: 0,
  // After_Call: 0,
  // Preview_Task: 0,
  // Offline: 0,
};

var statusDictionary = {
  // Available: colorScheme[0],
  // On_Call: colorScheme[1],
  // After_Call: colorScheme[2],
  // Preview_Task: colorScheme[3],
  // Offline: colorScheme[4],
};

var statusList = [
  // "Available",
  // "On_Call",
  // "After_Call",
  // "Preview_Task",
  // "Offline",
];

async function parseNewStatus(new_status) {
  statusList.push(new_status);
  //add to agents per status
  agentsPerStatus[new_status] = 0;
  //create color for each scheme
  await generateNewColor();
  //add to status dict with corresponding status length
  statusDictionary[new_status] = colorScheme[statusList.length - 1];

  let id_num = "s" + (statusList.length - 1);
  //create new root vars
  document
    .querySelector(":root")
    .style.setProperty(
      `--key-${new_status}-text`,
      statusDictionary[new_status]
    );
  let new_status_style = document.createElement(`style`);
  new_status_style.innerHTML = `
  #${id_num}{
    background-color: var(--key-all-bg);
    color: var(--key-${new_status}-text);
  }
  #${new_status}_Count_Card{
    color: var(--key-${new_status}-text);
  }
  `;
  document.head.appendChild(new_status_style);

  //create new status labels on dash
  let newStatusPopupLabel = document.createElement("div");
  newStatusPopupLabel.setAttribute("id", id_num);
  newStatusPopupLabel.innerHTML =
    new_status + `:&nbsp;&nbsp;<a id='${new_status}_Count'>0</a>`;
  upperStatusCountContainer.appendChild(newStatusPopupLabel);

  //create new status card on analysis
  let newStatusCard = document.createElement("div");
  newStatusCard.classList.add("status-card");
  newStatusCard.innerHTML = `<p id='${new_status}_Count_Card'>0</p>
  <span>${new_status}</span>`;
  statusCardContainer.appendChild(newStatusCard);
}

function generateNewColor() {
  let newColor = generateColorScheme(150, 50, 60, 1)[0];
  colorSchemeDefault = colorSchemeDefault.concat(newColor);
  newColor = generateColorScheme(220, 50, 75, 1)[0];
  colorSchemeBlue = colorSchemeBlue.concat(newColor);
  // generate a new color based on the green color scheme
  newColor = generateColorScheme(160, 30, 50, 1)[0];

  // add the new color to the green color scheme
  colorSchemeGreen = colorSchemeGreen.concat(newColor);
  // generate a new color based on the orange color scheme
  newColor = generateColorScheme(40, 75, 70, 1)[0];

  // add the new color to the orange color scheme
  colorSchemeOrange = colorSchemeOrange.concat(newColor);
  newColor = generateColorScheme(40, 70, 75, 1)[0];

  // add the new color to the dry color scheme
  colorSchemeDry = colorSchemeDry.concat(newColor);
  newColor = generateColorScheme(0, 0, 50, 1)[0];

  // add the new color to the grey color scheme
  colorSchemeGrey = colorSchemeGrey.concat(newColor);
  newColor = generateColorScheme(280, 60, 85, 1)[0];

  // add the new color to the pastel color scheme
  colorSchemePastel = colorSchemePastel.concat(newColor);

  newColor = generateColorScheme(270, 50, 75, 1)[0];
  colorSchemePurple = colorSchemePurple.concat(newColor);

  newColor = generateColorScheme(270, 50, 75, 1)[0];
  colorSchemeSky = colorSchemeSky.concat(newColor);
  colorSchemeArray = [
    colorSchemeDefault,
    colorSchemeBlue,
    colorSchemeGreen,
    colorSchemeOrange,
    colorSchemeDry,
    colorSchemeGrey,
    colorSchemePastel,
    colorSchemePurple,
    colorSchemeSky,
  ];
  colorScheme = colorSchemeArray[0];
}

function generateColorScheme(baseHue, saturation, lightness, numColors) {
  // generate an array of hues by shifting the base hue by a random amount
  // within a certain range
  const hueRange = 20; // +/- 10 degrees from the base hue
  const hues = Array.from(
    { length: numColors },
    (_, i) => (baseHue + (Math.random() - 0.5) * hueRange + 360) % 360
  );
  // generate the corresponding HSL colors and return them as an array
  return hues.map((hue) => `hsl(${hue}, ${saturation}%, ${lightness}%)`);
}
