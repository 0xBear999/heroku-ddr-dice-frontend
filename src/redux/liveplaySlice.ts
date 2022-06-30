import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState, AppThunk } from './store';


export const liveplaySlice = createSlice({
    name: 'liveplay',
    initialState: {
        value: false,
    },
    reducers: {
        toggleLiveplay: (state) => {
            state.value = !state.value;
        },
    },

});

export const { toggleLiveplay } = liveplaySlice.actions;
export const selectLiveplay = (state: RootState) => state.liveplay.value;

export default liveplaySlice.reducer;



