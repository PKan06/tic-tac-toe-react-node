import Block from "./components/Block";
import "./App.css";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import copy from "copy-to-clipboard";
let socket;
function App() {
  const [room, setRoom] = useState("");
  const [editRoom, setEditRoom] = useState(false);
  const [MultiplayerBox, setMultiplayerBox] = useState(false);
  // this will store the progress
  const [state, setState] = useState(Array(9).fill(null));
  // console.log(state);
  // this will allow us to monitor the next turn
  const [currentTurn, setCurrentTurn] = useState("X");
  const [players, setplayers] = useState({ X: "Player1", O: "Player2" });
  const [wins, setWins] = useState({ Done: 0, X: 0, O: 0 });
  // // console.log(MultiplayerBox.checked)
  const checkMultiplyer = () => {
    if (MultiplayerBox) {
      setEditRoom(false);
    }
    setMultiplayerBox(document.getElementById("myCheck").checked);
    setState(Array(9).fill(null));
  };

  const joinRoom = () => {
    if (room !== "") {
      socket = io.connect(process.env.SERVERURL || process.env.REACT_APP_SERVERURL);
      socket.emit("join_room", room);
      setEditRoom(true);
    }
  };
  const sendMessage = (state: any[]) => {
    if (editRoom === true) {
      socket.emit("user-move", {
        message: state,
        wins,
        players,
        currentTurn: currentTurn === "X" ? "O" : "X",
        room,
      });
    }
  };

  const checkWinner = (state: any[]) => {
    const win = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [6, 4, 2],
    ];

    for (let i = 0; i < win.length; i++) {
      const [a, b, c] = win[i];
      if (
        state[a] != null &&
        state[b] != null &&
        state[c] != null &&
        state[a] === state[b] &&
        state[a] === state[c]
      ) {
        wins["Done"] = 1;
        // console.log("win");
        document.getElementById(`block${a}`).style.transform =
          "rotateY(360deg)";
        document.getElementById(`block${b}`).style.transform =
          "rotateY(360deg)";
        document.getElementById(`block${c}`).style.transform =
          "rotateY(360deg)";
        return state[a];
      }
    }
    // console.log("array -> ", state);
    return "";
  };
  const handelBlockClick = (index) => {
    // // console.log(index);
    if (state[index] === null && wins["Done"] === 0) {
      // new array
      let stateCopy = Array.from(state);
      stateCopy[index] = currentTurn;

      if (editRoom) sendMessage(stateCopy);
      const winner = checkWinner(stateCopy);
      if (winner === "X" || winner === "O") {
        wins[winner]++;
        // // console.log(wins);
        setWins(wins);
        setState(stateCopy);
        if (editRoom) sendMessage(stateCopy);
      }
      setState(stateCopy);
      setCurrentTurn(currentTurn === "X" ? "O" : "X");
    }
  };

  const handelOnSubmitReset = () => {
    wins["Done"] = 0;
    for (let index = 0; index < 9; index++) {
      document.getElementById(`block${index}`).style.transition =
        "transform 0s";
    }
    for (let index = 0; index < 9; index++) {
      document.getElementById(`block${index}`).style.transform =
        "rotateY(0deg)";
    }
    for (let index = 0; index < 9; index++) {
      document.getElementById(`block${index}`).style.transition =
        "transform 2s ease-in-out";
    }
    setState(Array(9).fill(null));
    // console.log("reset->", state);
    if (editRoom === true) sendMessage(Array(9).fill(null));
  };

  const copyToClipboard = () => {
    copy(process.env.REACT_APP_SHAREURL);
    alert(`You have copied "${process.env.SHAREURL || process.env.REACT_APP_SHAREURL}" share with other player`);
  };

  useEffect(() => {
    if (editRoom === true) {
      socket.on("receive_move", (data) => {
        // console.log("recived data ->", data);
        setState(data.message);
        setWins(data.wins);
        setplayers(data.players);
        setCurrentTurn(data.currentTurn);
      });
    }
    // eslint-disable-next-line
  }, [socket]);
  return (
    <div className="container">
      <div className="title">
        <h1>Tic Tac Toe</h1>
      </div>

      <label htmlFor="myCheck">Multiplayer:</label>
      <input type="checkbox" id="myCheck" onClick={checkMultiplyer} />

      {MultiplayerBox && !editRoom ? (
        <div className="multiplayer">
          <input
            type="text"
            placeholder="Room Number .. "
            onChange={(event) => {
              setRoom(event.target.value);
            }}
          />
          <button onClick={joinRoom}>Join Room</button>
        </div>
      ) : (
        <>
          <div className="boardcontainer">
            {editRoom ? (
              <p>
                Connect multiplayer on link: 
                <span
                  onClick={copyToClipboard}
                > Click here </span>
                using room number {`${room}`}
              </p>
            ) : (
              <></>
            )}
            <div className="players">
              {wins["Done"] ? (
                <>
                  <p>Congratulations🥳</p>
                  <p>
                    <span>
                      {`${players[currentTurn === "X" ? "O" : "X"]} : ${
                        currentTurn === "X" ? "O" : "X"
                      } wins `}
                    </span>
                    the game
                  </p>
                  <p>Reset the game to Continue</p>
                </>
              ) : (
                <>
                  <p className="player">
                    {`${players["X"]} : X  ${
                      currentTurn === "X" ? " Turn" : ""
                    }`}
                  </p>
                  <p className="player">
                    {`${players["O"]} : O  ${
                      currentTurn === "O" ? " Turn" : ""
                    }`}
                  </p>
                </>
              )}
            </div>
            <div className="board">
              <div className="row">
                <Block
                  id={0}
                  onClick={() => handelBlockClick(0)}
                  value={state[0]}
                />
                <Block
                  id={1}
                  onClick={() => handelBlockClick(1)}
                  value={state[1]}
                />
                <Block
                  id={2}
                  onClick={() => handelBlockClick(2)}
                  value={state[2]}
                />
              </div>
              <div className="row">
                <Block
                  id={3}
                  onClick={() => handelBlockClick(3)}
                  value={state[3]}
                />
                <Block
                  id={4}
                  onClick={() => handelBlockClick(4)}
                  value={state[4]}
                />
                <Block
                  id={5}
                  onClick={() => handelBlockClick(5)}
                  value={state[5]}
                />
              </div>
              <div className="row">
                <Block
                  id={6}
                  onClick={() => handelBlockClick(6)}
                  value={state[6]}
                />
                <Block
                  id={7}
                  onClick={() => handelBlockClick(7)}
                  value={state[7]}
                />
                <Block
                  id={8}
                  onClick={() => handelBlockClick(8)}
                  value={state[8]}
                />
              </div>
            </div>
            <div className="reset">
              <p className="msg"></p>
              <button
                className="btn"
                type="reset"
                onClick={() => handelOnSubmitReset()}
              >
                reset
              </button>
            </div>
            <div className="historyContiner">
              <h3>Wining History: </h3>
              <p>
                {`${players["X"]} : ${wins["X"]}    v/s    ${players["O"]} : ${wins["O"]}`}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
