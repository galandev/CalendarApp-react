import { configureStore } from "@reduxjs/toolkit";
import { authSlice } from "../../src/store";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useAuthStore } from "../../src/hooks";
import { Provider } from "react-redux";
import { initialState, notAuthenticatedState } from "../fixtures/authStates";
import { testUserCredentials } from "../fixtures/testUser";
import calendarApi from "../../src/api/calendarApi";

describe('Pruebas en useAuthStore', () => {

    beforeEach( () => localStorage.clear() );

    const getMockStore = ( initialState) => {
        return configureStore({
            reducer: {
                auth: authSlice.reducer
            },
            preloadedState: {
                auth: { ...initialState }
            }
        });
    };

    test('debe regresar los valores por defecto', () => {

        const mockStore = getMockStore({ ...initialState });
        const { result } = renderHook( () => useAuthStore(), {
            wrapper: ({ children }) => <Provider store={ mockStore }>{ children }</Provider> 
        });

        expect( result.current ).toEqual({
            status: 'checking',
            user: {},
            errorMessage: undefined,
            startLogin: expect.any(Function),
            startRegister: expect.any(Function),
            checkAuthToken: expect.any(Function),
            startLogout: expect.any(Function),
        });
    });

    test('startLogin debe realizar el login correctamente', async() => {

        const mockStore = getMockStore({ ...notAuthenticatedState });
        const { result } = renderHook( () => useAuthStore(), {
            wrapper: ({ children }) => <Provider store={ mockStore }>{ children }</Provider> 
        });

        await act( async() => {
            await result.current.startLogin( testUserCredentials );
        });

        const { errorMessage, status, user } = result.current;
        expect({ errorMessage, status, user }).toEqual({
            errorMessage: undefined,
            status: 'authenticated',
            user: { name: 'Test User', uid: '66d6020d68fe2517c76b424e' }
        });

        expect( localStorage.getItem('token')).toEqual( expect.any(String) );
        expect( localStorage.getItem('token-init-date')).toEqual( expect.any(String) );
    });
    
    test('startLogin debe fallar la autenticación', async() => {
       
        const mockStore = getMockStore({ ...notAuthenticatedState });
        const { result } = renderHook( () => useAuthStore(), {
            wrapper: ({ children }) => <Provider store={ mockStore }>{ children }</Provider> 
        });

        await act( async() => {
            await result.current.startLogin({ email: 'algo@google.com', password: '13243343' });
        });

        const { errorMessage, status, user } = result.current;
        
        expect( localStorage.getItem('token')).toBe(null);
        expect({ errorMessage, status, user }).toEqual({
            errorMessage: 'Credenciales incorrectas',
            status: 'not-authenticated',
            user: {}
        });

        await waitFor(
            () => expect( result.current.errorMessage ).toBe( undefined )
        );
    });

    test('startRegister debe crear un usuario', async() => {

        const newUser = { email: 'algo@google.com', password: '123456789', name: 'Test User 2' };

        const mockStore = getMockStore({ ...notAuthenticatedState });
        const { result } = renderHook( () => useAuthStore(), {
            wrapper: ({ children }) => <Provider store={ mockStore }>{ children }</Provider> 
        });

        const spy = jest.spyOn( calendarApi, 'post' ).mockReturnValue({
            data: {
                ok: true,
                uid: "454k5l4k4k54l54k4l5kl4",
                name: "Test User",
                toke: "ALGUN-TOKEN"
            }
        });

        await act( async() => {
            await result.current.startRegister({ newUser });
        });

        const { errorMessage, status, user } = result.current;
        
        expect({ errorMessage, status, user }).toEqual({
            errorMessage: undefined,
            status: 'authenticated',
            user: { name: 'Test User', uid: '454k5l4k4k54l54k4l5kl4' }
        });

        spy.mockRestore();
    });

    test('startRegister debe fallar la creación', async() => {

        const mockStore = getMockStore({ ...notAuthenticatedState });
        const { result } = renderHook( () => useAuthStore(), {
            wrapper: ({ children }) => <Provider store={ mockStore }>{ children }</Provider> 
        });

        await act( async() => {
            await result.current.startRegister( testUserCredentials );
        });

        const { errorMessage, status, user } = result.current;
        
        expect({ errorMessage, status, user }).toEqual({
            errorMessage: 'Ya existe un usuario con ese correo',
            status: 'not-authenticated',
            user: {}
        });
    });

    test('checkAuthToken debe fallar si no hay un Token', async() => {
        
        const mockStore = getMockStore({ ...initialState });
        const { result } = renderHook( () => useAuthStore(), {
            wrapper: ({ children }) => <Provider store={ mockStore }>{ children }</Provider> 
        });

        await act( async() => {
            await result.current.checkAuthToken();
        });

        const { errorMessage, status, user } = result.current;
        expect({ errorMessage, status, user }).toEqual({
            errorMessage: undefined,
            status: 'not-authenticated',
            user: {}
        });
    });

    test('checkAuthToken debe autenticar el usuario si hay un Token', async() => {
        
        const { data } = await calendarApi.post('/auth', testUserCredentials);
        localStorage.setItem('token', data.token);

        const mockStore = getMockStore({ ...initialState });
        const { result } = renderHook( () => useAuthStore(), {
            wrapper: ({ children }) => <Provider store={ mockStore }>{ children }</Provider> 
        });

        await act( async() => {
            await result.current.checkAuthToken();
        });

        const { errorMessage, status, user } = result.current;
        
        expect({ errorMessage, status, user }).toEqual({
            errorMessage: undefined,
            status: 'authenticated',
            user: { name: 'Test User', uid: '66d6020d68fe2517c76b424e' }
        });
    });
});