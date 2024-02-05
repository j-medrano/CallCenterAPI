//chart code
let agentPie = document.getElementById("pie-chart");
let agentDonut = document.getElementById("donut-chart");
let agentBars = document.getElementById("bar-chart");
let agentPolar = document.getElementById("polar-chart");
let agentLines = document.getElementById("lines-chart");
let gridColor = "white";
agentPie.height = window.innerHeight / 3.5;
agentDonut.height = window.innerHeight / 3.5;
agentBars.height = window.innerHeight / 3;
agentPolar.height = window.innerHeight / 3.5;
agentLines.height = window.innerHeight / 1.6;

var data = {
  labels: [],
  datasets: [
    {
      label: "Agents Per Status",
      data: [],
      backgroundColor: [],
      borderColor: [],
      hoverOffset: 3,
    },
  ],
};

var config = (type) => {
  let labelDisplay = false;
  let indexOption = "x";
  if (type == "bar") {
    labelDisplay = false;
    // indexOption = "y";
  }
  return {
    type: type,
    data: data,
    options: {
      indexAxis: indexOption,
      plugins: {
        legend: {
          display: labelDisplay,
        },
      },
      responsive: false,
      maintainAspectRatio: true,
      showScale: false,
    },
  };
};

const labels = [];
const datalines = {
  labels: labels,
  datasets: [],
};

var configLines = {
  type: "line",
  data: datalines,
  options: {
    responsive: false,
    plugins: {
      legend: {
        position: "left",
      },
      title: {
        display: true,
        text: "Agents Per Status",
      },
    },
  },
};

//for colors
function updateChartBorders(gc) {
  let chartArray = [PieChart, DonutChart, BarsChart, PolarAreaChart];
  chartArray.forEach((c) => {
    c.data.datasets[0].borderColor = Array(statusList.length).fill(gc);
    c.data.datasets[0].backgroundColor = generateColorsForCharts();
    c.update();
  });
}

function updateLinesGraph() {
  for (let index = 0; index < LineGraph.data.datasets.length; index++) {
    LineGraph.data.datasets[index].borderColor = colorScheme[index];
    LineGraph.data.datasets[index].backgroundColor = colorScheme[index];
  }
  LineGraph.update();
}

//time functions
function removeLineData() {
  LineGraph.data.labels.splice(0, 1);
  LineGraph.data.datasets.forEach((dataset) => {
    dataset.data.shift();
  });
  LineGraph.update();
}

function createNewTimeLabel(time) {
  time = time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds();
  return time;
}

//whenever new agent gets added
//can rewrite to only update new status...
function updateCharts() {
  let chartArray = [PieChart, DonutChart, BarsChart, PolarAreaChart];
  chartArray.forEach((c) => {
    for (let i = 0; i < statusList.length; i++) {
      c.data.datasets[0].data[i] = agentsPerStatus[statusList[i]];
    }
    c.update();
  });
}
function updateLines() {
  LineGraph.data.labels.push(createNewTimeLabel(new Date()));
  for (let index = 0; index < LineGraph.data.datasets.length; index++) {
    let label = LineGraph.data.datasets[index].label;
    LineGraph.data.datasets[index].data.push(agentsPerStatus[label]);
  }
  LineGraph.update();
  // if (LineGraph.data.labels.length > 40) {
  //   removeLineData();
  // }
}

//create all datalabels, but we dont have them yet...
// function createDataForLines() {
//   let lineDataArray = [];
//   for (let i = 0; i < statusList.length; i++) {
//     let datasetObj = {
//       label: statusList[i],
//       data: [],
//       borderColor: statusDictionary[statusList[i]],
//       backgroundColor: statusDictionary[statusList[i]],
//       pointBackgroundColor: "transparent",
//       pointBorderColor: "transparent",
//       tension: 0.1,
//       pointBorderWidth: 0,
//       pointHitRadius: 0,
//     };
//     lineDataArray.push(datasetObj);
//   }
//   return lineDataArray;
// }

// function generateLabelsForCharts() {
//   var labelArray = [];
//   for (let i = 0; i < statusList.length; i++) {
//     labelArray.push(statusList[i]);
//   }
//   return labelArray;
// }
function generateColorsForCharts() {
  var chartColors = [];
  for (let i = 0; i < statusList.length; i++) {
    chartColors.push(statusDictionary[statusList[i]]);
  }
  return chartColors;
}

//add new data set functions
function addNewStatusToCharts(new_status) {
  let chartArray = [PieChart, DonutChart, BarsChart, PolarAreaChart];
  PieChart.data.labels.push(new_status);
  chartArray.forEach((c) => {
    c.data.datasets[0].data.push(agentsPerStatus[new_status]);
    c.data.datasets[0].backgroundColor.push(statusDictionary[new_status]);
    c.data.datasets[0].borderColor.push(gridColor);
    c.update();
  });
  updateChartBorders(gridColor);
}

//new dataset for lines
function addNewLabelForLines(new_status) {
  let datasetObj = {
    label: new_status,
    data: [],
    borderColor: statusDictionary[new_status],
    backgroundColor: statusDictionary[new_status],
    pointBackgroundColor: "transparent",
    pointBorderColor: "transparent",
    tension: 0.1,
    pointBorderWidth: 0,
    pointHitRadius: 0,
  };
  LineGraph.data.datasets.push(datasetObj);
  LineGraph.update();
  updateLinesGraph();
}

let switchChart = document.getElementById("switch-chart");
let chart_index = 0;
switchChart.addEventListener("click", () => {
  switch (chart_index) {
    case 0:
      document.getElementById("pie-chart").style.display = "none";
      document.getElementById("donut-chart").style.display = "block";
      chart_index++;
      break;
    case 1:
      document.getElementById("donut-chart").style.display = "none";
      document.getElementById("polar-chart").style.display = "block";
      chart_index++;
      break;
    case 2:
      document.getElementById("polar-chart").style.display = "none";
      document.getElementById("pie-chart").style.display = "block";
      chart_index = 0;
      break;
    default:
      break;
  }
});

var PieChart = new Chart(agentPie, config("pie"));
var DonutChart = new Chart(agentDonut, config("doughnut"));
var BarsChart = new Chart(agentBars, config("bar"));
var PolarAreaChart = new Chart(agentPolar, config("polarArea"));
var LineGraph = new Chart(agentLines, configLines);

//rank function
let rankBtn = document.getElementById("rank-btn");
rankBtn.addEventListener("click", () => {
  rankAgents();
});

function rankAgents() {
  let rankContainer = document.getElementById("rank-results");
  rankContainer.innerHTML = "";
  for (let i = 0; i < statusList.length; i++) {
    let rankContents = document.createElement("div");
    rankContents.classList.add("rank-div");
    rankContents.setAttribute("id", statusList[i] + "_rank");
    rankContents.innerHTML = "<p>" + statusList[i] + "</p>";
    rankContainer.appendChild(rankContents);
  }

  let current_time = new Date();
  let timeCompared = circleArray.map((a) => current_time - new Date(a.time));
  let rankedArray = [];
  for (let i = 0; i < circleArray.length; i++) {
    rankedArray.push({
      id: circleArray[i].id,
      status: circleArray[i].status,
      elapsed: timeCompared[i],
    });
  }

  rankedArray.sort((a, b) => {
    return b.elapsed - a.elapsed;
  });
  //filter based on statuses, return top 5?
  // let available_filtered = rankedArray.filter((a) => {
  //   if (a.status == "Available") {
  //     return a;
  //   }
  // });
  // let oncall_filtered = rankedArray.filter((a) => {
  //   if (a.status == "On_Call") {
  //     return a;
  //   }
  // });
  // let aftercall_filtered = rankedArray.filter((a) => {
  //   if (a.status == "After_Call") {
  //     return a;
  //   }
  // });
  // let previewtask_filtered = rankedArray.filter((a) => {
  //   if (a.status == "Preview_Task") {
  //     return a;
  //   }
  // });
  // let offline_filtered = rankedArray.filter((a) => {
  //   if (a.status == "Offline") {
  //     return a;
  //   }
  // });

  for (let s = 0; s < statusList.length; s++) {
    //filter on status
    let current_status_filtered = rankedArray.filter((a) => {
      if (a.status == statusList[s]) {
        return a;
      }
    });

    //do the compare
    let current_rank_div = document.getElementById(statusList[s] + "_rank");
    let current_max = current_status_filtered[0].elapsed;
    let current_min = current_status_filtered[4].elapsed;
    let curr_count =
      current_status_filtered.length > 4 ? 5 : current_status_filtered.length;
    for (let i = 0; i < curr_count; i++) {
      let agent_div = createAgentRank(
        current_status_filtered[i],
        current_max,
        current_min
      );
      current_rank_div.appendChild(agent_div);
    }
  }

  // //available
  // if (available_filtered.length > 4) {
  //   let av_div = document.getElementById("av_r");
  //   let available_max = available_filtered[0].elapsed;
  //   let available_min = available_filtered[4].elapsed;
  //   let count = available_filtered.length > 4 ? 5 : available_filtered.length;
  //   for (let i = 0; i < count; i++) {
  //     let agent_div = createAgentRank(
  //       available_filtered[i],
  //       available_max,
  //       available_min
  //     );
  //     av_div.appendChild(agent_div);
  //   }
  // }
  // //oncall
  // if (oncall_filtered.length > 4) {
  //   let on_div = document.getElementById("on_r");
  //   let oncall_max = oncall_filtered[0].elapsed;
  //   let oncall_min = oncall_filtered[4].elapsed;
  //   let count = oncall_filtered.length > 4 ? 5 : oncall_filtered.length;
  //   for (let i = 0; i < count; i++) {
  //     let agent_div = createAgentRank(
  //       oncall_filtered[i],
  //       oncall_max,
  //       oncall_min
  //     );
  //     on_div.appendChild(agent_div);
  //   }
  // }
  // //aftercall
  // if (aftercall_filtered.length > 4) {
  //   let af_div = document.getElementById("af_r");
  //   let aftercall_max = aftercall_filtered[0].elapsed;
  //   let aftercall_min = aftercall_filtered[4].elapsed;
  //   let count = aftercall_filtered.length > 4 ? 5 : aftercall_filtered.length;
  //   for (let i = 0; i < count; i++) {
  //     let agent_div = createAgentRank(
  //       aftercall_filtered[i],
  //       aftercall_max,
  //       aftercall_min
  //     );
  //     af_div.appendChild(agent_div);
  //   }
  // }
  // //preview
  // if (previewtask_filtered.length > 4) {
  //   let pr_div = document.getElementById("pr_r");
  //   let previewtask_max = previewtask_filtered[0].elapsed;
  //   let previewtask_min = previewtask_filtered[4].elapsed;
  //   let count =
  //     previewtask_filtered.length > 4 ? 5 : previewtask_filtered.length;
  //   for (let i = 0; i < count; i++) {
  //     let agent_div = createAgentRank(
  //       previewtask_filtered[i],
  //       previewtask_max,
  //       previewtask_min
  //     );
  //     pr_div.appendChild(agent_div);
  //   }
  // }
  // //offline
  // if (offline_filtered.length > 4) {
  //   let of_div = document.getElementById("of_r");
  //   let offline_max = offline_filtered[0].elapsed;
  //   let offline_min = offline_filtered[4].elapsed;
  //   let count = offline_filtered.length > 4 ? 5 : offline_filtered.length;
  //   for (let i = 0; i < count; i++) {
  //     let agent_div = createAgentRank(
  //       offline_filtered[i],
  //       offline_max,
  //       offline_min
  //     );
  //     of_div.appendChild(agent_div);
  //   }
  // }
}

function createAgentRank(a, max, min) {
  let range = max - min;
  let calculated_width = ((a.elapsed - min) / range) * 100;
  let agent = a;
  //divs
  let agent_div = document.createElement("div");
  let agent_info = document.createElement("div");
  let agent_bar = document.createElement("div");
  let agent_fill = document.createElement("div");
  //p tags w info
  let agent_id = document.createElement("p");
  agent_id.innerHTML = "ID: " + agent.id;
  let agent_elapsed = document.createElement("p");
  agent_elapsed.style.color = "grey";
  agent_elapsed.innerHTML = millisToMinutesAndSeconds(agent.elapsed);
  // agent_info.classList.add("agent-info");
  agent_bar.classList.add("agent-bar");
  agent_fill.style.backgroundColor = statusDictionary[agent.status];
  agent_fill.style.width = calculated_width + 10 + "%";
  agent_fill.style.height = "10px";
  agent_fill.style.borderRadius = "10px";
  agent_bar.appendChild(agent_fill);
  agent_info.appendChild(agent_id);
  agent_info.appendChild(agent_elapsed);
  //agent_div.appendChild(agent_info);
  agent_div.classList.add("agent-div");
  agent_div.appendChild(agent_id);
  agent_div.appendChild(agent_elapsed);
  agent_div.appendChild(agent_bar);
  agent_div.style.margin = "20px";
  return agent_div;
}

function millisToMinutesAndSeconds(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}

function msToTime(duration) {
  var minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  hours = hours < 10 ? "0" + hours : hours;
  minutes = minutes < 10 ? "0" + minutes : minutes;

  if (hours > 0) {
    if (hours == 1) {
      return hours + " hour, " + minutes + " minutes";
    } else {
      return hours + " hours, " + minutes + " minutes";
    }
  }
  return minutes + " minutes";
}
