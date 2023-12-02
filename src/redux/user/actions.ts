import { createAction } from '@reduxjs/toolkit'

export const setUser = createAction<string>('user/SET_USER')

export const removeUser = createAction('user/REMOVE_USER')
