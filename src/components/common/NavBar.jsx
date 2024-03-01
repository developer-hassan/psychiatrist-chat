import React, {useState} from 'react';
import {fourSeasonImg, hotelLogo, ringNeckLogo} from "../../assets/index";
import {FaCreativeCommons, FaRegQuestionCircle, FaPlus} from "react-icons/fa";
import {btnRoundedBorder} from "../../assets/index";
import {useSelector} from "react-redux";
export default function NavBar() {
    const selectedHotel = useSelector((state) => state.home.selectedHotel);

    return (
        <>
            <div className="flex justify-between items-center gap-3 lg:hidden px-3 pt-3">
                {/*<img className="w-36" src={hotelLogo} alt=""/>*/}
                {/*{selectedHotel.logo_url && <img className="w-16" src={selectedHotel.logo_url} alt=""/>}*/}
                <img className="w-10 h-10" src={fourSeasonImg} alt=""/>
                <img className="w-16 md:w-20 md:h-20 h-16" src={ringNeckLogo} alt=""/>
            </div>
        </>
    )
}