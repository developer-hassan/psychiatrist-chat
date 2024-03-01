import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axiosInstance from "../../services/axio";

export const fetchOrderDetails = createAsyncThunk('order/fetchOrderDetails', async (params) => {
    try {
        const response = await axiosInstance.get(`fetch_orders/?token=${params.token}&self=self`);
        return response.data[0];
    } catch (error) {
        throw error;
    }
});

const recorderSlice = createSlice({
    name: 'order',
    initialState: {
        orderDetail: null,
        isOrderLoading: false,
        error: ''
    },
    reducers: {},

    extraReducers: (builder) => {
        builder
            .addCase(fetchOrderDetails.pending, (state, action) => {
                state.isOrderLoading = true
            })
            .addCase(fetchOrderDetails.fulfilled, (state, action) => {
                state.orderDetail = action.payload;
                state.isOrderLoading = false
            })
            .addCase(fetchOrderDetails.rejected, (state, action) => {
                state.error = action.error.message;
            });
    },
});

export default recorderSlice.reducer;
