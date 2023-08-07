import { games, players } from "../main.js";
import Game from "../classes/game.js";

export function createGame(gameId, update, player, input, gameInGames) {
  // console.log({ gameId, update, player, input, gameInGames });
  var game = new Game(gameId, update, gameInGames);
  games.push(game);
  if (input != "Bot Game") {
    game.addPlayer(player);
  } else {
    game.start();
  }
  game.update += 1;
  return game;
}

export function findGame(gameId) {
  var foundGame = false;
  for (var g in games) {
    if (gameId === games[g].gameId) {
      var game = games[g];
      foundGame = true;
      break;
    }
  }
  if (foundGame) {
    return game;
  } else {
    console.log("Error: Could not find game " + gameId);
    return null;
  }
}

export function findPlayer(playerId) {
  var foundPlayer = false;
  for (var p in players) {
    if (playerId === players[p].playerId) {
      var player = players[p];
      foundPlayer = true;
      break;
    }
  }
  if (foundPlayer) {
    return player;
  } else {
    //console.log("Error: Could not find player " + playerId);
    return null;
  }
}
