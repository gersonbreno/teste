'use client'

import { ReactNode, RefObject, createContext, useEffect, useRef, useState } from "react";
import videos, { Video } from "../data/video";

type HomeContextData = {
    videoURL: string;
    playing: boolean;
    totalTime: number;
    currentTime: number;
    videoRef: RefObject<HTMLVideoElement>;
    playPause: () => void;
    configCurrentTime: (time:number) => void;
    configVideo: (index: number) => void;
    volume: number; 
    changeVolume: (volume: number) => void;
    videos: Video[]; // Adicionando a lista de vídeos ao contexto
    muted: Boolean; // Adicionando o estado de mudo ao contexto
    toggleMute: () => void; 
    unMute: () => void;
    playNextVideo: () => void; // Adicionando a função playNextVideo
    playPreviousVideo: () => void; 
}

export const HomeContext =
   createContext({} as HomeContextData);

type ProviderProps = {
    children: ReactNode;    
}

const HomeContextProvider = ({children}: ProviderProps) => {
    const [videoURL, setVideoURL] = useState("");
    const [videoIndex, setVideoIndex] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [totalTime, setTotalTime] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [volume, setVolume] = useState(1); // Estado para o volume do vídeo
    const [muted, setMuted] = useState(false);

    useEffect(()=>{
        configVideo(videoIndex);
    }, []);

    const configVideo = (index: number) => {
        const currentIndex = index % videos.length;
        const currentVideo: Video = videos[currentIndex];
        const currentVideoURL = currentVideo.videoURL;
        setVideoURL(currentVideoURL);
        setVideoIndex(currentIndex);
    }

    useEffect(() => {
        const video = videoRef.current;
        if (video) {
            video.onloadedmetadata = () => {
                setTotalTime(video.duration);
                setCurrentTime(video.currentTime);
    
                if (playing) {
                    video.play();
                }
            }
    
            video.onended = () => {
                configVideo(videoIndex + 1);
            }
            // Atualiza o estado do volume quando o volume do vídeo for alterado
            video.onvolumechange = () => {
                setVolume(video.volume);
            }
    
            // Atualiza o valor da barra de progresso conforme o tempo atual do vídeo
            const updateProgressBar = () => {
                if (video.duration) {
                    setCurrentTime(video.currentTime);
                }
            };
    
            video.addEventListener("timeupdate", updateProgressBar);
    
            return () => {
                video.removeEventListener("timeupdate", updateProgressBar);
            };
        }
    }, [videoURL, playing]);
    

    const configCurrentTime = (time: number) => {
        const video = videoRef.current;
        if (!video) return;
    
        // Define o tempo atual do vídeo para o valor selecionado
        video.currentTime = time;
        setCurrentTime(time);
    
        // Se o vídeo estiver em reprodução, continue a reprodução
        if (playing) {
            video.play();
        }
    }

    const playPause = ()  => {
        const video = videoRef.current;
        if (!video) return;

        if (playing) {
           video.pause();     
        }
        else {
            video.play();
        }
        setPlaying(!playing);
    }
    const changeVolume = (newVolume: number) => {
        const video = videoRef.current;
        if (!video) return;
        
        // Garantir que o volume esteja entre 0 e 1
        const clampedVolume = Math.max(0, Math.min(1, newVolume));
        
        // Configurar o volume do vídeo
        video.volume = clampedVolume;
        
        // Atualizar o estado `volume` com o novo valor
       
        console.log("Volume ajustado:", clampedVolume);
        setVolume(clampedVolume);
       
    }
    const toggleMute = () => {
        const video = videoRef.current;
        if (!video) return;

        video.muted = !video.muted;
        setMuted(video.muted);
    }
    const unMute = () => {
        const video = videoRef.current;
        if (!video) return;
    
        video.muted = false;
        setMuted(false);
    }
    const playNextVideo = () => {
        configVideo(videoIndex + 1);
    }

    const playPreviousVideo = () => {
        configVideo(videoIndex - 1 < 0 ? videos.length - 1 : videoIndex - 1);
    }
    return (
        <HomeContext.Provider value={
            {
                videoURL,
                playing,
                totalTime,
                currentTime,
                videoRef,
                playPause,
                configCurrentTime,
                configVideo,
                changeVolume,
                videos, // Passando a lista de vídeos para o contexto
                muted,
                toggleMute,
                unMute,
                  volume,
                  playNextVideo,
                playPreviousVideo,
            }
        }>
         {children}
        </HomeContext.Provider>
    )
}

export default HomeContextProvider;
