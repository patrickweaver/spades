import { teamWords, robotNames, stringCharacters } from "./constants.js";

const GAME_ID_LENGTH = 4;

function makeGameId() {
  var randString = "";
  for (var i = 0; i < GAME_ID_LENGTH; i++)
    randString += stringCharacters.charAt(
      Math.floor(Math.random() * stringCharacters.length)
    );

  return randString;
}

function robotName() {
  return robotNames[Math.floor(Math.random() * robotNames.length)];
}

function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

function teamNameChoices() {
  return shuffleArray(teamWords).slice(0, 5);
}

const requestURL = process.env.BOT_URL;

function testBot() {
  console.log("*%*%*");
  console.log({ requestURL });
  var options = {
    method: "GET",
  };

  makeRequest(requestURL + "/test", options);
}

function sendToBot(requestPath, postData, callback) {
  var options = {
    method: "POST",
    body: JSON.stringify(postData),
    headers: {
      "Content-Type": "application/json",
    },
  };

  makeRequest(requestURL + requestPath, options, callback);
}

function makeRequest(url, options, callback = () => undefined) {
  fetch(url + "/", options)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      console.log({ data });
      callback(data);
    })
    .catch((error) => {
      console.log("🤖 BOT error at", url, { options });
      console.log("ERROR " + error);
    });
}

const helpers = {
  makeGameId,
  robotName,
  shuffleArray,
  teamNameChoices,
  sendToBot,
  testBot,
};

export default helpers;
