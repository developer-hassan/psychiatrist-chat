import '../App.css'
import React, {useEffect, useState} from 'react';
import ConversationRecorder from "../components/ConversationRecorder";
import DemoScreen from "../components/DemoScreen";
import {fetchHotelsAndRooms} from "../store/home/homeSlice";
import {useSelector, useDispatch} from 'react-redux';
import {createToken} from '../store/recorder/recorderSlice';
import {resetConversation} from "../store/conversation/conversationSlice";

export default function Home() {
    const [showRecorder, setShowRecorder] = useState(false)
    const token = useSelector((state) => state.recorder.token);
    const dispatch = useDispatch();

    useEffect(() => {
        // dispatch(fetchHotelsAndRooms())
        // dispatch(createToken())

        dispatch(resetConversation());
    }, []);
    return (
        <>
            {
                showRecorder ? <ConversationRecorder/> : <DemoScreen setShowRecorder={setShowRecorder}/>
            }
        </>
    )
}