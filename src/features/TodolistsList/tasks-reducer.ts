import {
    TaskPriorities,
    TaskStatuses,
    TaskType,
    todolistsAPI,
    TodolistType,
    UpdateTaskModelType
} from '../../api/todolists-api';
import {Dispatch} from 'redux';
import {AppRootStateType} from '../../app/store';
import {setAppStatusAC} from '../../app/app-reducer';
import {handleServerAppError, handleServerNetworkError} from '../../utils/error-utils';
import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {addTodolistAC, fetchTodolistsTC, removeTodolistAC} from './todolists-reducer';


const initialState: TasksStateType = {};


//thunks
export const fetchTasksTC = createAsyncThunk('tasks/fetchTasks', async (todolistId: string, thunkAPI) => {
    thunkAPI.dispatch(setAppStatusAC({status: 'loading'}));
    const res = await todolistsAPI.getTasks(todolistId)
    const tasks = res.data.items;
    thunkAPI.dispatch(setAppStatusAC({status: 'succeeded'}));
    return {tasks: tasks, todolistId: todolistId}

})
export const removeTaskTC = createAsyncThunk('tasks/removeTask', async (param: { taskId: string, todolistId: string }, thunkAPI) => {
    await todolistsAPI.deleteTask(param.todolistId, param.taskId)
    return {taskId: param.taskId, todolistId: param.todolistId}

})

export const addTaskTC = createAsyncThunk('tasks/addTask',
    async (param: addTaskParamType, thunkAPI) => {


        thunkAPI.dispatch(setAppStatusAC({status: 'loading'}));
        try {
            const res = await todolistsAPI.createTask(param.todolistId, param.title)
            if (res.data.resultCode === 0) {
                const task = res.data.data.item;
                thunkAPI.dispatch(setAppStatusAC({status: 'succeeded'}));
                return {task: res.data.data.item}
            } else {
                handleServerAppError(res.data, thunkAPI.dispatch);
                return thunkAPI.rejectWithValue(null)
            }
        } catch (err) {
            const error = err as { message: string }
            handleServerNetworkError(error, thunkAPI.dispatch);
            return thunkAPI.rejectWithValue(null)
        }

    })

export const updateTaskTC = createAsyncThunk('tasks/updateTask', async (param: updateTaskParamsType, thunkAPI) => {
    const state = thunkAPI.getState() as AppRootStateType
    const task = state.tasks[param.todolistId].find((t) => t.id === param.taskId);
    if (!task) {
        //throw new Error("task not found in the state");
        console.warn('task not found in the state');
        return thunkAPI.rejectWithValue('task not found in the state')
    }
    const apiModel: UpdateTaskModelType = {
        deadline: task.deadline,
        description: task.description,
        priority: task.priority,
        startDate: task.startDate,
        title: task.title,
        status: task.status,
        ...param.domainModel,
    };

    const res = await todolistsAPI.updateTask(param.todolistId, param.taskId, apiModel)
    try {
        if (res.data.resultCode === 0) {
            return {param};
        } else {
            handleServerAppError(res.data, thunkAPI.dispatch);
            return thunkAPI.rejectWithValue(null)
        }
    } catch (err) {
        const error = err as { message: string }
        handleServerNetworkError(error, thunkAPI.dispatch);
        return thunkAPI.rejectWithValue(null)
    }
})

const slice = createSlice({
    name: 'tasks',
    initialState: initialState,
    reducers: {
        addTaskAC(state, action: PayloadAction<{ task: TaskType }>) {
            state[action.payload.task.todoListId].unshift(action.payload.task);
        },
        updateTaskAC(
            state,
            action: PayloadAction<{ taskId: string; model: UpdateDomainTaskModelType; todolistId: string }>,
        ) {
            const tasks = state[action.payload.todolistId];
            const index = tasks.findIndex((t) => t.id === action.payload.taskId);
            if (index > -1) {
                tasks[index] = {...tasks[index], ...action.payload.model};
            }
        },
    },
    extraReducers: (builder) => {
        builder.addCase(addTodolistAC, (state, action) => {
            state[action.payload.todolist.id] = [];
        });
        builder.addCase(removeTodolistAC, (state, action) => {
            delete state[action.payload.id];
        });
        builder.addCase(fetchTodolistsTC.fulfilled, (state, action) => {
            action.payload.todolists.forEach((tl: TodolistType) => {
                state[tl.id] = [];
            });
        });
        builder.addCase(fetchTasksTC.fulfilled, (state, action) => {
            state[action.payload.todolistId] = action.payload.tasks;
        });
        builder.addCase(removeTaskTC.fulfilled, (state, action) => {
            const todolist = state[action.payload.todolistId];

            const index = todolist.findIndex((t) => t.id === action.payload.taskId);
            if (index > -1) {
                todolist.splice(index, 1);
            }
        });
        builder.addCase(addTaskTC.fulfilled, (state, action) => {
            state[action.payload?.task.todoListId].unshift(action.payload?.task);
        });
        builder.addCase(updateTaskTC.fulfilled, (state, action) => {
                const tasks = state[action.payload.param.todolistId];
                const index = tasks.findIndex((t) => t.id === action.payload.param.taskId);
                if (index > -1) {
                    tasks[index] = {...tasks[index], ...action.payload.param.domainModel};
                }
            },
        );
    },
});
export const tasksReducer = slice.reducer;


// thunks
// export const addTaskTC = (title: string, todolistId: string) => (dispatch: Dispatch) => {
//     dispatch(setAppStatusAC({status: 'loading'}));
//     todolistsAPI
//         .createTask(todolistId, title)
//         .then((res: any) => {
//             if (res.data.resultCode === 0) {
//                 const task = res.data.data.item;
//                 const action = addTaskAC({task: task});
//                 dispatch(action);
//                 dispatch(setAppStatusAC({status: 'succeeded'}));
//             } else {
//                 handleServerAppError(res.data, dispatch);
//             }
//         })
//         .catch((error) => {
//             handleServerNetworkError(error, dispatch);
//         });
// };
// export const updateTaskTC_ =
//     (taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string) =>
//         (dispatch: ThunkDispatch, getState: () => AppRootStateType) => {
//             const state = getState();
//             const task = state.tasks[todolistId].find((t) => t.id === taskId);
//             if (!task) {
//                 //throw new Error("task not found in the state");
//                 console.warn('task not found in the state');
//                 return;
//             }
//             const apiModel: UpdateTaskModelType = {
//                 deadline: task.deadline,
//                 description: task.description,
//                 priority: task.priority,
//                 startDate: task.startDate,
//                 title: task.title,
//                 status: task.status,
//                 ...domainModel,
//             };
//
//             todolistsAPI
//                 .updateTask(todolistId, taskId, apiModel)
//                 .then((res) => {
//                     if (res.data.resultCode === 0) {
//                         const action = updateTaskAC({taskId: taskId, model: domainModel, todolistId: todolistId});
//                         dispatch(action);
//                     } else {
//                         handleServerAppError(res.data, dispatch);
//                     }
//                 })
//                 .catch((error) => {
//                     handleServerNetworkError(error, dispatch);
//                 });
//         };
// types
type addTaskParamType = { title: string, todolistId: string };
type updateTaskParamsType = {
    taskId: string,
    domainModel: UpdateDomainTaskModelType,
    todolistId: string
};

export type UpdateDomainTaskModelType = {
    title?: string;
    description?: string;
    status?: TaskStatuses;
    priority?: TaskPriorities;
    startDate?: string;
    deadline?: string;
};
export type TasksStateType = {
    [key: string]: Array<TaskType>;
};

type ThunkDispatch = Dispatch;
