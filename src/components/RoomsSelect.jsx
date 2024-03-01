import {Fragment, useEffect, useState} from 'react';
import {Combobox, Transition} from '@headlessui/react';
import {CheckIcon, ChevronUpDownIcon} from '@heroicons/react/20/solid';
import {useDispatch, useSelector} from "react-redux";
import {setSelectedRoom} from "../store/home/homeSlice";

export default function RoomsSelect() {
    const [selected, setSelected] = useState(null);
    const [query, setQuery] = useState('');
    const {rooms} = useSelector((state) => state.home);
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(setSelectedRoom(selected));
    }, [dispatch, selected]);

    const filteredRooms =
        query === ''
            ? rooms
            : rooms.filter((room) =>
                room.room_no
                    .toLowerCase()
                    .replace(/\s+/g, '')
                    .includes(query.toLowerCase().replace(/\s+/g, ''))
            );

    return (
        <Combobox value={selected} onChange={setSelected}>
            <div className="relative">
                <div
                    className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
                    <Combobox.Input
                        className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                        displayValue={(room) => room ? room.room_no : "Select room..."}
                        onChange={(event) => setQuery(event.target.value)}
                    />
                    <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronUpDownIcon
                            className="h-5 w-5 text-gray-400"
                            aria-hidden="true"
                        />
                    </Combobox.Button>
                </div>
                <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                    afterLeave={() => setQuery('')}
                >
                    <Combobox.Options
                        className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                        {filteredRooms.length === 0 && query !== '' ? (
                            <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                                Nothing found.
                            </div>
                        ) : (
                            filteredRooms.map((room) => (
                                <Combobox.Option
                                    key={room.id}
                                    className={({active}) =>
                                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                            active ? 'bg-[#4169E1] text-white' : 'text-gray-900'
                                        }`
                                    }
                                    value={room}
                                >
                                    {({selected, active}) => (
                                        <>
                        <span
                            className={`block truncate ${
                                selected ? 'font-medium' : 'font-normal'
                            }`}
                        >
                          {room.room_no}
                        </span>
                                            {selected ? (
                                                <span
                                                    className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                                        active ? 'text-white' : 'text-teal-600'
                                                    }`}
                                                >
                            <CheckIcon className="h-5 w-5" aria-hidden="true"/>
                          </span>
                                            ) : null}
                                        </>
                                    )}
                                </Combobox.Option>
                            ))
                        )}
                    </Combobox.Options>
                </Transition>
            </div>
        </Combobox>
    );
}
