import {authAPI} from '../api/todolists-api';
import {setIsLoggedInAC} from '../features/Login/auth-reducer';
import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';


export const initializeAppTC = createAsyncThunk('appReducer/initializeApp', async (param, thunkAPI) => {

    const res = await authAPI.me()
    if (res.data.resultCode === 0) {
        thunkAPI.dispatch(setIsLoggedInAC({value: true}));
    }
})

const initialState: InitialStateType = {
    status: 'idle',
    error: null,
    isInitialized: false,
};

const slice = createSlice({
    name: 'appReducer',
    initialState: initialState,
    reducers: {
        setAppErrorAC(state, action: PayloadAction<{ error: string | null }>) {
            state.error = action.payload.error;
        },
        setAppStatusAC(state, action: PayloadAction<{ status: RequestStatusType }>) {
            state.status = action.payload.status;
        },
    },
    extraReducers: builder => {
        builder.addCase(initializeAppTC.fulfilled, (state, action) => {
            state.isInitialized = true;
        })
    }
});
export const appReducer = slice.reducer;

export const {setAppErrorAC, setAppStatusAC} = slice.actions;

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


//types
export type RequestStatusType = 'idle' | 'loading' | 'succeeded' | 'failed';
export type InitialStateType = {
    status: RequestStatusType;
    error: string | null;
    isInitialized: boolean;
};
