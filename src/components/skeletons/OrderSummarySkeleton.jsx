import React, {useState} from 'react';
import Skeleton from "../common/Skeleton";
export default function OrderSummarySkeleton() {

    return (
        <>
            <div className="w-full px-6 sm:px-0 sm:w-[420px] max-w-[420px]">
                <h4 className="text-lg text-white text-center mb-3">Backend Management Signal</h4>
                <div
                    className="border-[3px] rounded-3xl border-[#4169E1] min-h-[500px] sm:min-h-[600px] flex flex-col justify-center p-6 sm:p-14">
                    <div
                        className="flex flex-col justify-center items-center rounded-2xl bg-slate-50 border-2 border-transparent animate-pulse pb-3 mb-8">
                        <div className="-mt-8 w-16 h-16 bg-slate-400 rounded-full mb-2"/>
                        <Skeleton className="text-white h-4 rounded-md bg-slate-400 w-5/12 mb-4"/>
                        <Skeleton className="text-white h-3 rounded-md bg-slate-400 w-7/12 mb-2"/>
                        <Skeleton className="text-white h-3 rounded-md bg-slate-400 w-7/12 mb-2"/>
                        <Skeleton className="text-white h-3 rounded-md bg-slate-400 w-5/12 mb-8"/>
                        <Skeleton className="text-white h-4 rounded-md bg-slate-400 w-5/12 mb-2"/>
                    </div>

                    <Skeleton className="rounded-full bg-gray-500 h-8 w-9/12 mx-auto"/>
                </div>
            </div>
        </>
    )
}