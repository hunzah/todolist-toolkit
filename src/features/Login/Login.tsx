import React from 'react';
import {
    Button,
    Checkbox,
    FormControl,
    FormControlLabel,
    FormGroup,
    FormLabel,
    Grid,
    TextField,
} from '@material-ui/core';
import {FormikHelpers, useFormik} from 'formik';
import {useSelector} from 'react-redux';
import {loginTC} from './auth-reducer';
import {AppRootStateType, useAppDispatch} from '../../app/store';
import {Redirect} from 'react-router-dom';
import f from './../../styles/formikStyles.module.css'

type ValuesType = {
    email: string,
    password: string,
    rememberMe: boolean,
}

export const Login = () => {
    const dispatch = useAppDispatch();

    const isLoggedIn = useSelector<AppRootStateType, boolean>((state) => state.auth.isLoggedIn);

    const formik = useFormik({
        validate: (values) => {
            if (!values.email) {
                return {
                    email: 'Email is required',
                };
            }
            if (!values.password) {
                return {
                    password: 'Password is required',
                };
            }
        },
        initialValues: {
            email: '',
            password: '',
            rememberMe: false,
        },
        onSubmit: async (values: ValuesType, formikHelpers: FormikHelpers<ValuesType>) => {
            const action = await dispatch(loginTC(values));
            // @ts-ignore
            if (action.payload?.fieldsErrors.length > 0) {
                // @ts-ignore
                const error = action.payload?.fieldsErrors[0]
                formikHelpers.setFieldError(error.field, error.error)
            }
        },
    });

    if (isLoggedIn) {
        return <Redirect to={'/'}/>;
    }

    return (
        <Grid container justify="center">
            <Grid item xs={4}>
                <form onSubmit={formik.handleSubmit}>
                    <FormControl>
                        <FormLabel>
                            <p>
                                To log in get registered{' '}
                                <a href={'https://social-network.samuraijs.com/'} target={'_blank'}>
                                    here
                                </a>
                            </p>
                            <p>or use common test account credentials:</p>
                            <p> Email: free@samuraijs.com</p>
                            <p>Password: free</p>
                        </FormLabel>
                        <FormGroup>
                            <TextField label="Email" margin="normal" {...formik.getFieldProps('email')} />
                            {formik.errors.email ? <div className={f.formikError}
                                                        style={{color: 'red'}}>{formik.errors.email}</div> : null}
                            <TextField type="password" label="Password"
                                       margin="normal" {...formik.getFieldProps('password')} />
                            {formik.errors.password ?
                                <div className={f.formikError}>{formik.errors.password}</div> : null}
                            <FormControlLabel
                                label={'Remember me'}
                                control={<Checkbox {...formik.getFieldProps('rememberMe')}
                                                   checked={formik.values.rememberMe}/>}
                            />
                            <Button type={'submit'} variant={'contained'} color={'primary'}>
                                Login
                            </Button>
                        </FormGroup>
                    </FormControl>
                </form>
            </Grid>
        </Grid>
    );
};
