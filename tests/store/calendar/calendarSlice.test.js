import { calendarSlice, onAddNewEvent, onDeleteEvent, onLoadEvents, onLogoutCalendar, onSetActiveEvent, onUpdateEvent } from "../../../src/store/calendar/calendarSlice";
import { calendarWithActiveEventState, calendarWithEventsState, events, initialState } from "../../fixtures/calendarStates";

describe('Pruebas en calendarSlice', () => {

    test('debe regresar el estado por defecto', () => {
        const state = calendarSlice.getInitialState();
        expect( state ).toEqual( initialState );
    });

    test('onSetActiveEvent debe activar el evento', () => {
        const state = calendarSlice.reducer( calendarWithEventsState, onSetActiveEvent( events[0] ) );
        expect( state.activeEvent ).toEqual( events[0] );
    });

    test('onAddNewEvent debe agregar el evento', () => {
        const newEvent = {
            id: '3',
            start: new Date('2020-10-21 13:00:00'),
            end: new Date('2020-10-21 15:00:00'),
            title: 'Cumpleaños de Fernando',
            notes: 'Alguna nota!!'
        };

        const state = calendarSlice.reducer( calendarWithEventsState, onAddNewEvent( newEvent ));
        expect( state.events ).toEqual([ ...events, newEvent ]);
    });

    test('onUpdateEvent debe agregar el evento', () => {
        const updatedEvent = {
            id: '1',
            start: new Date('2020-10-21 13:00:00'),
            end: new Date('2020-10-21 15:00:00'),
            title: 'Cumpleaños de Fernando actualizado',
            notes: 'Alguna nota actualizada'
        };

        const state = calendarSlice.reducer( calendarWithEventsState, onUpdateEvent( updatedEvent ));
        expect( state.events ).toContain( updatedEvent );
    });

    test('onDeleteEvent debe borrar el evento activo', () => {
        // calendarWithActiveEventState        
        const state = calendarSlice.reducer( calendarWithActiveEventState, onDeleteEvent() );
        expect( state.activeEvent ).toBe( null );
        expect( state.events ).not.toContain( events[0] );
    });

    test('onLoadEvents debe establecer los eventos', () => {
        // initialState
        const state = calendarSlice.reducer( initialState, onLoadEvents( events ) );
        expect( state.isLoadingEvents ).toBeFalsy();
        expect( state.events ).toEqual( events );
    });

    test('onLogoutCalendar debe limpiar el estado', () => {
        // calendarWithActiveEventState        
        const state = calendarSlice.reducer( calendarWithActiveEventState, onLogoutCalendar() );
        expect( state ).toEqual( initialState );
    });
});