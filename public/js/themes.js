function lightTheme(statusDictionary) {
  document.querySelector(":root").style.setProperty("--bg-color", "#FFFFFF");
  document
    .querySelector(":root")
    .style.setProperty("--bg-color-opaque", "rgb(255, 255, 255,0.9)");
  document
    .querySelector(":root")
    .style.setProperty("--button-color", "transparent");
  document
    .querySelector(":root")
    .style.setProperty("--button-active-color", "#d9d9d9");
  document
    .querySelector(":root")
    .style.setProperty("--button-hover-bg", "#202124");
  document
    .querySelector(":root")
    .style.setProperty("--button-hover-text-color", "white");
  document.querySelector(":root").style.setProperty("--text-color", "black");
  //key colors
  for (let i = 0; i < statusList.length; i++) {
    let statusToChange = statusList[i];
    document
      .querySelector(":root")
      .style.setProperty(
        `--key-${statusToChange}-text`,
        statusDictionary[statusToChange]
      );
  }
  //box shadow
  document
    .querySelector(":root")
    .style.setProperty(
      "--background-shadow",
      "rgba(149, 157, 165, 0.2) 0px 8px 20px"
    );
}

function darkTheme(statusDictionary) {
  document.querySelector(":root").style.setProperty("--bg-color", "#121212");
  document
    .querySelector(":root")
    .style.setProperty("--bg-color-opaque", "rgb(18, 18, 18,0.9)");
  document
    .querySelector(":root")
    .style.setProperty("--button-color", "#202124");
  document.querySelector(":root").style.setProperty("--text-color", "#FFFFFF");
  document
    .querySelector(":root")
    .style.setProperty("--button-active-color", "#424242");
  document
    .querySelector(":root")
    .style.setProperty("--button-hover-bg", "#424242");
  document
    .querySelector(":root")
    .style.setProperty("--button-hover-text-color", "#FFFFFF");
  //key colors
  for (let i = 0; i < statusList.length; i++) {
    let statusToChange = statusList[i];
    document
      .querySelector(":root")
      .style.setProperty(
        `--key-${statusToChange}-text`,
        statusDictionary[statusToChange]
      );
  }
  //box shadow
  document
    .querySelector(":root")
    .style.setProperty("--background-shadow", "rgba(16,16,16,1) 0px 1px 3px");
}
