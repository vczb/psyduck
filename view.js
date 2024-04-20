export default class View {
  #videoFrameCanvas = document.createElement('canvas')
  #canvasContext = this.#videoFrameCanvas.getContext('2d', { willReadFrequently: true })
  #videoElement = document.querySelector('#video')

  getVideoFrame(video) {
    const canvas = this.#videoFrameCanvas
    const [width, height] = [video.videoWidth, video.videoHeight]
    canvas.width = width
    canvas.height = height

    this.#canvasContext.drawImage(video, 0, 0, width, height)
    return this.#canvasContext.getImageData(0, 0, width, height)
  }
  togglePlayVideo() {
    if (this.#videoElement.paused) {
      this.#videoElement.play()
      return
    }
    this.#videoElement.pause()
  }
}