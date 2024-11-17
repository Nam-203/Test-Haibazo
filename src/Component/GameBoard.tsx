import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../Redux/store";
import {
  setCircleCount,
  incrementTime,
  generateCircles,
  removeCircle,
  setNextNumber,
  setStatus,
  setVisibility,
  toggleAutoPlay,
  resetGame,
  setTime,
  updateCirclePositions,
} from "../Redux/slices/GameBoardSlice";
import { Circle } from "../lib/TypeGame";

const GameBoard = () => {
  const dispatch = useDispatch();
  const {
    circleCount,
    time,
    circles,
    nextNumber,
    status,
    isVisibility,
    autoPlay,
  } = useSelector((state: RootState) => state.gameBoard);

  const [clickedIds, setClickedIds] = useState<number[]>([]);
  const [countdownTimers, setCountdownTimers] = useState<{
    [key: number]: number;
  }>({});
  const [stoppedTime, setStoppedTime] = useState<number | null>(null);
  const [gameLevel, setGameLevel] = useState<"easy" | "hard">("easy");
  const [score, setScore] = useState<number>(0);

  useEffect(() => {
    if (time >= 0 && !status && isVisibility) {
      const timer = setInterval(() => {
        dispatch(incrementTime());
      }, 100);
      return () => clearInterval(timer);
    }
  }, [time, status, isVisibility, dispatch]);

  useEffect(() => {
    const timers: { [key: number]: ReturnType<typeof setTimeout> } = {};
    if (!status || status !== "GAME OVER") {
      Object.keys(countdownTimers).forEach((id) => {
        const numId = parseInt(id);
        if (countdownTimers[numId] > 0) {
          timers[numId] = setInterval(() => {
            setCountdownTimers((prev) => {
              const newValue = prev[numId] - 0.1;
              if (newValue <= 0) {
                dispatch(removeCircle(numId));
                clearInterval(timers[numId]);
                const newTimers = { ...prev };
                delete newTimers[numId];
                return newTimers;
              }
              return { ...prev, [numId]: newValue };
            });
          }, 100);
        }
      });
    }

    return () => {
      Object.values(timers).forEach(clearInterval);
    };
  }, [countdownTimers, dispatch, status]);

  useEffect(() => {
    if (circles.length === 0 && isVisibility) {
      dispatch(setStatus("ALL CLEARED"));
    }
  }, [circles, isVisibility, dispatch]);
  useEffect(() => {
    if (gameLevel === "hard" && isVisibility && !status) {
      const moveInterval = setInterval(() => {
        const remainingCircles = circles.filter(circle => !clickedIds.includes(circle.id));
        if (remainingCircles.length > 0) {
          const updatedCircles = circles.map(circle => {
            if (!clickedIds.includes(circle.id)) {
              return {
                ...circle,
                position: {
                  x: Math.random() * 80 + 10 + "%",
                  y: Math.random() * 80 + 10 + "%"
                }
              };
            }
            return circle;
          });
          dispatch(updateCirclePositions(updatedCircles));
        }
      }, 1500);

      return () => clearInterval(moveInterval);
    }
  }, [gameLevel, isVisibility, status, circles, clickedIds, dispatch]);

  useEffect(() => {
    if (autoPlay && !status) {
      const interval = setInterval(() => {
        const currentCircle = circles.find(
          (circle) => circle.number === nextNumber
        );
        const prevCircleId = nextNumber - 1;
        const prevCircleTimer = countdownTimers[prevCircleId];
        const isPrevCircleReady = prevCircleId === 0 || prevCircleTimer <= 1.5;

        if (currentCircle && isPrevCircleReady) {
          handleCircleClick(currentCircle);
        }
        if(gameLevel === "hard" && currentCircle){
          handleCircleClick(currentCircle);

        }
        if (nextNumber > circleCount) {
          clearInterval(interval);
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, [autoPlay, nextNumber, circles, circleCount, status, countdownTimers]);

  const startGame = () => {
    dispatch(setTime(0));
    dispatch(setNextNumber(1));
    dispatch(setStatus(null));
    dispatch(generateCircles());
    dispatch(setVisibility(true));
    if (autoPlay) {
      dispatch(toggleAutoPlay());
    }
    setCountdownTimers({});
    setClickedIds([]);
    setStoppedTime(null);
    setScore(0);
  };

  const handleCircleClick = (circle: Circle) => {
    if (status || time <= 0) return;

    if (circle.number === nextNumber) {
      setClickedIds((prev) => [...prev, circle.id]);
      dispatch(setNextNumber(nextNumber + 1));
      setCountdownTimers((prev) => ({
        ...prev,
        [circle.id]: 3,
      }));
      const pointsEarned = gameLevel === "hard" ? 20 : 10;
      setScore(prev => prev + pointsEarned);
    } else {
      dispatch(setStatus("GAME OVER"));
      setStoppedTime(time);
    }
  };

  const handleCircleCountChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const count = parseInt(event.target.value);
    if (event.target.value === "" || (!isNaN(count) && count > 0)) {
      dispatch(setCircleCount(event.target.value === "" ? 0 : count));
    }
  };

  const handleResetGame = () => {
    dispatch(resetGame());
    if (autoPlay) {
      dispatch(toggleAutoPlay());
    }
    setClickedIds([]);
    setCountdownTimers({});
    setStoppedTime(null);
    setScore(0);
  };

  const handleGameLevelChange = (level: "easy" | "hard") => {
    if (level === "hard") {
      if (window.confirm("Are you sure you want to choose Hard mode? It will not have autoplay support.")) {
        setGameLevel("hard");
      }
    } else {
      setGameLevel("easy");
    }
  };

  return (
    <div className="flex flex-col items-center p-8">
      <h2
        className={`text-3xl font-bold mb-6 ${
          status === "GAME OVER"
            ? "text-red-500"
            : status === "ALL CLEARED"
            ? "text-green-500"
            : ""
        }`}
      >
        {status || "LET'S PLAY"}
      </h2>
          <h4>  By default, there will be 5 circles. Please enter the number of circles you want. </h4>
      <div className="mb-4 flex items-center space-x-4">
        <label className="mr-2">
          Points:
          <input
            type="text"
            value={circleCount}
            onChange={handleCircleCountChange}
            min="1"
            className="border border-gray-300 rounded px-2 py-1 ml-2"
          />
        
        </label>

        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              checked={gameLevel === "easy"}
              onChange={() => handleGameLevelChange("easy")}
              disabled={isVisibility}
              className="mr-2"
            />
            Easy
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              checked={gameLevel === "hard"}
              onChange={() => handleGameLevelChange("hard")}
              disabled={isVisibility}
              className="mr-2"
            />
            Hard
          </label>
        </div>
      </div>

      <div className="mb-6 flex space-x-6">
        <span className="mr-2">Time: {(stoppedTime || time).toFixed(1)}s</span>
        <span className="font-bold">Score: {score}</span>
      </div>

      <div className="space-x-4 mb-6">
        {status === null && !isVisibility && (
          <button
            onClick={startGame}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Start Game
          </button>
        )}

        {status === null && isVisibility && (
          <>
            <button
              onClick={handleResetGame}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              Reset Game
            </button>
            {gameLevel === "easy" && (
              <button
                onClick={() => dispatch(toggleAutoPlay())}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              >
                {autoPlay ? "Autoplay OFF" : "Autoplay ON"}
              </button>
            )}
          </>
        )}

        {(status === "ALL CLEARED" || status === "GAME OVER") && (
          <button
            onClick={handleResetGame}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            Reset Game
          </button>
        )}
      </div>

      <div className="border-2 border-gray-300 rounded-lg w-[700px] h-[700px] relative">
        {circles.map((circle) => (
          <div
            key={circle.id}
            onClick={() => handleCircleClick(circle)}
            className={`absolute w-10 h-10 rounded-full border flex flex-col items-center justify-center text-black
            ${
              status === "GAME OVER"
                ? ""
                : "transition-all duration-500 ease-out"
            }
            ${
              clickedIds.includes(circle.id) ? "bg-red-500" : "bg-white"
            } cursor-pointer`}
            style={{
              top: circle.position.y,
              left: circle.position.x,
              opacity: countdownTimers[circle.id]
                ? countdownTimers[circle.id] / 3
                : 1,
            }}
          >
            {circle.number}
            <span className="text-[10px] text-black">
              {countdownTimers[circle.id]
                ? `${countdownTimers[circle.id].toFixed(1)}s`
                : ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameBoard;
