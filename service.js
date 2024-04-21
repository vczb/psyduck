import { prepareRunChecker } from "./util.js"
const { shouldRun } = prepareRunChecker({ timerDelay: 500 })

const EAR_THRESHOLD = 0.27
export default class Service {
  #model = null
  #faceLandmarksDetection
  constructor({ faceLandmarksDetection }) {
    this.#faceLandmarksDetection = faceLandmarksDetection
  }
  async loadModel() {
    this.#model = await this.#faceLandmarksDetection.load(
      this.#faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
      { maxFaces: 1 }
    )
  }

  // Calculate the position of eyelid to predict a blink
  #getEAR(upper, lower) {
    function getEucledianDistance(x1, y1, x2, y2) {
      return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1))
    }

    return (
      (getEucledianDistance(upper[5][0], upper[5][1], lower[4][0], lower[4][1])
        + getEucledianDistance(
          upper[3][0],
          upper[3][1],
          lower[2][0],
          lower[2][1],
        ))
      / (2
        * getEucledianDistance(upper[0][0], upper[0][1], upper[8][0], upper[8][1]))
    )
  }

  async handlePredict(video) {
    const RETURN_NONE = {move: false, blinked: false}

    const predictions = await this.#estimateFaces(video);
    if (!predictions.length) return RETURN_NONE;
    
    for (const prediction of predictions) {
        // Right eye parameters
        const lowerRight = prediction.annotations.rightEyeUpper0;
        const upperRight = prediction.annotations.rightEyeLower0;
        const rightEAR = this.#getEAR(upperRight, lowerRight);
        // Left eye parameters
        const lowerLeft = prediction.annotations.leftEyeUpper0;
        const upperLeft = prediction.annotations.leftEyeLower0;
        const leftEAR = this.#getEAR(upperLeft, lowerLeft);

        // Threshold check for each eye
        const rightBlinked = rightEAR <= EAR_THRESHOLD;
        const leftBlinked = leftEAR <= EAR_THRESHOLD;

    

        if (!shouldRun()) {
          continue
        } else if(rightBlinked && !leftBlinked){
          return { blinked: true, eye: 'right' };
        } else if(leftBlinked && !rightBlinked){
          console.log(prediction)
          return { blinked: true, eye: 'left' };
        } else {
          const [x, y] = prediction.annotations.noseTip[0];
       
          return { move: true, x: parseInt(x), y: parseInt(y) };
        }
    }

    return RETURN_NONE
}


  #estimateFaces(video) {
    return this.#model.estimateFaces({
      input: video,
      returnTensors: false,
      flipHorizontal: true,
      predictIrises: true
    })
  }
}