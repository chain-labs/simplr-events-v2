import { configureStore, Action, ThunkAction } from '@reduxjs/toolkit'
import { createWrapper } from 'next-redux-wrapper'

import { walletReducer } from './wallet'

const makeStore = () =>
  configureStore({
    reducer: {
     
      wallet: walletReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }),
    devTools: true,
  })

export type AppStore = ReturnType<typeof makeStore>

export type AppState = ReturnType<AppStore['getState']>

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AppState,
  unknown,
  Action<string>
>

export const wrapper = createWrapper<AppStore>(makeStore)
