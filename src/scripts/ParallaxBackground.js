import gsap from "gsap"

export default class ParallaxBackground {
  static instances = []
  static running = false

  /* ========= 工具 ========= */
  static normalizeElements(input) {
    if (!input) return []

    if (typeof input === 'string') {
      return Array.from(document.querySelectorAll(input))
    }

    if (input instanceof Element) {
      return [input]
    }

    if (input instanceof NodeList || input instanceof HTMLCollection) {
      return Array.from(input)
    }

    if (Array.isArray(input)) {
      return input.flatMap(item =>
        ParallaxBackground.normalizeElements(item)
      )
    }

    return []
  }

  /* ========= 构造 ========= */
  constructor(options = {}) {
    const els = ParallaxBackground.normalizeElements(options.el)
    this.el = els[0]

    if (!this.el) {
      console.warn('ParallaxBackground: invalid el', options.el)
      return
    }

    this.trigger = ParallaxBackground.normalizeElements(
      options.trigger ?? this.el
    )[0]

    this.revealTargets = ParallaxBackground.normalizeElements(
      options.reveal?.targets
    )

    /* 参数 */
    this.depth = options.depth ?? 0.3
    this.ease = options.ease ?? 0.08
    this.driftStrength = options.driftStrength ?? 10
    this.noiseStrength = options.noiseStrength ?? 2
    this.nonLinear = options.nonLinear ?? 0.85
    this.returnForce = options.returnForce ?? 0.02

    /* ⭐ 新增：方向控制（支持连续值） */
    this.direction = options.direction ?? -1

    /* 手势参数 */
    this.dragThreshold = options.dragThreshold ?? 4
    this.tapDelay = options.tapDelay ?? 120

    /* 状态 */
    this.isDown = false
    this.isDragging = false
    this.dragReady = false

    this.startX = 0
    this.startY = 0

    this.startClientX = 0
    this.startClientY = 0
    this.downTime = 0

    this.targetX = 0
    this.targetY = 0
    this.currentX = 0
    this.currentY = 0

    this.time = Math.random() * 100

    this._suppressClick = false
    this.handleClick = options.onClick

    this.tl = null

    this.init()
  }

  /* ========= 初始化 ========= */
  init() {
    if (!this.trigger) return

    this.trigger.style.cursor = 'grab'
    this.trigger.style.touchAction = 'none'

    this.bindEvents()

    ParallaxBackground.instances.push(this)
    ParallaxBackground.start()
  }

  /* ========= 事件 ========= */
  bindEvents() {
    this.trigger.addEventListener('pointerdown', (e) => {
      this.isDown = true
      this.isDragging = false
      this.dragReady = false

      this.startX = e.clientX - this.targetX
      this.startY = e.clientY - this.targetY

      this.startClientX = e.clientX
      this.startClientY = e.clientY
      this.downTime = Date.now()

      this.trigger.setPointerCapture(e.pointerId)
    })

    this.trigger.addEventListener('pointermove', (e) => {
      if (!this.isDown) return

      const dx = e.clientX - this.startClientX
      const dy = e.clientY - this.startClientY
      const dist = Math.hypot(dx, dy)
      const dt = Date.now() - this.downTime

      /* 判断是否进入 drag */
      if (!this.dragReady) {
        if (dist > this.dragThreshold || dt > this.tapDelay) {
          this.dragReady = true
          this.isDragging = true
          this.show()
        } else {
          return
        }
      }

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

      /* 跟手 */
      this.currentX = this.targetX
      this.currentY = this.targetY
    })

    window.addEventListener('pointerup', (e) => {
      if (!this.isDown) return

      if (this.isDragging) {
        this.hide()

        this._suppressClick = true
        requestAnimationFrame(() => {
          this._suppressClick = false
        })
      } else {
        this.handleClick?.(e)
      }

      this.isDown = false
    })

    this.trigger.addEventListener('click', (e) => {
      if (this._suppressClick) {
        e.preventDefault()
        e.stopPropagation()
      }
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

    /* 缓动 */
    this.currentX += (this.targetX - this.currentX) * this.ease
    this.currentY += (this.targetY - this.currentY) * this.ease

    /* 回弹 */
    if (!this.isDown) {
      this.targetX *= (1 - this.returnForce)
      this.targetY *= (1 - this.returnForce)
    }

    const driftFactor = this.isDown ? 0 : 1

    /* 漂移 */
    const driftX =
      Math.sin(this.time) * this.driftStrength * driftFactor

    const driftY =
      Math.cos(this.time * 0.8) * this.driftStrength * driftFactor

    /* 噪声 */
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

    const dynamicDepth = this.isDown
      ? this.depth * 1.2
      : this.depth

    /* ⭐ 方向控制 */
    const dir = this.direction

    const x =
      (finalX + driftX + noiseX) *
      dynamicDepth *
      dir

    const y =
      (finalY + driftY + noiseY) *
      dynamicDepth *
      dir

    this.el.style.backgroundPosition = `${x}px ${y}px`
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