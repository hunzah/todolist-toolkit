import {setAppStatusAC} from '../../app/app-reducer';
import {authAPI, FieldsErrorsType, LoginParamsType} from '../../api/todolists-api';
import {handleServerAppError, handleServerNetworkError} from '../../utils/error-utils';
import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {AxiosError} from 'axios';


export const loginTC = createAsyncThunk<undefined, LoginParamsType, {
    rejectValue?: {
        errors: string[], field: FieldsErrorsType[]
    }
}>
('auth/login', async (data, thunkAPI) => {
    thunkAPI.dispatch(setAppStatusAC({status: 'loading'}));
    try {
        const res = await authAPI.login(data)
        if (res.data.resultCode === 0) {
            thunkAPI.dispatch(setAppStatusAC({status: 'succeeded'}));
            return
        } else {
            handleServerAppError(res.data, thunkAPI.dispatch);
            return thunkAPI.rejectWithValue({errors: res.data.messages, fieldsErrors: res.data.fieldsErrors})
        }
    } catch (err) {
        const error: AxiosError = err as AxiosError;
        handleServerNetworkError(error, thunkAPI.dispatch);
        return thunkAPI.rejectWithValue({errors: [error.message], fieldsErrors: undefined})
    }
})


export const logoutTC = createAsyncThunk('auth/logOut', async (undefined, thunkAPI) => {
    thunkAPI.dispatch(setAppStatusAC({status: 'loading'}));
    const res = await authAPI.logout()
    try {
        if (res.data.resultCode === 0) {
            // thunkAPI.dispatch(setIsLoggedInAC({value: false}));
            thunkAPI.dispatch(setAppStatusAC({status: 'succeeded'}));
            return
        } else {
            handleServerAppError(res.data, thunkAPI.dispatch);
            return thunkAPI.rejectWithValue({})
        }
    } catch (err) {
        const error = err as { message: string }
        handleServerNetworkError(error, thunkAPI.dispatch);
        return thunkAPI.rejectWithValue({})
    }
})


const initialState: any = {
    isLoggedIn: false,
};
const slice = createSlice({
    name: 'auth',
    initialState: initialState,
    reducers: {
        setIsLoggedInAC(state, action: PayloadAction<{ value: boolean }>) {
            state.isLoggedIn = action.payload.value;
        },
    },
    extraReducers: builder => {
        builder.addCase(loginTC.fulfilled, (state, action) => {
            state.isLoggedIn = true;
        })
        // builder.addCase(logoutTC.fulfilled, (state, action) => {
        //     state.isLoggedIn = false;
        // })
    }

});

export const authReducer = slice.reducer;
//actions

export const {setIsLoggedInAC} = slice.actions;
// thunks


// export const logoutTC_ = () => (dispatch: Dispatch) => {
//     dispatch(setAppStatusAC({status: 'loading'}));
//     authAPI
//         .logout()
//         .then((res) => {
//             if (res.data.resultCode === 0) {
//
//                 dispatch(setIsLoggedInAC({value: false}));
//                 dispatch(setAppStatusAC({status: 'loading'}));
//             } else {
//                 handleServerAppError(res.data, dispatch);
//             }
//         })
//         .catch((error) => {
//             handleServerNetworkError(error, dispatch);
//         });
// };
