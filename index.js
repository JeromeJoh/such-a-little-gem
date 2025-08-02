import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'
import VanillaTilt from 'vanilla-tilt';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';

gsap.registerPlugin(MotionPathPlugin);
gsap.registerPlugin(MorphSVGPlugin);


VanillaTilt.init(document.querySelectorAll('.card'), { max: 25 });

gsap.registerPlugin(SplitText)

document.fonts.ready.then(() => {
  const split = new SplitText('.caption', { type: 'chars' })
  gsap.from(split.chars, {
    duration: 0.8,
    opacity: 0,
    y: 30,
    stagger: 0.05,
    ease: 'power3.out'
  })
})

function regularPolygonPath(n, cx, cy, r) {
  let path = "";
  for (let i = 0; i < n; i++) {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    path += (i === 0 ? "M" : "L") + x.toFixed(3) + "," + y.toFixed(3) + " ";
  }
  return path + "Z";
}

const cx = 15, cy = 20;

const path = [
  { x: 0, y: 0 },
  { x: cx, y: -cy },
  { x: 2 * cx, y: 0 },
  { x: cx, y: cy },
  { x: 0, y: 0 }
];

const flippedX = path.map(p => ({ x: p.x, y: 2 * cy - p.y }))
const flippedY = path.map(p => ({ x: 2 * cx - p.x, y: p.y }))
const flippedXY = path.map(p => ({
  x: 2 * cx - p.x,
  y: 2 * cy - p.y
}))

gsap.to(".rt .star", path[0])
gsap.timeline()
  .to(".rt .star", {
    duration: 2,
    // repeat: -1,
    ease: "power1.inOut",
    motionPath: {
      path: path,
      curviness: 1.5,
      autoRotate: false,
      debug: true
    }
  }).to(".rt .star", {
    duration: 2,
    ease: "elastic.inOut(1, 0.3),",
    rotate: -360,
    // opacity: 0,
  }, '<');

gsap.to(".lt .star", {
  duration: 2,
  // repeat: -1,
  ease: "power1.inOut",
  motionPath: {
    path: flippedX,
    curviness: 1.5,
    autoRotate: false,
    direction: -1,
    debug: true
  }
});

function morphShape(fromPath, toPath, options = {}) {

  // 默认参数
  const defaultOptions = {
    duration: 1,
    ease: "power1.inOut"
  };

  // 合并用户传入参数
  const config = { ...defaultOptions, ...options };

  // 执行动画
  gsap.to(fromPath, {
    ...config,
    morphSVG: toPath
  });
}

const octagonPath = regularPolygonPath(8, 100, 100, 50);

// gsap.to("#shape", {
//   duration: 0.5,
//   morphSVG: { shape: octagonPath },
//   ease: "power2.inOut",
//   repeat: -1,
//   yoyo: true
// });

// morphShape("#shape", octagonPath, {
//   duration: 2,
// })