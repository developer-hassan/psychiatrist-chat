import {
    IMediaRecorder,
    MediaRecorder,
    register,
} from "extendable-media-recorder";
import {connect} from "extendable-media-recorder-wav-encoder";
import React, {useState} from "react";
import {blobToBase64, stringify} from "../utils";
import {isSafari, isChrome} from "react-device-detect";
import {Buffer} from "buffer";

const VOCODE_API_URL = "api.vocode.dev";
const DEFAULT_CHUNK_SIZE = 2048;

export const useConversation = (config) => {
    const [audioContext, setAudioContext] = useState();
    const [audioAnalyser, setAudioAnalyser] = useState();
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
    const toggleActive = () => setActive(!active);

    // get audio context and metadata about user audio
    React.useEffect(() => {
        const context = new AudioContext();
        setAudioContext(context);
        const analyser = context.createAnalyser();
        setAudioAnalyser(analyser);
    }, []);

    const recordingDataListener = (data) => {
        blobToBase64(data).then((base64Encoded) => {
            if (!base64Encoded) return;
            const audioMessage = {
                type: "websocket_audio",
                data: base64Encoded,
            };
            socket?.readyState === WebSocket.OPEN &&
            socket.send(stringify(audioMessage));
        });
    };

    // once the conversation is connected, stream the microphone audio into the socket
    React.useEffect(() => {
        if (!recorder || !socket) return;
        if (status === "connected") {
            if (active)
                recorder.addEventListener("dataavailable", recordingDataListener);
            else
                recorder.removeEventListener("dataavailable", recordingDataListener);
        }
    }, [recorder, socket, status, active]);

    // accept wav audio from webpage
    React.useEffect(() => {
        const registerWav = async () => {
            await register(await connect());
        };
        registerWav().catch(console.error);
    }, []);

    // play audio that is queued
    React.useEffect(() => {
        const playArrayBuffer = (arrayBuffer) => {
            audioContext &&
            audioAnalyser &&
            audioContext.decodeAudioData(arrayBuffer, (buffer) => {
                const source = audioContext.createBufferSource();
                source.buffer = buffer;
                source.connect(audioContext.destination);
                source.connect(audioAnalyser);
                setCurrentSpeaker("agent");
                source.start(0);
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
        recorder.stop();
        const stopMessage = {
            type: "websocket_stop",
        };
        socket.send(stringify(stopMessage));
        socket.close();
    };

    const getBackendUrl = async () => {
        if ("backendUrl" in config) {
            return config.backendUrl;
        } else if ("vocodeConfig" in config) {
            const baseUrl = config.vocodeConfig.baseUrl || VOCODE_API_URL;
            return `wss://${baseUrl}/conversation?key=${config.vocodeConfig.apiKey}`;
        } else {
            throw new Error("Invalid config");
        }
    };

    const getStartMessage = (config, inputAudioMetadata, outputAudioMetadata) => {
        let transcriberConfig = Object.assign(
            config.transcriberConfig,
            inputAudioMetadata
        );
        if (isSafari && transcriberConfig.type === "transcriber_deepgram") {
            (transcriberConfig as DeepgramTranscriberConfig).downsampling = 2;
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

        if (!isSafari && !isChrome) {
            stopConversation(new Error("Unsupported browser"));
            return;
        }

        if (audioContext.state === "suspended") {
            audioContext.resume();
        }

        const backendUrl = await getBackendUrl();

        setError(undefined);
        const socket = new WebSocket(backendUrl);
        let error;
        socket.onerror = (event) => {
            console.error(event);
            error = new Error("See console for error details");
        };
        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === "websocket_audio") {
                setAudioQueue((prev) => [...prev, Buffer.from(message.data, "base64")]);
            } else if (message.type === "websocket_ready") {
                setStatus("connected");
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
        socket.onclose = () => {
            stopConversation(error);
        };
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

        let audioStream;
        try {
            const trackConstraints = {
                echoCancellation: true,
            };
            if (config.audioDeviceConfig.inputDeviceId) {
                console.log(
                    "Using input device",
                    config.audioDeviceConfig.inputDeviceId
                );
                trackConstraints.deviceId = config.audioDeviceConfig.inputDeviceId;
            }
            audioStream = await navigator.mediaDevices.getUserMedia({
                video: false,
                audio: trackConstraints,
            });
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
        const micSettings = audioStream.getAudioTracks()[0].getSettings();
        console.log(micSettings);
        const inputAudioMetadata = {
            samplingRate: micSettings.sampleRate || audioContext.sampleRate,
            audioEncoding: "linear16" as AudioEncoding,
        };
        console.log("Input audio metadata", inputAudioMetadata);

        const outputAudioMetadata = {
            samplingRate:
                config.audioDeviceConfig.outputSamplingRate || audioContext.sampleRate,
            audioEncoding: "linear16",
        };
        console.log("Output audio metadata", inputAudioMetadata);

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
                config as ConversationConfig,
                inputAudioMetadata,
                outputAudioMetadata
            );
        } else {
            const selfHostedConversationConfig =
                config as SelfHostedConversationConfig;
            startMessage = getAudioConfigStartMessage(
                inputAudioMetadata,
                outputAudioMetadata,
                selfHostedConversationConfig.chunkSize,
                selfHostedConversationConfig.downsampling,
                selfHostedConversationConfig.conversationId,
                selfHostedConversationConfig.subscribeTranscript
            );
        }

        socket.send(stringify(startMessage));
        console.log("Access to microphone granted");
        console.log(startMessage);

        let recorderToUse = recorder;
        if (recorderToUse && recorderToUse.state === "paused") {
            recorderToUse.resume();
        } else if (!recorderToUse) {
            recorderToUse = new MediaRecorder(audioStream, {
                mimeType: "audio/wav",
            });
            setRecorder(recorderToUse);
        }

        let timeSlice;
        if ("transcriberConfig" in startMessage) {
            timeSlice = Math.round(
                (1000 * startMessage.transcriberConfig.chunkSize) /
                startMessage.transcriberConfig.samplingRate
            );
        } else if ("timeSlice" in config) {
            timeSlice = config.timeSlice;
        } else {
            timeSlice = 10;
        }

        if (recorderToUse.state === "recording") {
            return;
        }
        recorderToUse.start(timeSlice);
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