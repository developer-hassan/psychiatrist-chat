import React, {useEffect, useState} from 'react';

export default function ConversationSummary({transcript}) {

    const BotMessage = ({ text }) => (
        <div className="flex">
            <div
                className="border-2 border-[#4169E1] px-[14px] py-[11px] rounded-2xl text-white max-w-[80%]">
                {text}
            </div>
        </div>
    );

    const HumanMessage = ({ text }) => (
        <div className="flex justify-end">
            <div
                className="bg-gradient-2 px-[15px] py-[12px] rounded-2xl text-white max-w-[80%]">
                {text}
            </div>
        </div>
    );

    return (
        <>
            <div className="w-full mx-auto px-6 sm:px-0 xl:w-[400px] max-w-[400px]">
                <h4 className="text-lg text-white text-center mb-3">Conversation</h4>
                <div
                    className="border-[3px] rounded-3xl border-[#4169E1] h-[500px] sm:h-[600px] p-6 sm:py-14 sm:px-6">
                    <div className="overflow-y-auto h-full pe-[8px] -me-[8px]">
                        <div className="space-y-4 flex flex-col">
                            {transcript?.map((message, index) => (
                                <div key={index}>
                                    {message.isBot ? (
                                        <BotMessage text={message.text} />
                                    ) : (
                                        <HumanMessage text={message.text} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}