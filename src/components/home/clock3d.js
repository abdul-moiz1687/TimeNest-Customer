import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

const FINISHES = {
  gold: { ring: 0xc9a96a, metal: 1, rough: 0.28, face: '#121212', marks: '#c9a96a', hand: 0xf1dfb2, sec: 0xc9a96a, body: 0x1a1712 },
  walnut: { wood: true, ring: 0xffffff, metal: 0.05, rough: 0.6, face: '#eadfc8', marks: '#3a2a1a', hand: 0x2b1d12, sec: 0xa8432f, body: 0x4a2f1b },
  chrome: { ring: 0xdfe3e8, metal: 1, rough: 0.14, face: '#0f1b26', marks: '#e8eef5', hand: 0xe8eef5, sec: 0xe0584a, body: 0x8f959c },
  black: { ring: 0x1d1d1d, metal: 0.5, rough: 0.5, face: '#f2efe8', marks: '#161616', hand: 0x161616, sec: 0xc9a96a, body: 0x141414 },
}

function drawFace(canvas, f) {
  const s = canvas.width
  const c = s / 2
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = f.face
  ctx.fillRect(0, 0, s, s)
  const g = ctx.createRadialGradient(c * 0.8, c * 0.7, s * 0.05, c, c, s * 0.5)
  g.addColorStop(0, 'rgba(255,255,255,0.10)')
  g.addColorStop(1, 'rgba(0,0,0,0.20)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, s, s)
  ctx.strokeStyle = f.marks
  ctx.lineCap = 'round'
  for (let i = 0; i < 60; i++) {
    const big = i % 5 === 0
    const a = (i * Math.PI) / 30
    const r1 = s * 0.47
    const r2 = big ? s * 0.4 : s * 0.445
    ctx.lineWidth = big ? s * 0.012 : s * 0.004
    ctx.globalAlpha = big ? 1 : 0.6
    ctx.beginPath()
    ctx.moveTo(c + Math.sin(a) * r1, c - Math.cos(a) * r1)
    ctx.lineTo(c + Math.sin(a) * r2, c - Math.cos(a) * r2)
    ctx.stroke()
  }
  ctx.globalAlpha = 0.9
  ctx.fillStyle = f.marks
  ctx.textAlign = 'center'
  ctx.font = `${s * 0.05}px Georgia, serif`
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${s * 0.008}px`
  ctx.fillText('TIMENEST', c, c - s * 0.17)
  ctx.globalAlpha = 1
}

// Procedural wood grain for the walnut finish (no image download needed)
function woodTexture() {
  const cv = document.createElement('canvas')
  cv.width = 512
  cv.height = 512
  const ctx = cv.getContext('2d')
  ctx.fillStyle = '#5b3a22'
  ctx.fillRect(0, 0, 512, 512)
  for (let i = 0; i < 140; i++) {
    const y = Math.random() * 512
    ctx.strokeStyle = Math.random() > 0.5 ? 'rgba(30,16,8,0.35)' : 'rgba(140,92,52,0.28)'
    ctx.lineWidth = 0.6 + Math.random() * 2.4
    ctx.beginPath()
    ctx.moveTo(0, y)
    for (let x = 0; x <= 512; x += 64) ctx.lineTo(x, y + Math.sin(x * 0.02 + i) * 4)
    ctx.stroke()
  }
  const t = new THREE.CanvasTexture(cv)
  t.colorSpace = THREE.SRGBColorSpace
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(3, 1)
  return t
}

function shadowTexture() {
  const cv = document.createElement('canvas')
  cv.width = cv.height = 256
  const ctx = cv.getContext('2d')
  const g = ctx.createRadialGradient(128, 128, 20, 128, 128, 128)
  g.addColorStop(0, 'rgba(0,0,0,0.55)')
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 256, 256)
  return new THREE.CanvasTexture(cv)
}

export function createClockScene(container, { onReady } = {}) {
  const w = container.clientWidth || 600
  const h = container.clientHeight || 600
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 700 ? 1.5 : 2))
  renderer.setSize(w, h, false)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.15
  renderer.domElement.style.cssText = 'width:100%;height:100%;display:block;touch-action:pan-y'
  container.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const pmrem = new THREE.PMREMGenerator(renderer)
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environment = envTex

  const camera = new THREE.PerspectiveCamera(32, w / h, 0.1, 50)
  camera.position.set(0, 0, 9.6)

  const key = new THREE.DirectionalLight(0xfff1d6, 1.6)
  key.position.set(3, 4, 6)
  scene.add(key)

  let f = FINISHES.gold
  const faceCanvas = document.createElement('canvas')
  faceCanvas.width = faceCanvas.height = 1024
  drawFace(faceCanvas, f)
  const faceTex = new THREE.CanvasTexture(faceCanvas)
  faceTex.colorSpace = THREE.SRGBColorSpace
  faceTex.anisotropy = renderer.capabilities.getMaxAnisotropy()

  const woodTex = woodTexture()
  const ringMat = new THREE.MeshStandardMaterial({ color: f.ring, metalness: f.metal, roughness: f.rough, envMapIntensity: 1.2 })
  const bodyMat = new THREE.MeshStandardMaterial({ color: f.body, metalness: 0.4, roughness: 0.6 })
  const faceMat = new THREE.MeshStandardMaterial({ map: faceTex, roughness: 0.9, metalness: 0, envMapIntensity: 0.3 })
  const handMat = new THREE.MeshStandardMaterial({ color: f.hand, metalness: 0.8, roughness: 0.3 })
  const secMat = new THREE.MeshStandardMaterial({ color: f.sec, metalness: 0.8, roughness: 0.3 })
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.05, roughness: 0, metalness: 0, clearcoat: 1, envMapIntensity: 0.7, depthWrite: false })

  const clock = new THREE.Group()
  const body = new THREE.Mesh(new THREE.CylinderGeometry(2.05, 2.05, 0.42, 96).rotateX(Math.PI / 2), bodyMat)
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.0, 0.13, 32, 160), ringMat)
  ring.position.z = 0.2
  const face = new THREE.Mesh(new THREE.CircleGeometry(1.9, 96), faceMat)
  face.position.z = 0.22
  const glass = new THREE.Mesh(new THREE.CircleGeometry(1.9, 96), glassMat)
  glass.position.z = 0.34

  const hand = (len, wid, mat, z, tail = 0.15) => {
    const g = new THREE.Group()
    g.add(new THREE.Mesh(new THREE.BoxGeometry(wid, len, 0.03).translate(0, len / 2 - tail, 0), mat))
    g.position.z = z
    return g
  }
  const hourHand = hand(1.05, 0.15, handMat, 0.25)
  const minHand = hand(1.55, 0.09, handMat, 0.28)
  const secHand = hand(1.75, 0.025, secMat, 0.31, 0.32)
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.12, 32).rotateX(Math.PI / 2), ringMat)
  cap.position.z = 0.32
  clock.add(body, ring, face, glass, hourHand, minHand, secHand, cap)
  scene.add(clock)

  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(7.4, 7.4),
    new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false })
  )
  shadow.position.set(0.15, -0.25, -0.7)
  scene.add(shadow)

  let pulse = 0
  const setFinish = (name) => {
    const n = FINISHES[name]
    if (!n || n === f) return
    f = n
    ringMat.color.setHex(n.ring); ringMat.metalness = n.metal; ringMat.roughness = n.rough
    ringMat.map = n.wood ? woodTex : null
    ringMat.needsUpdate = true
    bodyMat.color.setHex(n.body)
    handMat.color.setHex(n.hand)
    secMat.color.setHex(n.sec)
    drawFace(faceCanvas, n)
    faceTex.needsUpdate = true
    pulse = 1
  }

  // The clock follows the pointer (mouse or touch) and gently sways when the pointer is away
  const target = { x: 0, y: 0 }
  let pointerActive = false
  const onMove = (e) => {
    const r = container.getBoundingClientRect()
    const px = ((e.clientX - r.left) / r.width) * 2 - 1
    const py = ((e.clientY - r.top) / r.height) * 2 - 1
    target.y = THREE.MathUtils.clamp(px, -1, 1) * 0.55
    target.x = THREE.MathUtils.clamp(py, -1, 1) * 0.4
    pointerActive = true
  }
  const onLeave = () => { pointerActive = false }
  container.addEventListener('pointermove', onMove)
  container.addEventListener('pointerleave', onLeave)

  let raf = 0
  let running = false
  let visible = true
  let firstFrame = true
  const TAU = Math.PI * 2

  const tick = (now) => {
    if (!running) return
    raf = requestAnimationFrame(tick)
    const t = now / 1000
    const d = new Date()
    const sec = d.getSeconds() + d.getMilliseconds() / 1000
    const min = d.getMinutes() + sec / 60
    const hr = (d.getHours() % 12) + min / 60
    secHand.rotation.z = -(sec / 60) * TAU
    minHand.rotation.z = -(min / 60) * TAU
    hourHand.rotation.z = -(hr / 12) * TAU

    if (!pointerActive) {
      target.y = Math.sin(t * 0.5) * 0.35
      target.x = Math.cos(t * 0.4) * 0.12
    }
    clock.rotation.y += (target.y - clock.rotation.y) * 0.07
    clock.rotation.x += (target.x - clock.rotation.x) * 0.07
    clock.position.y = Math.sin(t * 0.9) * 0.06
    pulse *= 0.9
    clock.scale.setScalar(1 + pulse * 0.05)
    shadow.position.x = 0.15 - clock.rotation.y * 0.9
    shadow.position.y = -0.25 + clock.rotation.x * 0.9

    renderer.render(scene, camera)
    if (firstFrame) { firstFrame = false; onReady?.() }
  }
  // Rendering pauses when the clock is off-screen or the tab is hidden
  const start = () => { if (!running && visible && !document.hidden) { running = true; raf = requestAnimationFrame(tick) } }
  const stop = () => { running = false; cancelAnimationFrame(raf) }

  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? start() : stop() })
  io.observe(container)
  const onVis = () => (document.hidden ? stop() : start())
  document.addEventListener('visibilitychange', onVis)

  const ro = new ResizeObserver(() => {
    const cw = container.clientWidth
    const ch = container.clientHeight
    if (!cw || !ch) return
    renderer.setSize(cw, ch, false)
    camera.aspect = cw / ch
    camera.updateProjectionMatrix()
  })
  ro.observe(container)
  start()

  return {
    setFinish,
    dispose() {
      stop()
      io.disconnect(); ro.disconnect()
      document.removeEventListener('visibilitychange', onVis)
      container.removeEventListener('pointermove', onMove)
      container.removeEventListener('pointerleave', onLeave)
      scene.traverse((o) => { if (o.geometry) o.geometry.dispose() })
      ;[ringMat, bodyMat, faceMat, handMat, secMat, glassMat, shadow.material].forEach((m) => m.dispose())
      faceTex.dispose(); woodTex.dispose(); shadow.material.map?.dispose(); envTex.dispose(); pmrem.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      renderer.domElement.remove()
    },
  }
}
