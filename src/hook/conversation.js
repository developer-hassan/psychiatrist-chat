import React, {useEffect, useState} from "react";
import {blobToBase64, stringify} from "../utils";
import {isSafari, isChrome, isIOS, isMacOs} from "react-device-detect";
import {Buffer} from "buffer";
import RecordRTC, {StereoAudioRecorder} from 'recordrtc';
import {
    MediaRecorder,
    register,
} from "extendable-media-recorder";
import {connect} from "extendable-media-recorder-wav-encoder";

const DEFAULT_CHUNK_SIZE = 2048;

export const useConversation = (config) => {
    const [audioContext, setAudioContext] = useState();
    const [audioAnalyser, setAudioAnalyser] = useState();
    const [audioStream, setAudioStream] = useState();
    const [audioQueue, setAudioQueue] = useState([]);
    const [currentSpeaker, setCurrentSpeaker] =
        useState("none");
    const [processing, setProcessing] = useState(false);
    const [recorder, setRecorder] = useState();
    const [socket, setSocket] = useState();
    const [status, setStatus] = useState("idle");
    const [error, setError] = useState();
    const [transcripts, setTranscripts] = useState([]);
    const [active, setActive] = useState(true);
    // const [audioBlobs, setAudioBlobs] = useState([]);
    // const [base64Strings, setBase64Strings] = useState([]);

    const toggleActive = () => setActive(!active);

    // get audio context and metadata about user audio
    useEffect(() => {
        const context = new AudioContext();
        setAudioContext(context);
        const analyser = context.createAnalyser();
        setAudioAnalyser(analyser);
    }, []);

    // attach encoder for windows, mac(chrome) and android to accept wav audio from webpage
    React.useEffect(() => {
        if (!isIOS && !(isMacOs && isSafari)) {
            const registerWav = async () => {
                await register(await connect());
            };
            registerWav().catch(console.error);
        }
    }, []);

    const recordingDataListener = (blob) => {
        // set blob data according to data coming from recorder ondataavailable callback
        // which calls 'recordingDataListener' function to get blob or blob event
        let data;
        if (isIOS || isSafari) {
            data = blob
        } else {
            data = blob.data
        }

        //send audio blob to socket
        // send each blob to socket when socket is open or ready
        // socket?.readyState === WebSocket.OPEN &&
        // socket.send(data);

        //Used for testing purpose
        // if (data.size > 0) {
        //     setAudioBlobs((blobs) => [...blobs, data]);
        // }

        // Convert each blob to base64
        blobToBase64(data).then((base64Encoded) => {
            if (!base64Encoded) return;
            const audioMessage = {
                type: "websocket_audio",
                data: base64Encoded,
            };

            // console.log("base64:", base64Encoded)

            // send each base64 blob to seocket when socket is open or ready
            socket?.readyState === WebSocket.OPEN &&
            socket.send(stringify(audioMessage));
        });
    };

    // Function to convert a Blob to a Base64 string
    // const blobToBase64 = (blob) => {
    //     return new Promise((resolve, reject) => {
    //         const reader = new FileReader();
    //         reader.onload = () => {
    //             const base64String = reader.result.split(',')[1];
    //             resolve(base64String);
    //         };
    //         reader.onerror = (error) => {
    //             reject(error);
    //         };
    //         reader.readAsDataURL(blob);
    //     });
    // };

    // Function to convert a Base64 string to a Blob
    // const base64ToBlob = (base64String, mimeType) => {
    //     const binaryString = atob(base64String);
    //     const byteNumbers = new Array(binaryString.length);
    //     for (let i = 0; i < binaryString.length; i++) {
    //         byteNumbers[i] = binaryString.charCodeAt(i);
    //     }
    //     const byteArray = new Uint8Array(byteNumbers);
    //     return new Blob([byteArray], {type: mimeType});
    // };

    // once the conversation is connected, stream the microphone audio into the socket
    // for android, windows and mac (chrome)
    React.useEffect(() => {
        if (!recorder || !socket) return;
        if (!isIOS && !(isMacOs && isSafari)) {
            if (status === "connected") {
                if (active)
                    recorder.addEventListener("dataavailable", recordingDataListener);
                else
                    recorder.removeEventListener("dataavailable", recordingDataListener);
            }
        }
    }, [recorder, socket, status, active]);

    useEffect(() => {
        if (status === 'connected') {

            // set recorder and recorder settings for ios and safari
            if (isIOS || isSafari) {
                const options = {
                    type: 'audio',
                    recorderType: StereoAudioRecorder,
                    // mimeType:'audio/webm',
                    numberOfAudioChannels: 1,
                    // leftChannel: true,
                    bufferSize: 512,
                    timeSlice: 10,
                    ondataavailable: function (blob) {
                        recordingDataListener(blob);
                    }
                };

                // create recorder instance
                const recorderToUse = new RecordRTC(audioStream, options);

                //set recorder
                setRecorder(recorderToUse);

                //start recording
                recorderToUse.startRecording();
            }
        }
    }, [status]);


    useEffect(() => {
        //Play audio coming from server
        const playArrayBuffer = (arrayBuffer) => {
            // decode audio data and make buffer source to play the audio
            audioContext &&
            audioAnalyser &&
            audioContext.decodeAudioData(arrayBuffer, (buffer) => {
                const source = audioContext.createBufferSource();
                source.buffer = buffer;
                source.connect(audioContext.destination);
                source.connect(audioAnalyser);
                setCurrentSpeaker("agent");

                //start playing the agent audio
                source.start(0);

                //set speaker to user when the audio queue is empty
                source.onended = () => {
                    if (audioQueue.length <= 0) {
                        setCurrentSpeaker("user");
                    }
                    setProcessing(false);
                };
            });
        };
        if (!processing && audioQueue.length > 0) {
            setProcessing(true);
            const audio = audioQueue.shift();
            audio &&
            fetch(URL.createObjectURL(new Blob([audio])))
                .then((response) => response.arrayBuffer())
                .then(playArrayBuffer);
        }
    }, [audioQueue, processing]);

    const stopConversation = (error) => {
        setAudioQueue([]);
        setCurrentSpeaker("none");
        if (error) {
            setError(error);
            setStatus("error");
        } else {
            setStatus("idle");
        }
        if (!recorder || !socket) return;


        // stop conversation for ios and safari
        if (isIOS || isSafari) {
            recorder.stopRecording(async function () {
                // const blob = recorder.getBlob();

                // const base64Promises = audioBlobs.map((blob) => blobToBase64(blob));
                //
                // try {
                //     const base64Results = await Promise.all(base64Promises);
                //     setBase64Strings(base64Results);
                //
                //     const blobs = base64Results.map((base64String) =>
                //         base64ToBlob(base64String, 'audio/wav')
                //     );
                //
                //     const combinedBlob = new Blob(blobs, {type: 'audio/wav'});
                //     createDownloadLink(combinedBlob);
                //
                //
                // } catch (error) {
                //     console.error('Error converting Blobs to Base64:', error);
                // }

                // const combinedBlob = new Blob(audioBlobs, { type: 'audio/webm' });
                // createDownloadLink(combinedBlob);

                // createDownloadLink(blob);
            });
        } else {
            //stop conversation for mac chrome, android chrome,windows chrome
            recorder.stop();
        }

        // send message to server to stop the websocket
        const stopMessage = {
            type: "websocket_stop",
        };

        socket.send(stringify(stopMessage));

        //close websocket form frontend
        socket.close();
    };

    //Download the conversation audio for testing purpose only
    const createDownloadLink = (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'recorded-audio.wav';
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
    }


    // Get backend url for websocket connection from config,
    // which is passed to conversation hook in 'ConversationRecorder.jsx'
    const getBackendUrl = async () => {
        if ("backendUrl" in config) {
            return config.backendUrl;
        } else {
            throw new Error("Invalid config");
        }
    };


    // Get start message config and use it for socket start connection
    const getStartMessage = (config, inputAudioMetadata, outputAudioMetadata) => {
        let transcriberConfig = Object.assign(
            config.transcriberConfig,
            inputAudioMetadata
        );
        if (isSafari && transcriberConfig.type === "transcriber_deepgram") {
            transcriberConfig.downsampling = 2;
        }

        return {
            type: "websocket_start",
            transcriberConfig: Object.assign(
                config.transcriberConfig,
                inputAudioMetadata
            ),
            agentConfig: config.agentConfig,
            synthesizerConfig: Object.assign(
                config.synthesizerConfig,
                outputAudioMetadata
            ),
            conversationId: config.vocodeConfig.conversationId,
        };
    };

    //Audio get config audio
    const getAudioConfigStartMessage = (
        inputAudioMetadata,
        outputAudioMetadata,
        chunkSize,
        downsampling,
        conversationId,
        subscribeTranscript
    ) => ({
        type: "websocket_audio_config_start",
        inputAudioConfig: {
            samplingRate: inputAudioMetadata.samplingRate,
            audioEncoding: inputAudioMetadata.audioEncoding,
            chunkSize: chunkSize || DEFAULT_CHUNK_SIZE,
            downsampling,
        },
        outputAudioConfig: {
            samplingRate: outputAudioMetadata.samplingRate,
            audioEncoding: outputAudioMetadata.audioEncoding,
        },
        conversationId,
        subscribeTranscript,
    });

    const startConversation = async () => {
        if (!audioContext || !audioAnalyser) return;
        setStatus("connecting");

        // if (!isSafari && !isChrome) {
        //     stopConversation(new Error("Unsupported browser"));
        //     return;
        // }

        //resume audio context suspended due to some restriction or security reason
        if (audioContext.state === "suspended") {
            audioContext.resume();
        }

        const backendUrl = await getBackendUrl();
        setError(undefined);

        // Make websocket instance
        const socket = new WebSocket(backendUrl);

        // Bind error event on socket for socket connection error
        let error;
        socket.onerror = (event) => {
            console.error(event);
            error = new Error("See console for error details");
        };

        // Listen for different type of messages from socket
        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);

            // For incoming audio from the socket
            if (message.type === "websocket_audio") {
                setAudioQueue((prev) => [...prev, Buffer.from(message.data, "base64")]);

                // For socket connection ready
            } else if (message.type === "websocket_ready") {
                setStatus("connected");
                console.log("websocket connected");

                // For conversation transcript text
            } else if (message.type === "websocket_transcript") {
                setTranscripts((prev) => {
                    let last = prev.pop();
                    if (last && last.sender === message.sender) {
                        prev.push({
                            sender: message.sender,
                            text: last.text + " " + message.text,
                        });
                    } else {
                        if (last) {
                            prev.push(last);
                        }
                        prev.push({
                            sender: message.sender,
                            text: message.text,
                        });
                    }
                    return prev;
                });
            }
        };

        // Listen for socket close and stop the conversation accordingly
        socket.onclose = () => {
            stopConversation(error);
        };

        // set the socket created to socket variable to use it in different functions
        setSocket(socket);

        // wait for socket to be ready
        await new Promise((resolve) => {
            const interval = setInterval(() => {
                if (socket.readyState === WebSocket.OPEN) {
                    clearInterval(interval);
                    resolve(null);
                }
            }, 100);
        });

        // Get mic access for audio stream
        let stream;
        try {

            stream = await navigator.mediaDevices.getUserMedia({
                audio: {echoCancellation: true},
            });

            setAudioStream(stream)
        } catch (error) {
            if (error instanceof DOMException && error.name === "NotAllowedError") {
                alert(
                    "Allowlist this site at chrome://settings/content/microphone to talk to the bot."
                );
                error = new Error("Microphone access denied");
            }
            console.error(error);
            stopConversation(error);
            return;
        }

        // Get mic settings when mic access is given
        const micSettings = stream.getAudioTracks()[0].getSettings();
        console.log(micSettings);

        // Set input audio config, will be used for start message config
        const inputAudioMetadata = {
            samplingRate: micSettings.sampleRate || audioContext.sampleRate,
            audioEncoding: "linear16",
        };
        console.log("Input audio metadata", inputAudioMetadata);

        // Set output audio config, will be used for start message config
        const outputAudioMetadata = {
            samplingRate:
                config.audioDeviceConfig.outputSamplingRate || audioContext.sampleRate,
            audioEncoding: "linear16",
        };
        console.log("Output audio metadata", inputAudioMetadata);


        // Get start message config
        let startMessage;
        if (
            [
                "transcriberConfig",
                "agentConfig",
                "synthesizerConfig",
                "vocodeConfig",
            ].every((key) => key in config)
        ) {
            startMessage = getStartMessage(
                config,
                inputAudioMetadata,
                outputAudioMetadata
            );
        } else {
            const selfHostedConversationConfig =
                config;
            startMessage = getAudioConfigStartMessage(
                inputAudioMetadata,
                outputAudioMetadata,
                selfHostedConversationConfig.chunkSize,
                selfHostedConversationConfig.downsampling,
                selfHostedConversationConfig.conversationId,
                selfHostedConversationConfig.subscribeTranscript
            );
        }

        // send start message config to socket
        socket.send(stringify(startMessage));
        console.log("Access to microphone granted");
        console.log(startMessage);

        //set recorder settings for windows chrome,mac(chrome), android chrome
        if (!isIOS && !(isMacOs && isSafari)) {
            let recorderToUse = recorder;
            if (recorderToUse && recorderToUse.state === "paused") {
                recorderToUse.resume();
            } else if (!recorderToUse) {
                recorderToUse = new MediaRecorder(stream, {
                    mimeType: "audio/wav",
                });
                setRecorder(recorderToUse);
            }

            // set time after which the each audio chunk will be sent to socket

            let timeSlice;
            //time slice from startmessage if transcriberConfig is passed in config passed to conversation hook
            if ("transcriberConfig" in startMessage) {
                timeSlice = Math.round(
                    (1000 * startMessage.transcriberConfig.chunkSize) /
                    startMessage.transcriberConfig.samplingRate
                );

                //time slice from config if it's set in config passed to conversation hook
            } else if ("timeSlice" in config) {
                timeSlice = config.timeSlice;
            } else {

                // Default time is 10ms
                timeSlice = 100;
            }

            if (recorderToUse.state === "recording") {
                // When the recorder is in the recording state, see:
                // https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/state
                // which is not expected to call `start()` according to:
                // https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/start.
                return;
            }

            // start recording for windows,mac(chrome) and android
            recorderToUse.start(timeSlice);
        }
    };

    return {
        status,
        start: startConversation,
        stop: stopConversation,
        error,
        toggleActive,
        active,
        setActive,
        analyserNode: audioAnalyser,
        transcripts,
        currentSpeaker,
    };
};
