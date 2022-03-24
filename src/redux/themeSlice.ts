import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState, AppThunk } from './store';


export const themeSlice = createSlice({
    name: 'theme',
    initialState: {
        darkTheme: false,
    },
    reducers: {
        toggleTheme: (state) => {
            state.darkTheme = !state.darkTheme;
        },
    },

});

export const { toggleTheme } = themeSlice.actions;
export const selectDarkTheme = (state: RootState) => state.theme.darkTheme;

export default themeSlice.reducer;



