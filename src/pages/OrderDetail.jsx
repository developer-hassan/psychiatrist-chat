import '../App.css'
import React, {useEffect, useState} from 'react';
import OrderSummary from "../components/OrderSummary";
import Sidebar from "../components/common/Sidebar";
import {ringNeckLogo} from "../assets/index";
import {useDispatch, useSelector} from 'react-redux';
import {useParams} from 'react-router-dom';
import {fetchOrderDetails} from "../store/order/orderSlice";
import OrderSummarySkeleton from "../components/skeletons/OrderSummarySkeleton";
import NavBar from "../components/common/NavBar";
import {fetchConversationDetail} from "../store/conversation/conversationSlice";
import ConversationSummarySkeleton from "../components/skeletons/ConversationSummarySkeleton";
import ConversationSummary from "../components/ConversationSummary";

export default function OrderDetail() {
    const {orderId} = useParams();
    const dispatch = useDispatch();
    const {orderDetail, isOrderLoading} = useSelector((state) => state.order);
    const {conversationDetail, isConversationLoading} = useSelector((state) => state.conversation);

    useEffect(() => {
        dispatch(fetchOrderDetails({token: orderId}));
        // console.log('orderID', orderId)

        dispatch(fetchConversationDetail({token: orderId}));
    }, [dispatch, orderId]);

    const [transcript, setTranscript] = useState([]);
    useEffect(() => {
        if (conversationDetail) {
            const conversation = JSON.parse(conversationDetail.conversation?.split("\n"))

            console.log('conversation', conversation)
            conversation?.forEach((item) => {
                if (item.includes("Bot")) {
                    const message = {
                        text: item.replace("Bot: ", "").replaceAll('"', ''),
                        isBot: true,
                    }

                    setTranscript((messages) => [...messages, message]);

                    console.log('trans:', transcript)
                } else if (item.includes("Human")) {
                    const message = {
                        text: item.replace("Human: ", "").replaceAll('"', ''),
                        isBot: false,
                    }

                    setTranscript((messages) => [...messages, message]);
                }
            });
        }
    }, [conversationDetail])


    return (
        <>
            <div className="bg-gradient flex flex-col min-h-screen">
                <NavBar/>
                <div className="flex bg-gradient grow">
                    <Sidebar/>
                    <div className="flex flex-col xl:flex-row justify-center grow gap-6 pt-8">
                        {
                            isConversationLoading ? <ConversationSummarySkeleton/> :
                                <ConversationSummary transcript={transcript}/>
                        }

                        {
                            isOrderLoading ? <OrderSummarySkeleton/> : <OrderSummary orderDetail={orderDetail}/>
                        }
                    </div>
                    <div className="flex justify-center pt-10 pr-10 hidden lg:flex">
                        <img className="w-42 h-32 mb-6 flex-shrink-0" src={ringNeckLogo} alt=""/>
                    </div>
                </div>
            </div>
        </>
    )
}