import React, {useState} from 'react';
import {fourSeasonImg, hotelLogo} from "../../assets/index";
import {FaCreativeCommons, FaRegQuestionCircle, FaPlus} from "react-icons/fa";
import {btnRoundedBorder} from "../../assets/index";
import {useSelector} from "react-redux";

export default function Sidebar() {
    const selectedHotel = useSelector((state) => state.home.selectedHotel);

    return (
        <>
            <div className="h-screen overflow-y-auto flex flex-col justify-between justify-center w-66 px-3 hidden lg:flex">
                <div className="flex justify-center pt-10">
                    {/*<img className="w-44 mb-6" src={hotelLogo} alt=""/>*/}
                    {/*{selectedHotel.logo_url && <img className="w-36 mb-6" src={selectedHotel.logo_url} alt=""/>}*/}
                    <img className="w-32 mb-6" src={fourSeasonImg} alt=""/>
                </div>
                <ul className="flex flex-col items-center gap-y-4 mb-20">
                    <li
                        className="h-[60px] cursor-pointer relative flex items-center w-full text-lg text-white py-2.5 px-4 border-[#4169E1]">
                        <FaPlus className="h-5 w-5"/>
                        <span className="ml-3">New Conversation</span>
                        <img className="absolute inset-0 w-full h-full" src={btnRoundedBorder} alt=""/>
                    </li>
                    <li
                        className="h-[60px] cursor-pointer relative flex items-center w-full text-lg text-white py-2.5 px-4 border-[#4169E1]">
                        <FaRegQuestionCircle className="h-6 w-6"/>
                        <span className="ml-3">FAQs</span>
                        <img className="absolute inset-0 w-full h-full" src={btnRoundedBorder} alt=""/>
                    </li>
                    <li
                        className="h-[60px] cursor-pointer relative flex items-center w-full text-lg text-white py-2.5 px-4 border-[#4169E1]">
                        <FaRegQuestionCircle className="h-6 w-6"/>
                        <span className="ml-3">Help</span>
                        <img className="absolute inset-0 w-full h-full" src={btnRoundedBorder} alt=""/>
                    </li>
                    <li
                        className="h-[60px] cursor-pointer relative flex items-center w-full text-lg text-white py-2.5 px-4 border-[#4169E1]">
                        <FaCreativeCommons className="h-6 w-6"/>
                        <span className="ml-3">Legal</span>
                        <img className="absolute inset-0 w-full h-full" src={btnRoundedBorder} alt=""/>
                    </li>
                </ul>
            </div>
        </>
    )
}