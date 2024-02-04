import React,{useState, useEffect, useRef, forwardRef, useImperativeHandle} from 'react';
import ReactPlayer from 'react-player'
import "../assets/css/video.css";
import { formatTime } from '../utils/utils';

//icons
import IconStop from "../assets/icon/stop.svg";
import IconContinue from "../assets/icon/continue.svg";
import IconSpeed from "../assets/icon/playback speed.svg";
import IconFullScreen from "../assets/icon/full-screen.svg";

// material ui items
import { createTheme } from '@mui/material/styles';
import { Button } from '@mui/material';
import Stack from '@mui/material/Stack';
import Slider from '@mui/material/Slider';
import VolumeDown from '@mui/icons-material/VolumeDown';
import VolumeOff from '@mui/icons-material/VolumeOff';
import VolumeUp from '@mui/icons-material/VolumeUp';
import ButtonGroup from '@mui/material/ButtonGroup';
import Box from '@mui/material/Box';


const VideoPlayer= forwardRef((props, ref) => {
    const playerRef = useRef(null);
    const playerContainerRef = useRef(null);

    const [duration, setDuration] = useState(0);
    const [played, setPlayed] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [showSpeedOptions, setShowSpeedOptions] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [volume, setVolume] = useState(0.5);
    const [originVolume, setOriginVolume] = useState(0.5);
    const [isFullScreen, setIsFullScreen] = useState(false);


    ////////////////////   scene graph every certain time  ////////////////////////
    // useEffect(() => {
    //     let interval = null;

    //     if (playing) {
    //         interval = setInterval(() => {
    //             console.log('Triggered scene graph');
    //             // Your custom function call here
    //             props.triggerSceneGraph();
    //         }, 3000);
    //     } else if (!playing && interval) {
    //         clearInterval(interval);
    //     }

    //     return () => clearInterval(interval);
    // }, [playing]);



    const theme = createTheme({
        palette: {
            primary: {main: '#6495ed'},
            // secondary: pink,    EA80FC
          },
      });
    ////////////////////////////////////  progress bar /////////////////////////
    // load total length of vidoe
    const handleDuration = (duration) => {
      setDuration(duration);
    };  

    // load current played seconds
    const handleOnProgress = (data) => {
        // console.log(data)
        setPlayed(data.playedSeconds)
    }

    // move video on slider bar change
    const handleSliderChange = (event, newValue) => {
        setPlayed(newValue);
        if (playerRef.current) {
            playerRef.current.seekTo(newValue);
        }
    };
    // stop/play
    const togglePlayPause = () => {
        if(playing){
            setPlaying(false);
            props.setScreenShot(captureScreenshot());
        }else{
            setPlaying(true);
            props.setScreenShot();
        }
       
    };

    //////////////////////////////////// volume  /////////////////////////
    const handleVolumeChange = (event, newValue) => {
        setVolume(newValue);
        setOriginVolume(originVolume);
        // console.log(volume)
    }

    const toggleVolumeMute = (e) => {
        if(volume){
            setVolume(0);
        }else{
            setVolume(originVolume);
        }
    }

    const toggleVolumeUp = (e) => {
        if(volume < 1){
            setVolume(Math.min(1, volume + 0.1));
        }
    }


    ////////////////////////////////////  playback speed /////////////////////////
    // change playback speed
    //Only supported by YouTube, Wistia, and file paths!!!!!!!
    const buttons = [
        <Button key="1" theme={theme} id="playback-speed-0.5" onClick={setPlayBackSpeed}>0.5x</Button>,
        <Button key="2" theme={theme} id="playback-speed-0.75" onClick={setPlayBackSpeed}>0.75x</Button>,
        <Button key="3" theme={theme} id="playback-speed-1" onClick={setPlayBackSpeed}>1x</Button>,
        <Button key="4" theme={theme} id="playback-speed-1.5" onClick={setPlayBackSpeed}>1.5x</Button>,
        <Button key="5" theme={theme} id="playback-speed-2" onClick={setPlayBackSpeed}>2x</Button>,
    ];
    function toggleShowSpeedOptions(e){
        e.preventDefault();
        setShowSpeedOptions(!showSpeedOptions);
    }
    function setPlayBackSpeed(e){
        e.preventDefault();
        let speed = parseFloat(e.target.id.substring(15));
        setPlaybackRate(speed);
        console.log(playbackRate);
        toggleShowSpeedOptions(e);
    }


    ////////////////////////////////////  screen shot /////////////////////////
    //get screenshot
    const captureScreenshot = () => {
        if (playerRef.current) {
            // Try to access the video element directly
            const videoElement = playerRef.current.getInternalPlayer('player');
    
            // Make sure it's a video element
            if (videoElement && videoElement.tagName === 'VIDEO') {
                const canvas = document.createElement('canvas');
                canvas.width = videoElement.videoWidth;
                canvas.height = videoElement.videoHeight;
    
                const ctx = canvas.getContext('2d');
                ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    
                const image = canvas.toDataURL('image/png');
                return image;
                // downloadImage(image, 'screenshot.png');
            } else {
                console.error('Unable to access video element');
            }
        }
    };
    
    ////////////////////////////////////  useImperativeHandle  ///////////////////////////////
    // foward to parent elements
    useImperativeHandle(ref, () => {
        return {
            pauseVideo(){
                setPlaying(false);
            },
            captureScreenshot,
        }
    }, [])


    
    ////////////////////////////////////  full screen   ///////////////////////////////
    //////////////////////////////////// full screen operations  //////////////////////////
    const handleToggleFullscreen = () => {
        console.log(isFullScreen);
        if (playerContainerRef.current) {
        if (!document.fullscreenElement) {
            playerContainerRef.current.requestFullscreen()
            .then(() => setIsFullScreen(true))
            .catch(err => {
            console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
            
        } else {
            
            document.exitFullscreen().then(() => setIsFullScreen(false));
            
        }
        }
    };

      // Listen for fullscreen change events
    document.addEventListener('fullscreenchange', () => {
        setIsFullScreen(!!document.fullscreenElement);
    });

    

    return (
        <div className={`video-player video-player-full-${isFullScreen}`} id="video-player" ref={playerContainerRef} >
            <div className='react-player-container'>
                <ReactPlayer 
                // url={'https://www.youtube.com/watch?v=d46Azg3Pm4c'}
                ref={playerRef}
                url={props.videoURL}
                onDuration={handleDuration}
                onProgress={handleOnProgress}
                playing={playing}
                volume={volume}
                playbackRate={playbackRate}
                width="100%"
                height="100%"
                />
            </div>

            <div className='progress-bar-container'>
                <Slider 
                        
                        id="video-progress-bar"
                        defaultValue={0} 
                        max={duration}                         
                        aria-label="Default" 
                        value={played} 
                        onChange={handleSliderChange}
                        valueLabelDisplay="auto"
                        theme={theme}
                        playbackRate={playbackRate}
                />
            </div>


            <div className='video-player-menu'>
                <Button variant="contained"  onClick={togglePlayPause} theme={theme}>
                    {
                        playing ?                     
                        <img src={IconStop} alt="btn stop icon" className='icon-stop video-control-btn-icon'></img>
                        :
                        <img src={IconContinue} alt="btn stop continue" className='video-control-btn-icon'></img>
                    }
                </Button>
                <Stack id="video-volume" spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
                    {
                        volume === 0 ?
                        <VolumeOff onClick={toggleVolumeMute} className='video-volume-icon'/>
                        :
                        <VolumeDown onClick={toggleVolumeMute} className='video-volume-icon'/>
                    }
                    <Slider id="video-volume-slider" aria-label="Volume" min={0} max={1} step={0.01} value={volume} theme={theme} onChange={handleVolumeChange}/>
                    <VolumeUp onClick={toggleVolumeUp} className='video-volume-icon'/>
                </Stack>
                
                <div id="video-time">
                    <span id="video-time-span video-time-current">{formatTime(played)}</span>
                    <span id="video-time-span">/</span>
                    <span id="video-time-span video-time-total">{formatTime(duration)}</span>
                </div>
                
                <div id='video-speed-container'>
                    <Button id="video-speed" variant="contained"  onClick={toggleShowSpeedOptions} theme={theme}>
                        <img src={IconSpeed} alt="icon for video playback speed" className='video-control-btn-icon'></img>
                    </Button>
                    
                    <Box id="video-speed-options" sx={{display: 'flex','& > *': {m: 1,},}}>
                        {showSpeedOptions && 
                            <ButtonGroup orientation="vertical" aria-label="vertical outlined button group" variant="contained" theme={theme}>
                               {buttons}
                           </ButtonGroup>
                        }
                    </Box>
                </div>

                
                <Button variant="contained"  onClick={handleToggleFullscreen} theme={theme}>
                    <img src={IconFullScreen} alt="icon for playing video in full screen" className='video-control-btn-icon'></img>
                </Button>
            </div>
        </div>
        
    );
})

export default VideoPlayer;