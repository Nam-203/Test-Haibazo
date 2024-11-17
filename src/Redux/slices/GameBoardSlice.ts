import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Circle, GameBoardState } from '../../lib/TypeGame';

const initialState: GameBoardState = {
  circleCount: 5,
  time: 0,
  circles: [],
  nextNumber: 1,
  status: null,
  isVisibility: false,
  autoPlay: false,
};

const gameBoardSlice = createSlice({
  name: 'gameBoard',
  initialState,
  reducers: {
    setCircleCount: (state, action: PayloadAction<number>) => {
      state.circleCount = action.payload;
    },
    incrementTime: (state) => {
      state.time += 0.1;
    },
    setTime: (state, action: PayloadAction<number>) => {
      state.time = action.payload;
    },
    generateCircles: (state) => {
      state.circles = Array.from({ length: state.circleCount }, (_, index) => ({
        id: index + 1,
        number: index + 1,
        position: {
          x: Math.random() * 80 + 10 + "%",
          y: Math.random() * 80 + 10 + "%",
        },
        active: true,
        color: "white",
        countdown: 3,
      }));
    },
 
    removeCircle: (state, action: PayloadAction<number>) => {
      state.circles = state.circles.filter(circle => circle.id !== action.payload);
    },
    setNextNumber: (state, action: PayloadAction<number>) => {
      state.nextNumber = action.payload;
    },
    setStatus: (state, action: PayloadAction<string | null>) => {
      state.status = action.payload;
    },
    setVisibility: (state, action: PayloadAction<boolean>) => {
      state.isVisibility = action.payload;
    },
    toggleAutoPlay: (state) => {
      if (state.status === null && state.isVisibility) {
        state.autoPlay = !state.autoPlay;
      }
    },
    resetGame: (state) => {
      state.time = 0;
      state.nextNumber = 1;
      state.status = null;
      state.autoPlay = false;
      state.circles = Array.from({ length: state.circleCount }, (_, index) => ({
        id: index + 1,
        number: index + 1,
        position: {
          x: Math.random() * 80 + 10 + "%",
          y: Math.random() * 80 + 10 + "%",
        },
        active: true,
      }));
    },
    updateCirclePositions: (state, action: PayloadAction<Circle[]>) => {
      state.circles = action.payload;
    },
  },
});

export const {
  setCircleCount,
  incrementTime,
  setTime,
  generateCircles,
  removeCircle,
  setNextNumber,
  setStatus,
  setVisibility,
  toggleAutoPlay,
  resetGame,
  updateCirclePositions,
} = gameBoardSlice.actions;

export default gameBoardSlice.reducer;
