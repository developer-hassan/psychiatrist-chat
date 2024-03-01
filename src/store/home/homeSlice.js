import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
// import axiosInstance from "../../services/axio";

export const fetchHotelsAndRooms = createAsyncThunk('hotels/list', async (params) => {
    try {
        const [hotelsList, roomsList] = await Promise.all([
            axiosInstance.get(`hotels/?self=self`),
            axiosInstance.get(`rooms/?self=self`),
        ]);

        const hotels = hotelsList?.data
        const rooms = roomsList?.data
        console.log(hotels, rooms)
        return {hotels, rooms};
    } catch (error) {
        throw error;
    }
});


const homeSlice = createSlice({
    name: 'home',
    initialState: {
        hotels: [],
        rooms: [],
        selectedHotel: null,
        selectedRoom: null,
        isLoading: false,
        error: ''
    },
    reducers: {
        setSelectedRoom: (state, action) => {
            state.selectedRoom = action.payload
        },

        setSelectedHotel: (state, action) => {
            state.selectedHotel = action.payload
        }
    },

    extraReducers: (builder) => {
        builder
            .addCase(fetchHotelsAndRooms.pending, (state, action) => {
                state.isLoading = true
            })
            .addCase(fetchHotelsAndRooms.fulfilled, (state, action) => {
                state.hotels = action.payload.hotels;
                state.rooms = action.payload.rooms;
                state.isLoading = false
            })
            .addCase(fetchHotelsAndRooms.rejected, (state, action) => {
                state.error = action.error.message;
            });
    },
});

export const {setSelectedRoom, setSelectedHotel} = homeSlice.actions;

export default homeSlice.reducer;
