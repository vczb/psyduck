export default class View {
  #targetCanvas = document.getElementById("target");
  #videoFrameCanvas = document.createElement('canvas');
  #canvasContext = this.#videoFrameCanvas.getContext('2d', { willReadFrequently: true });
  #videoElement = document.querySelector('#video');

  constructor(alpha = 0.5) {
    this.alpha = alpha;
    this.previousX = null;
    this.previousY = null;
  }

  getSmoothCoordinates(x, y) {
    if (this.previousX === null || this.previousY === null) {
      this.previousX = x;
      this.previousY = y;
    }

    const smoothedX = this.alpha * x + (1 - this.alpha) * this.previousX;
    const smoothedY = this.alpha * y + (1 - this.alpha) * this.previousY;

    this.previousX = smoothedX;
    this.previousY = smoothedY;

    return { x: smoothedX, y: smoothedY };
  }

  getVideoFrame(video) {
    const canvas = this.#videoFrameCanvas;
    const [width, height] = [video.videoWidth, video.videoHeight];
    canvas.width = width;
    canvas.height = height;

    this.#canvasContext.drawImage(video, 0, 0, width, height);
    return this.#canvasContext.getImageData(0, 0, width, height);
  }

  togglePlayVideo() {
    if (this.#videoElement.paused) {
      this.#videoElement.play();
      return;
    }
    this.#videoElement.pause();
  }

  scaleAndAdjustCoordinates(x, y, sensitivity = 2) {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    let deltaX = (x - centerX) * sensitivity;
    let deltaY = (y - centerY) * sensitivity;

    let newX = centerX + deltaX;
    let newY = centerY + deltaY;

    return { x: newX, y: newY };
  }

  async drawTarget({ x, y }) {
    let { x: smoothX, y: smoothY } = this.getSmoothCoordinates(x, y);
    let { x: finalX, y: finalY } = this.scaleAndAdjustCoordinates(smoothX, smoothY, 3);

    this.#targetCanvas.style.left = finalX + 'px';
    this.#targetCanvas.style.top = finalY + 'px';
  }
}