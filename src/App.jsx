import './App.css'
import React, {useState} from 'react';
import 'react-toastify/dist/ReactToastify.css';
import Home from "./pages/Home";
import OrderDetail from "./pages/OrderDetail";
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";


const router = createBrowserRouter([
    {
        path: "/",
        element: <Home/>,
    },
    {
        path: "/order-detail/:orderId",
        element: <OrderDetail/>,
    },
]);

export default function App() {
    return (
        <>
            <RouterProvider router={router} />
        </>
    )
}