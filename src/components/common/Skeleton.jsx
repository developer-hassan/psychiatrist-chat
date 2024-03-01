import React from 'react';


export default function Skeleton({className}) {

    return (
        <>
            <div className={`bg-slate-200 animate-pulse ${className}`}/>
        </>
    )
}