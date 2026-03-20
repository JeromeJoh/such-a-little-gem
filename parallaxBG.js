import { gsap } from 'gsap'
export default class ParallaxBG {
  static instances = []
  static running = false

  /* ========= 工具：统一解析 ========= */
  static normalizeElements(input) {
    if (!input) return []

    if (typeof input === 'string') {
      return Array.from(document.querySelectorAll(input))
    }

    if (input instanceof Element) {
      return [input]
    }

    if (
      input instanceof NodeList ||
      input instanceof HTMLCollection
    ) {
      return Array.from(input)
    }

    if (Array.isArray(input)) {
      return input.flatMap(item =>
        ParallaxBG.normalizeElements(item)
      )
    }

    return []
  }

  /* ========= 构造 ========= */
  constructor(options = {}) {
    const els = ParallaxBG.normalizeElements(options.el)

    this.el = els[0]

    if (!this.el) {
      console.warn('ParallaxBG: invalid el', options.el)
      return
    }

    this.revealTargets = ParallaxBG.normalizeElements(
      options.reveal?.targets
    )

    /* 参数 */
    this.depth = options.depth ?? 0.3
    this.ease = options.ease ?? 0.08
    this.driftStrength = options.driftStrength ?? 10
    this.noiseStrength = options.noiseStrength ?? 2
    this.nonLinear = options.nonLinear ?? 0.85
    this.returnForce = options.returnForce ?? 0.02

    /* 状态 */
    this.isDown = false
    this.startX = 0
    this.startY = 0

    this.targetX = 0
    this.targetY = 0

    this.currentX = 0
    this.currentY = 0

    this.time = Math.random() * 100

    this.tl = null

    this.init()
  }

  /* ========= 初始化 ========= */
  init() {
    this.el.style.userSelect = 'none'
    this.el.style.cursor = 'grab'

    this.bindEvents()

    ParallaxBG.instances.push(this)
    ParallaxBG.start()
  }

  /* ========= 事件 ========= */
  bindEvents() {
    this.el.addEventListener('pointerdown', (e) => {
      this.isDown = true

      this.startX = e.clientX - this.targetX
      this.startY = e.clientY - this.targetY

      this.show()

      this.el.setPointerCapture(e.pointerId)
    })

    this.el.addEventListener('pointermove', (e) => {
      if (!this.isDown) return

      const bounds = this.getBounds()

      this.targetX = this.clamp(
        e.clientX - this.startX,
        bounds.minX,
        bounds.maxX
      )

      this.targetY = this.clamp(
        e.clientY - this.startY,
        bounds.minY,
        bounds.maxY
      )

      /* 拖拽时跟手 */
      this.currentX = this.targetX
      this.currentY = this.targetY
    })

    window.addEventListener('pointerup', () => {
      if (!this.isDown) return

      this.isDown = false
      this.hide()
    })
  }

  /* ========= GSAP ========= */
  show() {
    this.tl?.kill()

    this.tl = gsap.timeline()
      .to(this.revealTargets, { opacity: 0 })
      .to(this.el, { opacity: 1 }, '<')
  }

  hide() {
    this.tl?.kill()

    this.tl = gsap.timeline()
      .to(this.revealTargets, { opacity: 1 })
      .to(this.el, { opacity: 0 }, '<')
  }

  /* ========= 工具 ========= */
  clamp(v, min, max) {
    return Math.max(min, Math.min(max, v))
  }

  getBounds() {
    const maxX = window.innerWidth * 0.2
    const maxY = window.innerHeight * 0.2

    return {
      minX: -maxX,
      maxX: maxX,
      minY: -maxY,
      maxY: maxY
    }
  }

  /* ========= 更新 ========= */
  update() {
    this.time += 0.01

    /* 惯性 */
    this.currentX += (this.targetX - this.currentX) * this.ease
    this.currentY += (this.targetY - this.currentY) * this.ease

    /* 回弹 */
    if (!this.isDown) {
      this.targetX *= (1 - this.returnForce)
      this.targetY *= (1 - this.returnForce)
    }

    /* 漂移 */
    const driftFactor = this.isDown ? 0 : 1

    const driftX =
      Math.sin(this.time) * this.driftStrength * driftFactor

    const driftY =
      Math.cos(this.time * 0.8) * this.driftStrength * driftFactor

    /* 连续 noise（不抖） */
    const noiseX =
      Math.sin(this.time * 3.3) * this.noiseStrength

    const noiseY =
      Math.cos(this.time * 2.7) * this.noiseStrength

    /* 非线性 */
    const finalX =
      Math.sign(this.currentX) *
      Math.pow(Math.abs(this.currentX), this.nonLinear)

    const finalY =
      Math.sign(this.currentY) *
      Math.pow(Math.abs(this.currentY), this.nonLinear)

    /* depth 动态 */
    const dynamicDepth = this.isDown
      ? this.depth * 1.2
      : this.depth

    const x = (finalX + driftX + noiseX) * dynamicDepth
    const y = (finalY + driftY + noiseY) * dynamicDepth

    this.el.style.backgroundPosition = x + 'px ' + y + 'px'
  }

  /* ========= RAF ========= */
  static start() {
    if (this.running) return
    this.running = true

    const loop = () => {
      this.instances.forEach(inst => inst.update())
      requestAnimationFrame(loop)
    }

    loop()
  }
}