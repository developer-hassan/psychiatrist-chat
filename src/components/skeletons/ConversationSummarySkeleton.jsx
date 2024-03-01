import React, {useState} from 'react';
import Skeleton from "../common/Skeleton";
export default function ConversationSummarySkeleton() {

    return (
        <>
            <div className="w-full px-6 sm:px-0 sm:w-[420px] max-w-[420px]">
                <h4 className="text-lg text-white text-center mb-3">Conversation</h4>
                <div
                    className="border-[3px] rounded-3xl border-[#4169E1] h-[500px] [500px] sm:h-[600px] p-6 sm:py-14 sm:px-6">
                    <div className="overflow-y-auto h-full pe-[8px] -me-[8px]">
                        <div className="space-y-4 flex flex-col">
                            <div className="flex">
                                <Skeleton className="px-[14px] h-11 py-[11px] rounded-2xl bg-slate-400 w-10/12"/>
                            </div>
                            <div className="flex justify-end">
                                <Skeleton className="px-[14px] h-11 py-[11px] rounded-2xl bg-slate-400 w-7/12"/>
                            </div>
                            <div className="flex">
                                <Skeleton className="px-[14px] h-11 py-[11px] rounded-2xl bg-slate-400 w-6/12"/>
                            </div>
                            <div className="flex justify-end">
                                <Skeleton className="px-[14px] h-11 py-[11px] rounded-2xl bg-slate-400 w-9/12"/>
                            </div>
                            <div className="flex">
                                <Skeleton className="px-[14px] h-11 py-[11px] rounded-2xl bg-slate-400 w-5/12"/>
                            </div>
                            <div className="flex justify-end">
                                <Skeleton className="px-[14px] h-11 py-[11px] rounded-2xl bg-slate-400 w-8/12"/>
                            </div>
                            <div className="flex">
                                <Skeleton className="px-[14px] h-11 py-[11px] rounded-2xl bg-slate-400 w-10/12"/>
                            </div>
                            <div className="flex justify-end">
                                <Skeleton className="px-[14px] h-11 py-[11px] rounded-2xl bg-slate-400 w-7/12"/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}