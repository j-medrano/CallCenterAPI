var socket = io.connect("http://localhost:3000/", {
  transports: ["websocket"],
});

window.onload = () => {
  let dashpopup = document.getElementById("dash-popup");
  dashpopup.style.transform = "translateX(200px)";
};

let dashpopup = document.getElementById("dash-popup");
let dashcontainer = document.getElementById("hover-dash-container");
let popup = document.getElementById("popup-container");
let popup_container = document.getElementById("hover-over-container");
let themetoggle = document.getElementById("dark-mode");

dashcontainer.addEventListener("mouseenter", () => {
  dashpopup.style.transform = "translateX(200px)";
});
dashcontainer.addEventListener("mouseleave", () => {
  dashpopup.style.transform = "translateX(-200px)";
});

popup_container.addEventListener("mouseenter", () => {
  popup.style.transform = "translateY(200px)";
});
popup_container.addEventListener("mouseleave", () => {
  popup.style.transform = "translateY(-200px)";
});

themetoggle.addEventListener("click", () => {
  if (themetoggle.checked) {
    gridColor = "#121212";
    darkTheme(statusDictionary);
    updateChartBorders(gridColor);
  } else {
    gridColor = "white";
    lightTheme(statusDictionary);
    updateChartBorders(gridColor);
  }
});

function themeChange() {
  var theme = themeSelector.options[themeSelector.selectedIndex].value;
  colorScheme = colorSchemeArray[theme];
  statusDictionary = {
    Available: colorScheme[0],
    On_Call: colorScheme[1],
    After_Call: colorScheme[2],
    Preview_Task: colorScheme[3],
    Offline: colorScheme[4],
  };
  if (themetoggle.checked) {
    gridColor = "#121212";
    darkTheme(statusDictionary);
    updateChartBorders(gridColor);
    rankAgents();
    updateAllColors();
    updateLinesGraph();
  } else {
    gridColor = "white";
    lightTheme(statusDictionary);
    updateChartBorders(gridColor);
    rankAgents();
    updateAllColors();
    updateLinesGraph();
  }
}

function overlayPopupDisplay(text) {
  let overlay_popup = document.getElementById("overlay_popup");
  overlay_popup.style.display = "block";
  overlay_popup.innerHTML = text;
  setTimeout(function () {
    overlay_popup.style.display = "none";
  }, 2000);
}

let agentsOnline = document.getElementById("numOfAgentsOnline");
let agentCount = 0;

let realTimeAgentArray = [];
let currentAgentIDsConnected = [];
let horiz_flag = true;

var linesInterval = 0;

function startUpdatingLines() {
  // Set an interval to update the chart every 2 seconds
  linesInterval = setInterval(function () {
    // Update the chart
    updateLines();
  }, 1000);
}

function stopUpdatingLines() {
  // Clear the interval to stop updating the chart
  clearInterval(linesInterval);
  linesInterval = null;
}

socket.on("request", (d) => {
  let agent = JSON.parse(d);
  addCircle(agent);
});

async function addCircle(a) {
  let status_path = getPathToData(a, GLOBAL_STATUS);
  //checks if new status so can add status and new color
  if (!statusList.includes(status_path)) {
    //add new status to status list
    //should create a new color corresponding to it
    await parseNewStatus(status_path);
    await addNewStatusToCharts(status_path);
    await addNewLabelForLines(status_path);
  }

  if (x_amount >= max_x_amount) {
    x_amount = previous_x_position;
    y_amount++;
  }
  if (y_amount >= previous_y_position && previous_previous_x_position != 0) {
    x_amount = previous_previous_x_position;
    previous_x_position = previous_previous_x_position;
    previous_y_position = max_y_amount;
  } else if (y_amount >= previous_y_position) {
    x_amount = 0;
    previous_x_position = 0;
    previous_y_position = max_y_amount;
  }

  if (y_amount >= max_y_amount) {
    adjustCanvas();
  }
  let r = radius;
  let x = r + gaps * x_amount;
  let y = r + gaps * y_amount;
  //paths for id, status, time
  let agent = new Circle(
    getPathToData(a, GLOBAL_ID),
    getPathToData(a, GLOBAL_STATUS),
    getPathToData(a, GLOBAL_TIME),
    x,
    y,
    r
  );
  if (idarray.includes(agent.id)) {
    updateStatus(agent);
  } else {
    circleArray.push(agent);
    idarray.push(agent.id);
    agent.draw();
    x_amount++;
    agentCount++;
    agentsPerStatus[agent.status]++;
  }
  updateStatusCount();
  updateCharts();
  agentsOnline.innerHTML = agentCount;
}

function getPathToData(obj, pth) {
  pth = pth.split(".");
  currObjPath = obj;
  for (let part of pth) {
    currObjPath = currObjPath[part];
  }
  console.log(currObjPath);
  return currObjPath;
}

function updateStatusCount() {
  Object.keys(agentsPerStatus).forEach((key) => {
    document.getElementById(key + "_Count").innerHTML = agentsPerStatus[key];
    document.getElementById(key + "_Count_Card").innerHTML =
      agentsPerStatus[key];
  });
}

function resizeCanvas() {
  //reqrite this function to not need adjust canvas;
  //create new grid that fills up existing screen with no need to adjust it
  //just create a full page with the existing circles;
  c.clearRect(0, 0, window.innerWidth, window.innerHeight);
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  gaps =
    Math.floor(
      10 *
        Math.sqrt((window.innerWidth * window.innerHeight) / circleArray.length)
    ) / 10;
  radius = gaps / 2;
  // radius = 50;
  // gaps = 100;
  x_amount = 0;
  y_amount = 0;
  previous_x_position = 0;
  previous_y_position = parseInt(window.innerHeight / gaps);
  max_x_amount = parseInt(window.innerWidth / gaps);
  max_y_amount = parseInt(window.innerHeight / gaps);
  for (let i = 0; i < circleArray.length; i++) {
    if (x_amount >= max_x_amount) {
      x_amount = previous_x_position;
      y_amount++;
    }
    if (y_amount >= previous_y_position) {
      // x_amount = 0;
      // previous_x_position = 0;
      // previous_y_position = max_y_amount;
      //adjustCanvas();
    }
    // if (y_amount >= max_y_amount) {
    //   adjustCanvas();
    // }
    let r = radius;
    let x = r + gaps * x_amount;
    let y = r + gaps * y_amount;
    let a = circleArray[i];
    a.updatePosition(x, y, r);
    x_amount++;
  }
  previous_x_position = x_amount;
  previous_previous_x_position = x_amount;
  previous_y_position = y_amount;
}

function adjustCanvas() {
  if (y_amount >= max_y_amount && x_amount != 0) {
    previous_previous_x_position = 0;
  }
  c.clearRect(0, 0, width, height);
  let multiplier = max_x_amount / (max_x_amount + 1);
  x_amount = 0;
  y_amount = 0;
  radius *= multiplier;
  gaps = radius * 2;
  for (let i = 0; i < circleArray.length; i++) {
    let a = circleArray[i];
    a.updatePosition(a.x * multiplier, a.y * multiplier, radius);
    x_amount++;
    if (x_amount >= max_x_amount) {
      x_amount = 0;
      y_amount++;
    }
  }
  previous_x_position = max_x_amount;
  previous_y_position = max_y_amount;
  x_amount = previous_x_position;
  y_amount = 0;
  //grid is now adjusted
  //setting new max_x and max_y for new agents being added
  max_x_amount = parseInt(window.innerWidth / gaps);
  max_y_amount = parseInt(window.innerHeight / gaps);
}

//updating status

function updateStatus(a) {
  for (let i = 0; i < circleArray.length; i++) {
    let agent_to_update = circleArray[i];
    if (agent_to_update.id == a.id) {
      agentsPerStatus[a.status]++;
      agentsPerStatus[agent_to_update.status]--;
      agent_to_update.updateStatus(a.status, a.time);
    }
  }
}

function updateAllColors() {
  for (let i = 0; i < circleArray.length; i++) {
    let curr_agent = circleArray[i];
    curr_agent.updateStatus(curr_agent.status, curr_agent.time);
  }
}

function drawPopup(x, y, c) {
  let top_offset = false;
  let left_offset = false;
  agent_info_container.style.transform = "translate(0%,0%)";
  if (x > width / 2) {
    left_offset = true;
  }
  if (y > height / 2) {
    top_offset = true;
  }
  for (var i = 0; i < circleArray.length; i++) {
    let popupInfo = circleArray[i];
    if (
      Math.abs(x - popupInfo.x) <= popupInfo.r &&
      Math.abs(y - popupInfo.y) <= popupInfo.r
    ) {
      agent_info_container.style.top = parseInt(y);
      agent_info_container.style.left = parseInt(x);
      if (top_offset && left_offset) {
        agent_info_container.style.transform = "translate(-100%,-100%)";
      } else if (top_offset) {
        agent_info_container.style.transform = "translateY(-100%)";
      } else if (left_offset) {
        agent_info_container.style.transform = "translateX(-100%)";
      }
      agent_info_container.style.zIndex = 10;
      agent_info_container.classList.add("agent_info_container");
      aic_p1.innerHTML = popupInfo.id;
      aic_p2.innerHTML = popupInfo.status;
      document.querySelector("body").appendChild(agent_info_container);
    }
  }
}

let dash = document.getElementById("dashboard-button");
let analytics = document.getElementById("analytics-button");
let rank = document.getElementById("rank-button");
let connect = document.getElementById("connect-button");
let dashcontent = document.getElementById("grid-container");
let chartcontent = document.getElementById("chart-container");
let rankcontent = document.getElementById("rank-container");
let connectcontent = document.getElementById("connect-container");

analytics.addEventListener("click", () => {
  dash.classList.remove("active-tab");
  dash.classList.add("inactive-tab");
  analytics.classList.add("active-tab");
  analytics.classList.remove("inactive-tab");
  rank.classList.remove("active-tab");
  rank.classList.add("inactive-tab");
  connect.classList.add("inactive-tab");
  connect.classList.remove("active-tab");
  dashcontent.style.display = "none";
  chartcontent.style.display = "flex";
  connectcontent.style.display = "none";
  rankcontent.style.display = "none";
  agent_info_container.style.display = "none";
  let popup = document.getElementById("popup-container");
  popup.style.transform = "translateY(-200px)";
});

dash.addEventListener("click", () => {
  analytics.classList.remove("active-tab");
  analytics.classList.add("inactive-tab");
  dash.classList.add("active-tab");
  dash.classList.remove("inactive-tab");
  rank.classList.remove("active-tab");
  rank.classList.add("inactive-tab");
  connect.classList.add("inactive-tab");
  connect.classList.remove("active-tab");
  dashcontent.style.display = "block";
  chartcontent.style.display = "none";
  rankcontent.style.display = "none";
  connectcontent.style.display = "none";
  agent_info_container.style.display = "none";
  let popup = document.getElementById("popup-container");
  popup.style.transform = "translateY(-200px)";
});

rank.addEventListener("click", () => {
  rank.classList.add("active-tab");
  rank.classList.remove("inactive-tab");
  analytics.classList.remove("active-tab");
  analytics.classList.add("inactive-tab");
  dash.classList.remove("active-tab");
  dash.classList.add("inactive-tab");
  connect.classList.add("inactive-tab");
  connect.classList.remove("active-tab");
  dashcontent.style.display = "none";
  chartcontent.style.display = "none";
  connectcontent.style.display = "none";
  rankcontent.style.display = "flex";
  agent_info_container.style.display = "none";
  let popup = document.getElementById("popup-container");
  popup.style.transform = "translateY(200px)";
  rankAgents();
});

connect.addEventListener("click", () => {
  connect.classList.add("active-tab");
  connect.classList.remove("inactive-tab");
  analytics.classList.remove("active-tab");
  analytics.classList.add("inactive-tab");
  dash.classList.remove("active-tab");
  dash.classList.add("inactive-tab");
  rank.classList.add("inactive-tab");
  rank.classList.remove("active-tab");
  rankcontent.style.display = "none";
  dashcontent.style.display = "none";
  chartcontent.style.display = "none";
  connectcontent.style.display = "block";
  agent_info_container.style.display = "none";
  let popup = document.getElementById("popup-container");
  popup.style.transform = "translateY(-200px)";
  checkDataVals();
});

connect.click();
// themetoggle.click();

let api_token_div = document.getElementById("api_token_string");
let api_token = localStorage.getItem("jwt");
api_token_div.innerHTML = api_token;

let connectContainer = document.getElementById("connect-container");
let connectBtn = document.getElementById("connect-tab");
let defineContainer = document.getElementById("define-container");
let defineBtn = document.getElementById("define-tab");

connectBtn.addEventListener("click", () => {
  connectContainer.style.display = "block";
  connectBtn.classList.add("activebtn");
  defineBtn.classList.remove("activebtn");
  defineContainer.style.display = "none";
});
defineBtn.addEventListener("click", () => {
  connectContainer.style.display = "none";
  connectBtn.classList.remove("activebtn");
  defineBtn.classList.add("activebtn");
  defineContainer.style.display = "block";
});

let add_new_data_row = document.getElementById("add-data-field");
let added_identification_fields = 0;

add_new_data_row.addEventListener("click", () => {
  added_identification_fields++;
  dataDefsContainer = document.getElementById("data-defs-container");
  let newDiv = document.createElement("div");
  newDiv.classList.add("div-row");
  newDiv.style.marginBottom = "20px";
  let select = document.createElement("select");
  select.setAttribute(
    "id",
    "new_selected_option_" + added_identification_fields
  );
  let option1 = document.createElement("option");
  option1.innerHTML = "Name";
  let option2 = document.createElement("option");
  option2.innerHTML = "Location";
  let option3 = document.createElement("option");
  option3.innerHTML = "Other";
  select.appendChild(option1);
  select.appendChild(option2);
  select.appendChild(option3);
  let input = document.createElement("input");
  input.setAttribute("id", "new_input_val_" + added_identification_fields);
  newDiv.appendChild(select);
  newDiv.appendChild(input);
  dataDefsContainer.appendChild(newDiv);
});

let submit_data_fields_btn = document.getElementById("submit-data-defs");

submit_data_fields_btn.addEventListener("click", async () => {
  let id_input = document
    .getElementById("id_field_input")
    .value.replace(" ", "_")
    .trim();
  let status_input = document
    .getElementById("status_field_input")
    .value.replace(" ", "_")
    .trim();
  let time_input = document
    .getElementById("time_field_input")
    .value.replace(" ", "_")
    .trim();

  let validData = await verifyInputData(id_input, status_input, time_input);
  if (!validData) return;
  //submit the values into global vars here
  localStorage.setItem("id", id_input);
  localStorage.setItem("status", status_input);
  localStorage.setItem("time", time_input);

  //added fields if any
  if (added_identification_fields > 0) {
    for (let i = 1; i <= added_identification_fields; i++) {
      let select_id = "new_selected_option_" + i;
      let input_id = "new_input_val_" + i;
      let new_selection = document.getElementById(select_id);
      var new_value = new_selection.options[new_selection.selectedIndex].text;
      let new_input = document
        .getElementById(input_id)
        .value.replace(" ", "_")
        .trim();
      localStorage.setItem(new_value, new_input);
    }
  }
  checkDataVals();
  overlayPopupDisplay("The Data has been verified!");
});

function verifyInputData(id, state, time) {
  if (id == "" || state == "" || time == "") return false;
  return true;
}

function verifyAPIData(verified) {
  if (verified) {
    let status_btn = document.getElementById("status_header");
    status_btn.innerHTML = "<b>Status</b>  Active";
    status_btn.style.backgroundColor = "#A3F7B5";
  } else {
    let status_btn = document.getElementById("status_header");
    status_btn.innerHTML = "<b>Status</b>  Data Fields Not Defined";
    status_btn.style.backgroundColor = "#cacaca";
  }
}

function checkDataVals() {
  if (
    localStorage.getItem("id") === null ||
    localStorage.getItem("status") === null ||
    localStorage.getItem("time") === null
  ) {
    verifyAPIData(false);
  } else {
    verifyAPIData(true);
  }
  if (localStorage.getItem("id") != null) {
    GLOBAL_ID = localStorage.getItem("id");
    document.getElementById("id_field_input").value =
      localStorage.getItem("id");
  }
  if (localStorage.getItem("status") != null) {
    GLOBAL_STATUS = localStorage.getItem("status");
    document.getElementById("status_field_input").value =
      localStorage.getItem("status");
  }
  if (localStorage.getItem("time") != null) {
    GLOBAL_TIME = localStorage.getItem("time");
    document.getElementById("time_field_input").value =
      localStorage.getItem("time");
  }
  // if (localStorage.getItem("Name") != null) {
  //   document.getElementById("new_input_val_0").value =
  //     localStorage.getItem("Name");
  // }
  // if (localStorage.getItem("Location") != null) {
  //   document.getElementById("new_input_val_1").value =
  //     localStorage.getItem("Location");
  // }
  // if (localStorage.getItem("Other") != null) {
  //   document.getElementById("new_input_val_2").value =
  //     localStorage.getItem("Other");
  // }
}

let testData = document.getElementById("test-data-button");
testData.addEventListener("click", async () => {
  let token = localStorage.getItem("jwt");
  let statusList = [
    "Offline",
    "Available",
    "On_Call",
    "After_Call",
    "Preview_Task",
  ];
  function createJSONData() {
    let generate_id = Math.floor(Math.random() * max_data);
    var myObj = {
      id: generate_id,
      status: statusList[Math.floor(Math.random() * statusList.length)],
      time: new Date(),
    };
    return myObj;
  }
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  let max_data = 100;
  let errorCount = 0;
  let amountSent = 0;
  var start = Date.now();
  startUpdatingLines();
  while (amountSent < max_data) {
    try {
      let agent = createJSONData();
      var res = await fetch("/api/data", {
        method: "POST",
        body: JSON.stringify(agent),
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
      });
      if (res.status !== 200) {
        console.log("status error");
      }
    } catch (err) {
      console.log("error: " + err);
    }
    amountSent++;
  }
  var end = Date.now();
  console.log("Sent: " + amountSent);
  console.log("Errors: " + errorCount);
  console.log(
    "Time spent for " + amountSent + " requests: " + minsec(end - start)
  );
  stopUpdatingLines();
});

function minsec(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}
