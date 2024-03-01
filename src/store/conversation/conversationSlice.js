import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axiosInstance from "../../services/axio";

export const fetchConversationDetail = createAsyncThunk('conversation/fetchConversationDetail', async (params) => {
    try {
        const response = await axiosInstance.get(`fetch_conversation/?token=${params.token}&self=self`);
        return response.data[0];
    } catch (error) {
        throw error;
    }
});

const conversationSlice = createSlice({
    name: 'conversation',
    initialState: {
        conversationDetail: null,
        isConversationLoading: false,
        error: ''
    },
    reducers: {
        resetConversation: (state) => {
            state.conversationDetail = null;
            state.error = ''
        },
    },

    extraReducers: (builder) => {
        builder
            .addCase(fetchConversationDetail.pending, (state, action) => {
                state.isConversationLoading = true
            })
            .addCase(fetchConversationDetail.fulfilled, (state, action) => {
                state.conversationDetail = action.payload;
                state.isConversationLoading = false
            })
            .addCase(fetchConversationDetail.rejected, (state, action) => {
                state.error = action.error.message;
            });
    },
});
export const {resetConversation} = conversationSlice.actions;

export default conversationSlice.reducer;
