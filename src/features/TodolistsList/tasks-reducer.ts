import {TaskPriorities, TaskStatuses, TaskType, todolistsAPI, UpdateTaskModelType} from '../../api/todolists-api';
import {Dispatch} from 'redux';
import {AppRootStateType} from '../../app/store';
import {setAppStatusAC} from '../../app/app-reducer';
import {handleServerAppError, handleServerNetworkError} from '../../utils/error-utils';
import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {addTodolistAC, removeTodolistAC, setTodolistsAC} from './todolists-reducer';

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
    async (param:addTaskParamType, thunkAPI) => {


      thunkAPI.dispatch(setAppStatusAC({status: 'loading'}));

    const res = await todolistsAPI.createTask(param.todolistId, param.title)
            try {if (res.data.resultCode === 0) {
                const task = res.data.data.item;
                const action = {task: task}
                thunkAPI.dispatch(setAppStatusAC({status: 'succeeded'}));
                return action
            } else {
                handleServerAppError(res.data, thunkAPI.dispatch);
                return {} as { task: TaskType; }
            }}

        catch (error) {
            // @ts-ignore
            handleServerNetworkError(error, thunkAPI.dispatch);
            return {} as { task: TaskType; }
        }

})
export const updateTaskTC = createAsyncThunk('tasks/removeTask', async (taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string, thunkAPI) => {
    await todolistsAPI.deleteTask(param.todolistId, param.taskId)
    return {taskId: param.taskId, todolistId: param.todolistId}

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
        builder.addCase(setTodolistsAC, (state, action) => {
            action.payload.todolists.forEach((tl) => {
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
    },
});
export const tasksReducer = slice.reducer;

// actions
export const {addTaskAC, updateTaskAC} = slice.actions;

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
export const updateTaskTC_ =
    (taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string) =>
        (dispatch: ThunkDispatch, getState: () => AppRootStateType) => {
            const state = getState();
            const task = state.tasks[todolistId].find((t) => t.id === taskId);
            if (!task) {
                //throw new Error("task not found in the state");
                console.warn('task not found in the state');
                return;
            }
            const apiModel: UpdateTaskModelType = {
                deadline: task.deadline,
                description: task.description,
                priority: task.priority,
                startDate: task.startDate,
                title: task.title,
                status: task.status,
                ...domainModel,
            };

            todolistsAPI
                .updateTask(todolistId, taskId, apiModel)
                .then((res) => {
                    if (res.data.resultCode === 0) {
                        const action = updateTaskAC({taskId: taskId, model: domainModel, todolistId: todolistId});
                        dispatch(action);
                    } else {
                        handleServerAppError(res.data, dispatch);
                    }
                })
                .catch((error) => {
                    handleServerNetworkError(error, dispatch);
                });
        };

// types
type addTaskParamType = { title: string, todolistId: string };

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
