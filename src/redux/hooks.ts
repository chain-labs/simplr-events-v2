import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import type { AppState } from './store'

export const useAppDispatch = () => useDispatch()
export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector
