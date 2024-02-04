// components/MoviePanel.js

import React,{useRef, forwardRef, useState, useImperativeHandle} from 'react';
import ImageCanvas from './ImageCanvas';
import VideoPlayer from './VideoPlayer';
import axios from "axios";
import { instanceSegmentationRouter, imageUploadRouter } from '../utils/router';

import IconBoudingBox from "../assets/icon/draw.svg";
import IconInsSegmentation from "../assets/icon/set.svg";
import IconCleanBoxes from "../assets/icon/clean.svg";
import IconStartCon from "../assets/icon/start.svg";
import IconScencesGraph from "../assets/icon/relation.svg";


const MoviePanel = forwardRef( (props, ref) => {
  const [showCanvas, setShowCanvas] = useState(false);
  const [screenShot, setScreenShot] = useState();
  //toggle show canvas
  function toggleShowCanvas() {
    setShowCanvas(!showCanvas);
  }


  // Placeholder content for the MoviePanel
  const imageCanvasRef = useRef();
  const videoRef = useRef();
  const callCleanBox = () => {
    if(imageCanvasRef.current){
      imageCanvasRef.current.cleanBoxes();
    }
  }

  function instanceSegmentation(){
    if(!screenShot){
      alert("Stop video to choose a video frame!");
      return;
    }

    setShowCanvas(true);
    axios.post(instanceSegmentationRouter, {
      image:screenShot,
    })
    .then((resp) => {
      console.log(resp);
      imageCanvasRef.current.setBoxes(resp.data.seg_info)
    })
    .catch((e) => {
      console.log(e);
    })
  }


  // upload image/start conversation
  function uploadImage(){
    axios.post(imageUploadRouter, {
      image:videoRef.current.captureScreenshot(),
    })
    .then((resp) => {
      console.log(resp);
      setScreenShot(videoRef.current.captureScreenshot());
    })
    .catch((e) => {
      console.log(e);
    })
  }

    ////////////////////////////////////  useImperativeHandle  ///////////////////////////////
    // foward to parent elements
    useImperativeHandle(ref, () => {
      return {
          captureScreenshot(){
            if(videoRef.current){
              return videoRef.current.captureScreenshot()
            }
            
          },
          addBox(x1, y1, wid, hei){
            if(imageCanvasRef.current){
              return imageCanvasRef.current.addBox(x1, y1, wid, hei);
            }
          },
      }
  }, [])

   

  return (
    <div className="movie-panel-container">
      {/* <h2>Video Panel</h2> */}
      <VideoPlayer 
        videoURL={props.videoURL} 
        showCanvas={showCanvas} 
        ref={videoRef}
        screenShot={screenShot}
        setScreenShot={setScreenShot}
        sceneGraph={props.sceneGraph}
        triggerSceneGraph={props.triggerSceneGraph}
      ></VideoPlayer>

      
      <div className='movie-btn-list'>
          <button className='movie-list-btn' onClick={toggleShowCanvas}>
            <div className='video-btn-text-container'>Bounding Box</div>
            <div className='video-btn-icon-container'>
              <img src={IconBoudingBox} alt="a icon for btn" className='video-btn-icon'></img>
            </div>
          </button>


          <button className='movie-list-btn' onClick={instanceSegmentation}>
          <div className='video-btn-text-container'>Instance Segmentation</div>
            <div className='video-btn-icon-container'>
              <img src={IconInsSegmentation} alt="a icon for btn" className='video-btn-icon'></img>
            </div>
          </button> 
    

   
          <button className='movie-list-btn' onClick={callCleanBox}>
            <div className='video-btn-text-container'>Clean Boxes</div>
            <div className='video-btn-icon-container'>
               <img src={IconCleanBoxes} alt="a icon for btn" className='video-btn-icon'></img>
            </div>
          </button>


          <button className='movie-list-btn' onClick={props.sceneGraph}>
            <div className='video-btn-text-container'>Scenes Graph</div>
            <div className='video-btn-icon-container'>
              <img src={IconScencesGraph} alt="a icon for btn" className='video-btn-icon'></img>
            </div>
          </button> 


          {/* <button className='movie-list-btn' onClick={uploadImage}>
            <div className='video-btn-text-container'>Start Conversation</div>
            <div className='video-btn-icon-container'>
              <img src={IconStartCon} alt="a icon for btn" className='video-btn-icon'></img>  
            </div>
          </button>  */}
      </div>
      {
        showCanvas ? <ImageCanvas ref={imageCanvasRef}></ImageCanvas> :""
      }

    
      
    </div>
  );
});

export default MoviePanel;
