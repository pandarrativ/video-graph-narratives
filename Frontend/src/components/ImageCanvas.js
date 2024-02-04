import React,{useRef, useEffect, useState, forwardRef, useImperativeHandle} from 'react';
import "../assets/css/canvas.css";
import { boxColors } from '../utils/utils';

const ImageCanvas = forwardRef( (props, ref) => {
    const [boxes, setBoxes] = useState([]);
    const [color, setColor] = useState(boxColors[0]);

    const [canvas, setCanvas] = useState();
    const [ctx, setCtx] = useState();
    // const [canvasBox, setCanvasBox] = useState();
    const [ctxBox, setCtxBox] = useState();
    // calculate the x-y of the canvas
    const [offsetX, setOffsetX] = useState();
    const [offsetY, setOffsetY] = useState();

    const canvasRef = useRef();
    const canvasBoxRef = useRef();
    useEffect(() => {
        const imageCanvas = canvasRef.current;
        setCanvas(imageCanvas);
        setCtx(imageCanvas.getContext("2d"));
        const rect = canvasRef.current.getBoundingClientRect();
        setOffsetX(rect.left);
        setOffsetY(rect.top)
        setCtxBox(canvasBoxRef.current.getContext("2d"));
    },[])

    // change offsetX and y when changing scrolls up and down in a page
    useEffect(() => {
        function handleScroll() {
            const rect = canvasRef.current.getBoundingClientRect();
            setOffsetX(rect.left);
            setOffsetY(rect.top)
        }
    
        // Attach the event listener to the window object
        window.addEventListener('scroll', handleScroll);
    
        // Clean up the event listener when the component unmounts
        return () => {
          window.removeEventListener('scroll', handleScroll);
        };
      }, []);


    // Change box colors and ids
    useEffect(() => {
        let n = boxColors.length;
        let colorIndex = boxes.length %n; 
        setColor(boxColors[colorIndex])
        localStorage.setItem("ann-boxes", JSON.stringify(boxes))
    }, [boxes])

    // clean all the box
    useImperativeHandle(ref, () => ({ 
        cleanBoxes (){
            setBoxes([]);
            ctxBox.clearRect(0, 0, canvasBoxRef.current.width, canvasBoxRef.current.height);
        },
        setBoxes (data){
            console.log(canvasBoxRef.current.width);
            console.log(canvasBoxRef.current.height);
            setBoxes([]);
            let newboxes = [];
            ctxBox.lineWidth = 5;
            for(let i=0; i<data.length; i++){
                ctxBox.strokeStyle = boxColors[i%boxColors.length];
                ctxBox.strokeRect(data[i].box[0], data[i].box[1], data[i].box[2], data[i].box[3]);
                newboxes.push({
                    "id":i,
                    'name':`<region ${i}>`,
                    'color':color,
                    "box":[data[i].box[0], data[i].box[1], data[i].box[2], data[i].box[3]]
                })
                console.log(data[i].box);
            }
            setBoxes(newboxes);
            // ctxBox.clearRect(0, 0, canvasBoxRef.current.width, canvasBoxRef.current.height);
        },
        addBox (x1, y1, wid, hei){
            console.log("triggered")
            console.log(x1, y1, wid, hei);
            const index = boxes.length;

            ctxBox.lineWidth = 5;
            ctxBox.strokeStyle = boxColors[index%boxColors.length];
            ctxBox.strokeRect(x1, y1, wid, hei);
            setBoxes([...boxes, {
                "id":index,
                'name':`<region ${index}>`,
                'color':color,
                "box":[x1, y1, wid, hei]
            }])
        }
     }));





    ///////////////////// for drawing one box ////////////////////////////
    //  flag: where user is dragging the box
    const [isDown, setIsDown] = useState(false);
    const [startX, setStartX] = useState();
    const [startY, setStartY] = useState();

    const [prevStartX, setPrevStartX] = useState(0);
    const [prevStartY, setPrevStartY] = useState(0);

    const [prevWidth, setPrevWidth] = useState(0);
    const [prevHeight, setPrevHeight] = useState(0);    



    const handleMouseUp = (e) => {
        e.preventDefault();
        e.stopPropagation();
    
        // the drag is over, clear the dragging flag, remove the box in the canvas panel and draw it on canvasBox panel
        setIsDown(false);
        ctxBox.strokeStyle = color;
        ctxBox.lineWidth = 5;
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctxBox.strokeRect(prevStartX, prevStartY, prevWidth, prevHeight);
        setBoxes([...boxes, {
            "id":boxes.length,
            'name':`<region ${boxes.length}>`,
            'color':color,
            "box":[prevStartX, prevStartY, prevWidth, prevHeight]
        }])
    }

    const handleMouseDown = (e) => {
        e.preventDefault();
        e.stopPropagation();
    
        
        ctx.strokeStyle=color;
        setStartX(parseInt(e.clientX - offsetX ));
        setStartY(parseInt(e.clientY - offsetY ));
    
        setIsDown(true);
        // console.log("start   x:" + parseInt(e.clientX - offsetX + window.scrollX) + "    y:" + parseInt(e.clientY - offsetY + window.scrollY));
        // console.log("e.clientY: " + e.clientY + "     offsetY:" + offsetY + "     window.scrollY:" + window.scrollY)
    };
    
    const handleMouseMove = (e) => {
        e.preventDefault();
        e.stopPropagation();
    
        if (!isDown) {
            return;
        }

        let mouseX = parseInt(e.clientX - offsetX );
        let mouseY = parseInt(e.clientY - offsetY );
    
        var width = mouseX - startX;
        var height = mouseY - startY;
        
        ctx.lineWidth = 5;
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.strokeRect(startX, startY, width, height);
    
        setPrevStartX(startX);
        setPrevStartY(startY);
        setPrevWidth(width);
        setPrevHeight(height);
    };

    const handleMouseOut = (e) => {
        e.preventDefault();
        e.stopPropagation();
    
        // the drag is over, clear the dragging flag
        setIsDown(false);
    }


    return (
        <div id='canvas-wrapper'>
            <canvas id="canvaxBox" ref={canvasBoxRef} height={360} width={640}></canvas>
            <canvas 
                id="imageCanvas"
                height={360} width={640}
                ref={canvasRef} 
                onMouseDown={handleMouseDown} 
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                onMouseOut={handleMouseOut}
            ></canvas>
            
        </div>

    );
});

export default ImageCanvas;