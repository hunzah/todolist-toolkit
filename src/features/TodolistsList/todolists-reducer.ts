import {todolistsAPI, TodolistType} from '../../api/todolists-api';
import {Dispatch} from 'redux';
import {RequestStatusType, setAppStatusAC} from '../../app/app-reducer';
import {handleServerNetworkError} from '../../utils/error-utils';
import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';

const initialState: Array<TodolistDomainType> = [];


export const fetchTodolistsTC = createAsyncThunk('todolists/fetchTodolists', async (param, thunkAPI) => {
    thunkAPI.dispatch(setAppStatusAC({status: 'loading'}));
    const res = await todolistsAPI.getTodolists()
    try {
        // thunkAPI.dispatch(setTodolistsAC({todolists: res.data}));
        thunkAPI.dispatch(setAppStatusAC({status: 'succeeded'}));
        return {todolists: res.data};

    } catch (err) {
        const error = err as { message: string }
        handleServerNetworkError(error, thunkAPI.dispatch);
        return thunkAPI.rejectWithValue(null)
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
    thunkAPI.dispatch(setAppStatusAC({status: 'succeeded'}));
    return {todolist: res.data.data.item}
})

export const changeTodolistTitleTC = createAsyncThunk('todolists/changeTodolistTitle', async (param: { id: string, title: string }) => {
    await todolistsAPI.updateTodolist(param.id, param.title)
    return {id: param.id, title: param.title}
})

const slice = createSlice({
    name: 'todolists',
    initialState: initialState,
    reducers: {
        changeTodolistFilterAC(state, action: PayloadAction<{ id: string; filter: FilterValuesType }>) {
            const index = state.findIndex((tl) => tl.id === action.payload.id);
            state[index].filter = action.payload.filter;
        },
        changeTodolistEntityStatusAC(state, action: PayloadAction<{ id: string; status: RequestStatusType }>) {
            const index = state.findIndex((tl) => tl.id === action.payload.id);
            state[index].entityStatus = action.payload.status;
        },

    },
    extraReducers: builder => {
        builder.addCase(fetchTodolistsTC.fulfilled, (state, action) => {
            return action.payload.todolists.map((tl) => ({...tl, filter: 'all', entityStatus: 'idle'}));
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
        builder.addCase(changeTodolistTitleTC.fulfilled, (state, action) => {
            const index = state.findIndex((tl) => tl.id === action.payload.id);
            state[index].title = action.payload.title;
        })
    }

});
export const todolistsReducer = slice.reducer;

export const {changeTodolistFilterAC, changeTodolistEntityStatusAC} = slice.actions;


// export const changeTodolistTitleTC = (id: string, title: string) => {
//     return (dispatch: Dispatch) => {
//         todolistsAPI.updateTodolist(id, title).then((res) => {
//             dispatch(changeTodolistTitleAC({id: id, title: title}));
//         });
//     };
// };


//types
export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType;
    entityStatus: RequestStatusType;
};
