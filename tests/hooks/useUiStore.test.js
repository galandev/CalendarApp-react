const { renderHook } = require("@testing-library/react");
const { useUIStore } = require("../../src/hooks");
const { Provider } = require("react-redux");
const { uiSlice } = require("../../src/store");
const { configureStore } = require("@reduxjs/toolkit");

const getMockStore = ( initialState) => {
    return configureStore({
        reducer: {
            ui: uiSlice.reducer
        },
        preloadedState: {
            ui: { ...initialState }
        }
    });
};

describe('Pruebas en useUiStore', () => {
    
    test('debe regresar los valores por defecto', () => {

        const mockStore = getMockStore({ isDateModalOpen: false });
        const { result } = renderHook( () => useUIStore(), {
            wrapper: ({ children }) => <Provider store={ mockStore }>{ children }</Provider> 
        });
        
        expect( result.current ).toEqual({
            isDateModalOpen: false,
            openDateModal: expect.any(Function),
            closeDateModal: expect.any(Function),
            toggleDateModal: expect.any(Function),
        });
    });

    test('openDateModal debe colocar true en el isDateModalOpen', () => {
        const mockStore = getMockStore({ isDateModalOpen: true });
        const { result } = renderHook( () => useUIStore(), {
            wrapper: ({ children }) => <Provider store={ mockStore }>{ children }</Provider> 
        });
    });
});