import {todolistsAPI, TodolistType} from '../../api/todolists-api';
import {Dispatch} from 'redux';
import {RequestStatusType, setAppStatusAC} from '../../app/app-reducer';
import {handleServerNetworkError} from '../../utils/error-utils';
import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';

const initialState: Array<TodolistDomainType> = [];


export const fetchTodolistsTC = createAsyncThunk('todolists/fetchTodolists', async (undefined: undefined, thunkAPI) => {
    thunkAPI.dispatch(setAppStatusAC({status: 'loading'}));

    try {
        const res = await todolistsAPI.getTodolists()
        // thunkAPI.dispatch(setTodolistsAC({todolists: res.data}));
        thunkAPI.dispatch(setAppStatusAC({status: 'succeeded'}));
        return {todolists: res.data};

    } catch (err) {
        const error = err as { message: string }
        handleServerNetworkError(error, thunkAPI.dispatch);
        return thunkAPI.rejectWithValue({})
    }
})

export const removeTodolistTC = createAsyncThunk('todolists/removeTodolist', async (todolistId: string, thunkAPI) => {
    thunkAPI.dispatch(setAppStatusAC({status: 'loading'}));
    thunkAPI.dispatch(changeTodolistEntityStatusAC({id: todolistId, status: 'loading'}));

    await todolistsAPI.deleteTodolist(todolistId)
    // thunkAPI.dispatch(removeTodolistAC({id: todolistId}));
    thunkAPI.dispatch(setAppStatusAC({status: 'succeeded'}));
    return {id: todolistId}

})

export const addTodolistTC = createAsyncThunk('todolists/addTodolist', async (title: string, thunkAPI) => {
    thunkAPI.dispatch(setAppStatusAC({status: 'loading'}));
    const res = await todolistsAPI.createTodolist(title)
    // thunkAPI.dispatch(addTodolistAC({todolist: res.data.data.item}));
    thunkAPI.dispatch(setAppStatusAC({status: 'succeeded'}));
    return {todolist: res.data.data.item}
})


const slice = createSlice({
    name: 'todolists',
    initialState: initialState,
    reducers: {
        removeTodolistAC(state, action: PayloadAction<{ id: string }>) {
            const index = state.findIndex((tl) => tl.id === action.payload.id);
            if (index > -1) {
                state.splice(index, 1);
            }
        },
        addTodolistAC(state, action: PayloadAction<{ todolist: TodolistType }>) {
            state.unshift({...action.payload.todolist, filter: 'all', entityStatus: 'idle'});
        },
        changeTodolistTitleAC(state, action: PayloadAction<{ id: string; title: string }>) {
            const index = state.findIndex((tl) => tl.id === action.payload.id);
            state[index].title = action.payload.title;
        },
        changeTodolistFilterAC(state, action: PayloadAction<{ id: string; filter: FilterValuesType }>) {
            const index = state.findIndex((tl) => tl.id === action.payload.id);
            state[index].filter = action.payload.filter;
        },
        changeTodolistEntityStatusAC(state, action: PayloadAction<{ id: string; status: RequestStatusType }>) {
            const index = state.findIndex((tl) => tl.id === action.payload.id);
            state[index].entityStatus = action.payload.status;
        },
        setTodolistsAC(state, action: PayloadAction<{ todolists: Array<TodolistType> }>) {
            return action.payload.todolists.map((tl) => ({...tl, filter: 'all', entityStatus: 'idle'}));
        },
    },
    extraReducers: builder => {
        builder.addCase(fetchTodolistsTC.fulfilled, (state, action) => {

            state = action.payload.todolists.map((tl) => ({...tl, filter: 'all', entityStatus: 'idle'}));
        })
        builder.addCase(removeTodolistTC.fulfilled, (state, action) => {
            const index = state.findIndex((tl) => tl.id === action.payload.id);
            if (index > -1) {
                state.splice(index, 1);
            }
        })
        builder.addCase(addTodolistTC.fulfilled, (state, action) => {
            state.unshift({...action.payload.todolist, filter: 'all', entityStatus: 'idle'});

        })
    }

});
export const todolistsReducer = slice.reducer;

export const {
    removeTodolistAC,
    addTodolistAC,
    changeTodolistTitleAC,
    changeTodolistFilterAC,
    changeTodolistEntityStatusAC,
    setTodolistsAC
} = slice.actions;


// thunks
// export const fetchTodolistsTC = () => {
//     return (dispatch: ThunkDispatch) => {
//         dispatch(setAppStatusAC({status: 'loading'}));
//         todolistsAPI
//             .getTodolists()
//             .then((res) => {
//                 dispatch(setTodolistsAC({todolists: res.data}));
//                 dispatch(setAppStatusAC({status: 'succeeded'}));
//             })
//             .catch((error) => {
//                 handleServerNetworkError(error, dispatch);
//             });
//     };
// };
// export const removeTodolistTC = (todolistId: string) => {
//     return (dispatch: ThunkDispatch) => {
//         //изменим глобальный статус приложения, чтобы вверху полоса побежала
//         dispatch(setAppStatusAC({status: 'loading'}));
//         //изменим статус конкретного тудулиста, чтобы он мог задизеблить что надо
//         dispatch(changeTodolistEntityStatusAC({id: todolistId, status: 'loading'}));
//         todolistsAPI.deleteTodolist(todolistId).then((res) => {
//             dispatch(removeTodolistAC({id: todolistId}));
//             //скажем глобально приложению, что асинхронная операция завершена
//             dispatch(setAppStatusAC({status: 'succeeded'}));
//         });
//     };
// };

// export const addTodolistTC_ = (title: string) => {
//     return (dispatch: ThunkDispatch) => {
//         dispatch(setAppStatusAC({status: 'loading'}));
//         todolistsAPI.createTodolist(title).then((res) => {
//             dispatch(addTodolistAC({todolist: res.data.data.item}));
//             dispatch(setAppStatusAC({status: 'succeeded'}));
//         });
//     };
// };
export const changeTodolistTitleTC = (id: string, title: string) => {
    return (dispatch: Dispatch) => {
        todolistsAPI.updateTodolist(id, title).then((res) => {
            dispatch(changeTodolistTitleAC({id: id, title: title}));
        });
    };
};


//types
export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType;
    entityStatus: RequestStatusType;
};
type ThunkDispatch = Dispatch;
