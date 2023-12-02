import { createSelector } from '@reduxjs/toolkit'
import { AppState } from '../store'

export const selectUser = (state: AppState) => state.user

export const userSelector = createSelector(selectUser, (state) => state)
