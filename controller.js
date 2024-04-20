export default class Controller {
  #view
  #camera
  #worker
  #blinkCounter = 0
  constructor({ view, worker, camera }) {
    this.#view = view
    this.#camera = camera
    this.#worker = this.#configureWorker(worker)
  }

  static async initialize(deps) {
    const controller = new Controller(deps)
    console.log('not yet detecting eye blink! wait the full page load')
    return controller.init()
  }

  #configureWorker(worker) {
    let ready = false
    worker.onmessage = ({ data }) => {
      if ('READY' === data) {
        console.log('worker is ready!')
        this.initializeDetection()
        ready = true
        return
      }
      const blinked = data.blinked
      this.#blinkCounter += blinked
      console.log('blinked', blinked)
    }

    return {
      send(msg) {
        if (!ready) return
        worker.postMessage(msg)
      }
    }
  }
  async init() {
    console.log('init!!')
  }

  loop() {
    const video = this.#camera.video
    const img = this.#view.getVideoFrame(video)
    this.#worker.send(img)
    setTimeout(() => this.loop(), 100)
  }

  initializeDetection() {
    console.log('initializing detection...')
    this.#blinkCounter = 0
    this.loop()
  }
}