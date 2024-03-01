import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {v4 as uuidv4} from 'uuid';
import axiosInstance from "../../services/axio";

export const fetchOrderStatus = createAsyncThunk('orders/fetchOrderStatus', async (params) => {
    try {
        const response = await axiosInstance.get(`check_order/?token=${params.token}&self=self`);
        return response.data.order_exists;
    } catch (error) {
        throw error;
    }
});

const recorderSlice = createSlice({
    name: 'recorder',
    initialState: {
        token: '',
        orderStatus: false,
        error: ''
    },
    reducers: {
        createToken: (state) => {
            state.token = uuidv4();
        },

        resetOrderStatus: (state) => {
            state.orderStatus = false;
        },
    },

    extraReducers: (builder) => {
        builder
            .addCase(fetchOrderStatus.fulfilled, (state, action) => {
                state.orderStatus = action.payload;
            })
            .addCase(fetchOrderStatus.rejected, (state, action) => {
                state.error = action.error.message;
            });
    },
});

export const {createToken, resetOrderStatus} = recorderSlice.actions;

export default recorderSlice.reducer;
