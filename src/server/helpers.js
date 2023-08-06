function makeRandString(stringLength) {
  var randString = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < stringLength; i++)
    randString += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );

  return randString;
}

function robotName() {
  var names = [
    "HAL",
    "C-3PO",
    "R2D2",
    "T-800",
    "T-1000",
    "The Iron Giant",
    "WALL-E",
    "ABC",
    "BOT FRIEND",
    "Martin Jr.",
    "Computer",
    "RoboPlayer",
    "Bermuda",
    "Sharks!",
    "Homer Simpson",
    "A Squirrel",
    "Casino Guy",
  ];
  return names[Math.floor(Math.random() * names.length)];
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
  var teamWords = [
    "Apple",
    "Banana",
    "Carrot",
    "Donut",
    "Egg",
    "Fritter",
    "Grape",
    "Halva",
    "Ice",
    "Juice",
    "Kelp",
    "Mustard",
    "Noodle",
    "Orange",
    "Peanut",
    "Quince",
    "Radish",
    "Spaghetti",
    "Tomato",
    "Umbrella",
    "Vacation",
    "Weird",
    "X",
    "Yam",
    "Zucchini",
  ];

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

  makeRequest(requestURL + requestPath + "/", options, callback);
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
      console.log("ERROR " + error);
    });
}

const helpers = {
  makeRandString,
  robotName,
  shuffleArray,
  teamNameChoices,
  sendToBot,
  testBot,
};

export default helpers;
