export const boxColors = [
    "#845EC2",
    "#F9F871",
    "#2C73D2",
    "#D65DB1",
    "#008F7A",
    "#FF6F91",
    "#FF9671",
    "#00C9A7",  
];

export function secsTomins(seconds){
    const h = Math.floor(seconds / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    const s = Math.floor(seconds % 3600 % 60);

    const hDisplay = h > 0 ? h + ":" : "";
    const mDisplay = m < 10 ? "0" + m : m;
    const sDisplay = s < 10 ? "0" + s : s;
    
    return hDisplay + mDisplay + ":" + sDisplay;
}

export function secsToPercent(seconds, totalSeconds){
    
}

export function minsToSecs(mins){

}



export const formatTime = (time) => {
    //formarting duration of video
    if (isNaN(time)) {
      return "00:00";
    }

    const date = new Date(time * 1000);
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const seconds = date.getUTCSeconds().toString().padStart(2, "0");
    if (hours) {
      //if video have hours
      return `${hours}:${minutes.toString().padStart(2, "0")} `;
    } else return `${minutes}:${seconds}`;
};

export const  arraysAreEqual = (array1, array2) => {
  if (array1.length !== array2.length) {
      return false;
  }

  for (let i = 0; i < array1.length; i++) {
      if (array1[i] !== array2[i]) {
          return false;
      }
  }

  return true;
}

