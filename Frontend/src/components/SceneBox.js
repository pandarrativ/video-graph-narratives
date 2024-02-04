import React, { useState, useEffect } from 'react';
import Draggable from 'react-draggable';
import {useXarrow} from 'react-xarrows';


const SceneBox = ((props) => {
    const [position, setPosition] = useState({ x: props.x, y: props.y });
    const boxStyle = {border: 'grey solid 2px', borderRadius: '10px', padding: '5px', height:"20px", width:"100px", color:props.color};
    // const boxStyle = {border: 'grey solid 2px', borderRadius: '10px', padding: '5px', height:"20px", width:"auto", color:props.color, display: "inline-block"};
    const updateXarrow = useXarrow();

    const drawBox = () => {
        if(!props.isDragDisabled) return;
        // console.log(props.boxArea);
        props.addBox(...props.boxArea);
    }


    return (
        <Draggable onDrag={updateXarrow} onStop={updateXarrow} defaultPosition={position} disabled={props.isDragDisabled}>
            {/* {props.isDragDisabled ? 
            <button className='drag_box_btn'>
                123
            </button> 
            : <></>
            } */}
            <div id={props.id} style={boxStyle} onClick={drawBox} className='drag_btn'> 
                {props.name}
            </div>
            
        </Draggable>
        
    );
});

export default SceneBox;