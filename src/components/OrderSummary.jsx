import moment from 'moment';
import React, {useEffect, useState} from 'react';
import {roomServiceGroup} from "../assets/index";

export default function OrderSummary({orderDetail}) {
    const [date, setDate] = useState('')
    const [time, setTime] = useState('')
    const [orderItemList, setOrderItemList] = useState([]);

    const convertToUserLocalTime = (gmtTime) => {
        const localDate = moment.utc(gmtTime).local().format('DD-MM-YY');
        const localTime = moment.utc(gmtTime).local().format('hh:mm A');

        setDate(localDate);
        setTime(localTime);
    };

    useEffect(() => {
        if (orderDetail) {
            const orderDetails = JSON.parse(orderDetail?.order_details);
            const quantities = orderDetails.quantities;
            const productNames = orderDetails.product_names;

            convertToUserLocalTime(orderDetail?.added_on)

            const items = productNames?.map((product, index) => (
                <h5 className="text-white capitalize text-xl font-medium" key={index}>
                    {product} - {quantities[index]}
                </h5>
            ));

            setOrderItemList(items);
        }
        
    }, [orderDetail]);
    

return (
    <>
        <div className="w-full mx-auto mt-8 xl:mt-0 px-6 sm:px-0 xl:w-[400px] max-w-[400px]">
            <h4 className="text-lg text-white text-center mb-3">Backend Management Signal</h4>
            <div
                className="border-[3px] rounded-3xl border-[#4169E1] min-h-[500px] sm:min-h-[600px] flex flex-col justify-center p-6 sm:p-14">
                <div
                    className="flex flex-col justify-center items-center rounded-2xl border-2 border-[#4169E1] pb-3 mb-8">
                    <img className="-mt-8 w-16 mb-2" src={roomServiceGroup} alt=""/>
                    <h5 className="font-medium text-lg text-white mb-3">Patient Details</h5>
                    <div>
                        {
                            orderDetail ?
                                <div className="">
                                    <p className="text-white mb-1">Patient number: <span>{orderDetail?.room_no}</span></p>
                                    <p className="text-white mb-1">Time Visited: <span>{time}</span></p>
                                    <p className="text-white mb-8">Date: <span>{date}</span></p>
                                    {orderItemList}
                                </div>
                                :
                                <div>
                                    <h5 className="text-white capitalize text-xl font-medium">
                                        No Patient Detail!
                                    </h5>
                                </div>
                        }
                    </div>

                </div>

                <button className="rounded-full bg-gray-500 h-8 w-9/12 mx-auto">Pending</button>
            </div>
        </div>
    </>
)

}