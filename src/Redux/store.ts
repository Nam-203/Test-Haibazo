import { configureStore } from '@reduxjs/toolkit'
import GameBoardReducer from './slices/GameBoardSlice'

export const store = configureStore({
  reducer: {
    gameBoard: GameBoardReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch 