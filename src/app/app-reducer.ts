import { authAPI } from "../api/todolists-api";
import { setIsLoggedInAC } from "../features/Login/auth-reducer";
import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';


export const initializeAppTC = createAsyncThunk<{ isInitialized: true  },void>('appReducer/initializeApp',async( undefined, thunkAPI)=>{

  const res = await authAPI.me()
    if (res.data.resultCode === 0) {
      thunkAPI.dispatch(setIsLoggedInAC({ value: true }));
    }
    else {
      thunkAPI.dispatch(setIsLoggedInAC({ value: false }));
    }
    // thunkAPI.dispatch(setAppInitializedAC({ value: true }));
    return{ isInitialized: true };

})

const initialState: InitialStateType = {
  status: "idle",
  error: null,
  isInitialized: false,
};

const slice = createSlice({
  name: "appReducer",
  initialState: initialState,
  reducers: {
    setAppErrorAC(state, action: PayloadAction<{ error: string | null }>) {
      state.error = action.payload.error;
    },
    setAppStatusAC(state, action: PayloadAction<{ status: RequestStatusType }>) {
      state.status = action.payload.status;
    },
    setAppInitializedAC(state, action: PayloadAction<{ value: boolean }>) {
      state.isInitialized = action.payload.value;
    },
  },
  extraReducers: (builder)=>{
    builder.addCase(initializeAppTC.fulfilled,(state, action)=>{
      state.isInitialized = action.payload.isInitialized;
    })
  }
});
export const appReducer = slice.reducer;


export type RequestStatusType = "idle" | "loading" | "succeeded" | "failed";
export type InitialStateType = {
  // происходит ли сейчас взаимодействие с сервером
  status: RequestStatusType;
  // если ошибка какая-то глобальная произойдёт - мы запишем текст ошибки сюда
  error: string | null;
  // true когда приложение проинициализировалось (проверили юзера, настройки получили и т.д.)
  isInitialized: boolean;
};

export const { setAppErrorAC, setAppStatusAC, setAppInitializedAC } = slice.actions;

// export const initializeAppTC_ = () => (dispatch: Dispatch) => {
//   authAPI.me().then((res) => {
//     if (res.data.resultCode === 0) {
//       dispatch(setIsLoggedInAC({ value: true }));
//     }
//     else {
//
//     }
//
//     dispatch(setAppInitializedAC({ value: true }));
//   });
// };
