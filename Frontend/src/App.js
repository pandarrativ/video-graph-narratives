// App.js

import React, { useRef, useState } from 'react';
import './App.css';
import "./assets/css/graphPanel.css";
import axios from 'axios';
import { sceneGraphRouter, videoUploadRouter } from './utils/router';

import ChatBox from './components/ChatBox';
import MoviePanel from './components/MoviePanel';


import videoIcon from "./assets/icon/video.svg";
import chatIcon from "./assets/icon/chat.svg";
import uploadIcon from "./assets/icon/upload.svg";
import BoxCut from "./assets/icon/cut-box.svg";
import BackPosition from "./assets/icon/position.svg";


import Xarrow, {Xwrapper} from 'react-xarrows';
import SceneBox from './components/SceneBox';
import { scenePositions } from './utils/scenePositions';

const App = () => {
  const moviePanelRef = useRef();
  const [videoURL, setVideoURL] = useState();
  const [imageSrc, setImageSrc] = useState('');


  const handleOnVideoUpload = (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    setVideoURL(URL.createObjectURL(file));
    console.log(URL.createObjectURL(file))

    axios.post(videoUploadRouter, formData, {
      headers: {
          'Content-Type': 'multipart/form-data',
      }
    }).then((resp) => {
    console.log(resp);
   }).catch((e) => console.log(e));
  
  }

  const captureScreenshot = () => {
    if(moviePanelRef.current){
      return moviePanelRef.current.captureScreenshot();
    }
  }



  ////////////////////////////  scene Graph  ////////////////////////////////
  const [sceneGraphData, setSceneGraphData] = useState();
  // const [objectList, setObjectList] = useState([]);
  const [usedPositions, setUsedPositions] = useState(new Map());
  const [resetKey, setResetKey] = useState(0);  
  const [isDragDisabled, setIsDragDisabled] = useState(false);

  const sceneGraph = (e) => {
    e.preventDefault();
    axios.post(sceneGraphRouter, {
      image:captureScreenshot(),
    })
    .then((resp) => {
      let respData = JSON.parse(resp.data.data);
      // check if length exceeds
      if(respData.objects.length > scenePositions.length){
        alert("Too Many objects detected!")
        return;
      }


      let newObjectPositions = new Map();
      let positionSet = new Set();

      // first round, set position and colors
      for(let i=0; i<respData.objects.length; i++){
        const theName = respData.objects[i].name;
        if(usedPositions.has(theName)){
          respData.objects[i].color = "white";
          
          let originalPosition = usedPositions.get(theName);
          newObjectPositions.set(theName, originalPosition);
          respData.objects[i].position = originalPosition;
          positionSet.add(originalPosition);
        }else{
          respData.objects[i].color = "yellow";
        }
        // newObjectList.push(respData.objects[i].name);
      }
      // second round, allocate positions to new objects 
      for(let i=0; i<respData.objects.length; i++){
        const theName = respData.objects[i].name;
        if(!newObjectPositions.has(theName)){
          // get the first available position
          for(let i=0; i<scenePositions.length; i++){
            if(!positionSet.has(i)){
              positionSet.add(i);
              newObjectPositions.set(theName, i);
              respData.objects[i].position = i;
              break;
            }
          }
        }
      }


      console.log(respData);
      console.log(newObjectPositions);
      setSceneGraphData(respData);
      setUsedPositions(newObjectPositions);

      // setObjectList(newObjectList);
    })
    .catch((e) => {
      console.log(e);
      alert(e.response.data);
    })
  }

  // used for auto sceneGraph
  // const triggerSceneGraph = () => {
  //   axios.post(sceneGraphRouter, {
  //     image:captureScreenshot(),
  //   })
  //   .then((resp) => {
  //     let respData = JSON.parse(resp.data.data);
  //     let newObjectList = [];
  //     console.log(respData);
  //     for(let i=0; i<respData.objects.length; i++){
  //       console.log(respData.objects[i].name);
  //       if(objectList.includes(respData.objects[i].name)){
  //         respData.objects[i].color = "white";
  //       }else{
  //         respData.objects[i].color = "yellow";
  //       }
  //       newObjectList.push(respData.objects[i].name);
  //     }

  //     console.log(respData);
  //     console.log(objectList);
  //     setSceneGraphData(respData)
  //     setObjectList(newObjectList);


  //     // setImageSrc(`data:image/png;base64,${resp.data.image}`);
  //   })
  //   .catch((e) => {
  //     console.log(e);
  //   })
  // }

  // back position
  const moveToOriginalPosition = (e) => {
    e.preventDefault();
    setResetKey(1 + resetKey);

    let newSceneGraphData = JSON.parse(JSON.stringify(sceneGraphData));  // had to create a new one, not the same one because the obeject refers to the same memeory id

    for(let i=0; i<newSceneGraphData.objects.length; i++){
      const theName = newSceneGraphData.objects[i].name;
      newSceneGraphData.objects[i].position = usedPositions.get(theName);
    }
    setSceneGraphData(newSceneGraphData);
  }

  // toggle draggable
  const toggleIsDragDisabled = (e) => {
    e.preventDefault();
    setIsDragDisabled(!isDragDisabled);
  }


  const renderSceneGraph = () => {
      return (
        <div className="graph-panel-container">
          <Xwrapper>
              {
                sceneGraphData && sceneGraphData.objects.map( (item, i) => {
                  // console.log(item);
                  return <SceneBox 
                            key={`box-${i}-${resetKey}`} 
                            id={item.id.toString()} 
                            name={item.name.toString()}
                            x={scenePositions[item.position][0]}
                            y={scenePositions[item.position][1]}
                            color={item.color}
                            isDragDisabled={isDragDisabled}
                            boxArea={[item.box_areas.x1, item.box_areas.y1, item.box_areas.width, item.box_areas.height]}
                            addBox={moviePanelRef.current.addBox}
                          ></SceneBox>;
                })
              }
              {
                sceneGraphData && sceneGraphData.relationships.map( (item, i) => {
                  // console.log(i);
                  return <Xarrow 
                    key={`arrow-${i}-${resetKey}`} 
                    labels={item.predicate} 
                    start={item.subject.toString()} 
                    end={item.object.toString()}
                  />;
                })
              }
              {/* {
                scenePositions.map((item, i) => {
                  return (
                    <SceneBox
                      x={item[0]}
                      y={item[1]}
                      name={"asd"}
                      id={i}
                    ></SceneBox>
                  )
                })
              } */}
          </Xwrapper>
        </div>
      );
  }


  return (
    <div className="app-container">
      <div className="app-header">
        <h2>Natural Language Information Retrieval from Domain-Specific Videos</h2>
      </div>
      <div className="movie-panel">
        {videoURL && <MoviePanel ref={moviePanelRef} videoURL={videoURL} sceneGraph={sceneGraph} />}
        
      </div>
      <div className="graph-panel">
        {/* <GraphPanel imageSrc={imageSrc}/> */}
        {renderSceneGraph()}
        <div className='graph-panel-options'>
          <button className={`graph-panel-btns disable_drag_${isDragDisabled}`}>
            <img src={BoxCut} alt='' onClick={toggleIsDragDisabled}></img>
          </button>
          <button className='graph-panel-btns'>
            <img src={BackPosition} alt='' onClick={moveToOriginalPosition}></img>
          </button>
        </div>
      </div>

      <div className="settings-panel">
        <div></div>
        <div id="upload-wrapper">
          <input type="file" id="videoInput"  accept="video/*"  onChange={handleOnVideoUpload}></input>  
          <div className='setting-btn' > 
            <img src={uploadIcon} alt="icon for upload video button" className='setting-icons'></img>
            <p>Upload Video</p>
          </div>  
        </div>
        <button className='setting-btn' >
          <img src={videoIcon} alt="icon for budding box button"  className='setting-icons'></img>
          <p>Video History</p>
        </button>
        <button className='setting-btn'>
          <img src={chatIcon} alt="icon for instance segmentation button"  className='setting-icons'></img>
          <p>Chat History</p>
        </button>
      </div>
      <div className="chatbox">
        {/* Chatbox Panel */}
        <ChatBox captureScreenshot={captureScreenshot}/>
      </div>
    </div>
  );
};

export default App;
