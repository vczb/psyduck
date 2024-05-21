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

  async drawTarget({ x, y }) {
    this.#targetCanvas.style.left = x + 'px';
    this.#targetCanvas.style.top = y + 'px';
  }

  clickOnElement(x, y) {
    this.#targetCanvas.style.background = 'red';

    const element = document.elementFromPoint(x, y)
    if(!element) return;
    
    const rect = element.getBoundingClientRect()
    const event = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
      clientX: rect.left + x,
      clientY: rect.top + y
    })

    element.dispatchEvent(event)
  }

  rightClick(){
    this.#targetCanvas.style.background = 'transparent';
  }
}