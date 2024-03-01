import React, {useState} from 'react';
import {ringNeckLogo} from "../assets/index";
import Modal from "./common/Modal";
import RoomsSelect from "./RoomsSelect";
import HotelsSelect from './HotelsSelect';
import {useSelector} from "react-redux";
import {ToastContainer, toast} from 'react-toastify';

export default function DemoScreen({setShowRecorder}) {
    const {selectedHotel, selectedRoom} = useSelector((state) => state.home);

    const onPressContinue = () => {
        // if (selectedHotel && selectedRoom) {
        //     closeModal()
        //
        //     setTimeout(() => {
        //         setShowRecorder(true);
        //     }, 200)
        // } else if (!selectedHotel) {
        //     toast.error('select hotel to continue !')
        // } else {
        //     toast.error('select room to continue !')
        // }

        setShowRecorder(true);
    };

    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <div className="min-h-screen flex justify-center items-center bg-gradient">
                <div className="flex flex-col items-center">
                    <img className="w-75 h-64 mb-6" src={ringNeckLogo} alt=""/>
                    <h3 className="text-white text-3xl font-semibold mb-2">Psychiatrist AI</h3>
                    <h1 className="text-white text-6xl font-semibold mb-6">DEMO</h1>
                    <p className="text-white text-xl mb-3">Beyond Voice! Beyond Limits</p>
                    <button onClick={onPressContinue}
                            className="rounded-full text-lg border-2 text-white py-2.5 px-8 border-[#4169E1]">
                        Press enter to continue
                    </button>
                </div>
            </div>
            <Modal open={isModalOpen} onClose={closeModal} title="Hotel Detail">
                <div className="pt-4">
                    <div className="mb-4">
                        <label className="font-medium text-gray-700">Hotel Name</label>
                        <HotelsSelect/>
                    </div>

                    <div className="mb-8">
                        <label className="font-medium text-gray-700">Room Number</label>
                        <RoomsSelect/>
                    </div>

                    <div className="flex justify-center">
                        <button onClick={onPressContinue}
                                type="button"
                                className="px-8 py-2 text-sm font-medium text-white bg-[#4169E1] border border-transparent rounded-md hover-bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                        >
                            Continue
                        </button>
                    </div>
                </div>
            </Modal>
            <ToastContainer theme="dark"/>
        </>
    )
}