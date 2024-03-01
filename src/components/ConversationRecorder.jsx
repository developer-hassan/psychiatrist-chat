// import {
//     useConversation,
//     SelfHostedConversationConfig
// } from "vocode";

import {useConversation} from "../hook/conversation";
import React, {useEffect, useState} from 'react';
import {useNavigate} from "react-router-dom";
import {FaPlay, FaStop} from "react-icons/fa";
import PlayButton from "./common/PlayButton";
import Spinner from "./common/Spinner";
import Sidebar from "./common/Sidebar";
import {ringNeckLogo} from "../assets/index";
import {socketUrl} from '../services/baseUrl'
import {fetchOrderStatus, resetOrderStatus, createToken} from '../store/recorder/recorderSlice';
import {useSelector, useDispatch} from 'react-redux';
import NavBar from "./common/NavBar";
import {ToastContainer,toast} from "react-toastify";

export default function ConversationRecorder() {
    // const selectedRoom = useSelector((state) => state.home.selectedRoom);
    const dispatch = useDispatch();
    // const [backendUrl, setBackendUrl] = useState(`${socketUrl}conversation?param=${selectedRoom.room_no}&hotel_name=${selectedHotel.hotel_name}&token=${token}`);
    const orderStatus = useSelector((state) => state.recorder.orderStatus);
    const token = useSelector((state) => state.recorder.token);
    // const selectedHotel = useSelector((state) => state.home.selectedHotel);

    const [backendUrl, setBackendUrl] = useState(`${socketUrl}conversation?param=201&hotel_name=&token=${token}`);
    const [config, setConfig] = useState({
        backendUrl,
        audioDeviceConfig: {},
    });
    const [prevToken, setPrevToken] = useState(null);

    useEffect(() => {
        // Update backendUrl when token changes
        setBackendUrl(`${socketUrl}conversation?param=201&hotel_name=&token=${token}`);
        // setPrevToken(token);
        console.log('token changed', token)
    }, [token]);

    useEffect(() => {
        // Update config when backendUrl changes
        setConfig({
            backendUrl,
            audioDeviceConfig: {},
        });
    }, [backendUrl]);


    const navigate = useNavigate();

    const {status, start, stop, error, analyserNode} = useConversation(config);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (status === 'connecting') {
            setIsLoading(true);
        } else if (status === 'connected') {
            setIsLoading(false);
        } else if (status === 'idle') {
            dispatch(createToken())
        } else if (status === 'error') {
            setIsLoading(false);
            toast.error('Server connection failed!')
        }
        console.log('status changed:', status)
    }, [status]);

    useEffect(() => {
        if (orderStatus) {
            dispatch(resetOrderStatus());
            console.log('previous token at the end',prevToken)
            navigate(`/order-detail/${prevToken}`);
        }
    }, [orderStatus]);

    const onStartStop = async () => {

        console.log('onStartStop', status)
        if (status === 'idle' || status === 'error') {
            setPrevToken(token)
            start();
        } else {
            stop();
            setIsLoading(true);
            setTimeout(async () => {
                console.log('previous token', prevToken)
                await dispatch(fetchOrderStatus({token: prevToken}))
                setIsLoading(false);
            }, 5000)
        }
    };

    return (
        <>
            <div className="bg-gradient flex flex-col min-h-screen">
                <NavBar/>
                <div className="flex grow">
                    <Sidebar/>
                    <div className="flex justify-center items-center text-white grow">
                        <div className="flex flex-col items-center w-full max-w-2xl">
                            <div className="relative">
                                <PlayButton status={status}/>
                                <button
                                    className="absolute inset-0 m-auto rounded-full bg-white text-[#241b52] w-16 h-16 flex justify-center items-center"
                                    disabled={isLoading}
                                    onClick={() => onStartStop()}
                                >
                                    {
                                        isLoading ?
                                            <Spinner/>
                                            : status === 'connected' ? (
                                                <FaStop size={28}/>
                                            ) : (
                                                <FaPlay size={28}/>
                                            )
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-center pt-10 pr-10 hidden lg:flex">
                        <img className="w-32 h-32 mb-6" src={ringNeckLogo} alt=""/>
                    </div>
                </div>
            </div>
            <ToastContainer theme="dark"/>
        </>
    )
}