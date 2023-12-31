//  Description: Online TicTacToe
//  Created: 07.05.2022
//  Author: Jonas Naumann (https://github.com/JonasNau)

import { io } from "socket.io-client";

import * as Utils from "./includes/utils.js";
import * as ObjectFunctions from "./includes/objectFunctions.js";
import Swal from "sweetalert2";

//Socket server is on the same origin but on a different port >> set socket port
const socket = io(":3000", {
  timeout: 20000,
});

const ticTacToeContainer = document.querySelector("#ticTacToe");
const gameContainer = ticTacToeContainer.querySelector(".game");
const board = ticTacToeContainer.querySelector("#board");
const menu = ticTacToeContainer.querySelector("#menu");
const gameIDDisplay = ticTacToeContainer.querySelector("#gameIDDisplay");
const createSection = menu.querySelector(".createSection");
const privateGameBtn = createSection.querySelector("#privateGame");
const createNewGameButton = createSection.querySelector("#createNewGame");
const gameIDInput = createSection.querySelector("#gameID");
const availableGames = ticTacToeContainer.querySelector("#availableGames");
const joinGameList = availableGames.querySelector("#joinGameList ul");
const limitRoomResults = ticTacToeContainer.querySelector(
  "#limitGameRoomResults"
);
const refreshAvailableGames =
  ticTacToeContainer.querySelector("#refreshAvailable");
const joingameIDInput = availableGames.querySelector("#joinGame .textInput");
const joinGameBtn = availableGames.querySelector("#joinGame .btn");

const isPublicGameInput = createSection.querySelector("#isPublicGame");
const leaveGameButton = ticTacToeContainer.querySelector("#leaveGame");
const limitGameRoomResults = createSection.querySelector(
  "#limitGameRoomResults"
);

const infoTextContainer = ticTacToeContainer.querySelector("#info .text");

class TicTacToe {
  constructor() {
    this.presets = {
      playerX: "x",
      playerCircle: "circle",
    };
    this.gameIsActive = false;
    this.currentPlayer;
    this.player;
    this.gameField = {
      0: null,
      1: null,
      2: null,
      3: null,
      4: null,
      5: null,
      6: null,
      7: null,
      8: null,
    };
    this.replay = [];
    this.winningContitions = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    this.gameID;
  }

  onlineGameInit() {
    socket.on("startGame", (gameID) => {
      if (this.gameID != gameID) return false;
      this.gameIsActive = true;
    });

    socket.on(
      "gameState",
      async (gameState, currentPlayer, winner = false, draw = false) => {
        if (!this.gameIsActive) return;
        this.gameField = gameState;
        this.currentPlayer = currentPlayer;
        this.drawGameField();

        if (winner) {
          await Utils.showMessage(
            `${this.currentPlayer} won the game!`,
            "Game end!",
            false
          );

          // this.clearGame();
          return false;
        }
        if (draw) {
          await Utils.showMessage(`Draw`, "Game end!", false);
          // this.clearGame();
          return false;
        }

        if (this.currentPlayer != this.player) {
          board.classList.add("forbidden");
        } else {
          board.classList.remove("forbidden");
        }

        infoTextContainer.innerText = `Player ${this.currentPlayer} is!`;

        this.drawGameField();
      }
    );

    socket.on("gameStop", (reason) => {
      //Reset the game and show game menu
      this.clearGame();
      return false;
    });

    gameIDDisplay.innerText = this.gameID;

    gameContainer.classList.remove("hidden");
    board.classList = "";
    infoTextContainer.innerText = "Let's begin!";

    menu.classList.add("hidden");
    board.classList.remove("hidden");

    leaveGameButton.addEventListener("click", () => {
      socket.emit("leaveGame", this.gameID);
      this.clearGame();
    });
  }

  setInfoText(text) {
    console.log(text);
    infoTextContainer.innerText = text;
  }

  clearGame() {
    this.gameIsActive = false;
    this.gameField = {
      0: null,
      1: null,
      2: null,
      3: null,
      4: null,
      5: null,
      6: null,
      7: null,
      8: null,
    }; //reset the game Field
    board.classList = "";
    board.innerHTML = "";
    infoTextContainer.innerText = "";
    menu.classList.remove("hidden");
    gameContainer.classList.add("hidden");
    console.log(board);
    board.classList.remove("forbidden", "x", "circle");
  }

  privateGameInit(startPlayer) {
    //Reset board
    board.classList = "";
    gameContainer.classList.remove("hidden");
    this.gameField = {
      0: null,
      1: null,
      2: null,
      3: null,
      4: null,
      5: null,
      6: null,
      7: null,
      8: null,
    }; //reset the game Field

    //Set info info text
    infoTextContainer.innerText = "Let's begin!";

    //Set start Player
    this.currentPlayer = startPlayer ?? this.presets.playerX;

    menu.classList.add("hidden");
    board.classList.remove("hidden");

    leaveGameButton.addEventListener("click", () => {
      this.clearGame();
    });

    this.gameLoopPrivate();
    return true;
  }

  gameLoopPrivate() {
    this.nextPlayerPrivate(false);
  }

  nextPlayerPrivate(changePlayer = true) {
    if (changePlayer) {
      if (this.currentPlayer == this.presets.playerX) {
        this.currentPlayer = this.presets.playerCircle;
      } else {
        this.currentPlayer = this.presets.playerX;
      }
    }

    board.classList.remove(this.presets.playerX, this.presets.playerCircle);
    board.classList.add(this.currentPlayer);

    infoTextContainer.innerText = `Player ${this.currentPlayer} is!`;
    this.drawGameField();
  }

  cellIsClaimed(cellNumber) {
    return this.gameField[cellNumber] != null;
  }

  async nextMovePrivate(cellNumber) {
    //Check claimed
    if (this.cellIsClaimed()) {
      Utils.showMessage("This cell is already claimed", "Cant set", false);
    }
    this.gameField[cellNumber] = this.currentPlayer;
    console.log({ gameField: this.gameField });
    this.drawGameFieldPrivate(false);

    if (this.checkWinner()) {
      if (
        await Utils.showMessage(
          `${this.currentPlayer} won the game! Restart?`,
          "Game end!",
          true
        )
      ) {
        this.clearGame();
        this.privateGameInit();
        return;
      }
      this.clearGame();
      return false;
    }

    if (this.checkDraw()) {
      if (await Utils.showMessage("Draw. Restart?", "Game end!", true)) {
        this.clearGame();
        this.privateGameInit();
        return;
      }
      this.clearGame();
      return false;
    }

    this.nextPlayerPrivate();
  }

  drawGameFieldPrivate(withEventlistener = true) {
    board.innerHTML = "";
    for (const [cellNumber, ownedBy] of Object.entries(this.gameField)) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.setAttribute("data-gamefield-id", cellNumber);
      board.appendChild(cell);
      if (ownedBy) {
        cell.classList.add(ownedBy);
        //Dont add eventlistener
        continue;
      }
      if (withEventlistener)
        cell.addEventListener("click", () => {
          this.nextMovePrivate(cellNumber, this.currentPlayer);
        });
    }

    console.log("Game field has been drawn!");
    return true;
  }

  drawGameField(withEventlistener = true) {
    board.innerHTML = "";
    for (const [cellNumber, ownedBy] of Object.entries(this.gameField)) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.setAttribute("data-gamefield-id", cellNumber);
      board.appendChild(cell);
      if (ownedBy) {
        cell.classList.add(ownedBy);
        //Dont add eventlistener
        continue;
      }
      if (withEventlistener && this.currentPlayer == this.player)
        if (!ownedBy) {
          cell.addEventListener("click", () => {
            socket.emit("onMove", this.gameID, this.player, cellNumber);
          });
        }
    }

    console.log("Game field has been drawn!");
    return true;
  }

  checkDraw() {
    return Object.values(this.gameField).every((currentCell) => {
      return currentCell != null;
    });
  }

  checkWinner() {
    const everyClaimedCellOfPlayer = Object.keys(this.gameField).filter(
      (currentCell) => {
        if (this.gameField[currentCell] == this.currentPlayer) {
          return true;
        }
        return false;
      }
    );
    return this.winningContitions.some((winningCondition) => {
      return winningCondition.every((currentNumber) => {
        return everyClaimedCellOfPlayer.includes(String(currentNumber));
      });
    });
  }
}

let ticTacToe = new TicTacToe();

function showOpenGameRooms(gameRooms) {
  joinGameList.innerHTML = "";
  if (!gameRooms.length) {
    joinGameList.innerHTML = "No results....";
    return;
  }
  gameRooms.forEach((gameRoom) => {
    let item = document.createElement("li");
    item.innerHTML = `<a>${gameRoom}</a>`;
    joinGameList.appendChild(item);

    item.addEventListener("click", () => {
      joinGame(gameRoom);
    });
  });
}

refreshAvailableGames.addEventListener("click", () => {
  socket.emit("getOpenGameRooms", Number(limitRoomResults.value));
});

socket.on("openGameRooms", (gameRooms) => {
  console.log(gameRooms);
  showOpenGameRooms(gameRooms);
});

function joinGame(gameID) {
  socket.emit("joinGame", gameID);
}

socket.on("connect", () => {
  console.log("Your socket id is " + socket.id);
});

socket.on("message", (message) => {
  //Show message
  Utils.showMessage(message);
});

socket.on("errorMessage", (message) => {
  //Show message
  Utils.errorMessage(message);
});

privateGameBtn.addEventListener("click", () => {
  //Start a private game
  ticTacToe.privateGameInit();
});

createNewGameButton.addEventListener("click", () => {
  //Create new online game
  socket.emit("createNewGame", gameIDInput.value, isPublicGameInput.checked);
});

joinGameBtn.addEventListener("click", () => {
  socket.emit("joinGame", joingameIDInput.value);
});

socket.on("joinedGame", (gameID, player) => {
  ticTacToe.gameID = gameID;
  ticTacToe.player = player;
  ticTacToe.onlineGameInit();
  console.log(ticTacToe);
  board.classList.add(player);
});

socket.on("infoText", (text) => ticTacToe.setInfoText(text));

//Emit on start
socket.emit("getOpenGameRooms", Number(limitRoomResults.value));
