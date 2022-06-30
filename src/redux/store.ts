import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import themeReducer from './themeSlice';
import liveplayReducer from './liveplaySlice';

export const store = configureStore({
    reducer: {
        // defiData: defiDataReducer,
        theme: themeReducer,
        liveplay: liveplayReducer

    },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    unknown,
    Action<string>
>;
