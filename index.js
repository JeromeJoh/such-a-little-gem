import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'
import VanillaTilt from 'vanilla-tilt';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(MotionPathPlugin);
gsap.registerPlugin(MorphSVGPlugin);
gsap.registerPlugin(ScrollTrigger);

let distance = 0, inScrollArea = false;

const wrapper = document.querySelector('.wrapper');
const container = document.querySelector('.container');
const cards = gsap.utils.toArray('.card');
const decorLines = gsap.utils.toArray('.decor-line');



const resize = () => {
  decorLines.forEach((line, index) => {
    line.style.width = `${Math.sqrt(window.innerWidth * window.innerWidth / 4 + window.innerHeight * window.innerHeight / 4)}px`;
    line.style.transform = `rotate(${Math.atan2(window.innerHeight, window.innerWidth) * 180 / Math.PI}deg)`;

    if (index === 1) line.style.transform = `rotate(${-1 * Math.atan2(window.innerHeight, window.innerWidth) * 180 / Math.PI}deg)`;

    if (index === 2) line.style.transform = `rotate(${-1 * Math.atan2(window.innerHeight, window.innerWidth) * 180 / Math.PI}deg)`;
  })
  distance = container.offsetWidth - window.innerWidth
  wrapper.style.height = `${distance}px`
  if (inScrollArea) {
    container.style.transform = `translateX(-${distance}px)`
  }
}

resize()

gsap.to(decorLines, {
  scaleX: 0,
  scrollTrigger: {
    trigger: "body",
    start: 'top top',
    end: `${window.innerHeight}px top`,
    scrub: 1,
    onUpdate: self => {
      console.log("Decor lines progress:", self.progress.toFixed(3));
      decorLines.forEach((line, index) => {
        line.style.transform = `rotate(${Math.atan2(window.innerHeight, window.innerWidth) * 180 / Math.PI + (index % 2 === 0 ? 0 : -180)}deg)`;
      });
    }
  }
})

window.addEventListener('resize', resize);

const st = ScrollTrigger.create({
  trigger: wrapper,
  start: 'top top',
  end: 'bottom bottom',
  snap: 1 / 8,
  onUpdate: self => {
    console.log("Scroll progress:", self.progress.toFixed(3));
    container.style.transform = `translateX(-${distance * self.progress}px)`
  },
  onEnter: () => {
    inScrollArea = true;
    console.log("Entered scroll area");
  },
  onLeave: () => {
    inScrollArea = false;
    console.log("Left scroll area");
  },
})

// VanillaTilt.init(document.querySelectorAll('.card'), { max: 25 });

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

gsap.set(".lt p", { rotateY: 180, rotate: -30 })
gsap.set(".rt p", { rotate: 30 })
gsap.set(".lb p", { rotateZ: 180, rotate: 30 })
gsap.set(".rb p", { rotateX: 180, rotate: -30 })
gsap.to(".lt .star", path[0])
gsap.timeline()
  .to(".lt .star", {
    duration: 2,
    ease: "power1.inOut",
    motionPath: {
      path: path,
      curviness: 1.5,
      autoRotate: false,
      debug: true
    }
  }).to(".lt .star", {
    duration: 2,
    ease: "power1.inOut",
    rotate: -360,
    scale: 0,
  }, '<');

gsap.to(".rt .star", path[0])
gsap.timeline()
  .to(".rt .star", {
    duration: 2,
    ease: "power1.inOut",
    motionPath: {
      path: path,
      curviness: 1.5,
      autoRotate: false,
      debug: true
    }
  }).to(".rt .star", {
    duration: 2,
    ease: "power1.inOut",
    rotate: -360,
    scale: 0,
  }, '<');

gsap.to(".lb .star", path[0])
gsap.timeline()
  .to(".lb .star", {
    duration: 2,
    ease: "power1.inOut",
    motionPath: {
      path: path,
      curviness: 1.5,
      autoRotate: false,
      debug: true
    }
  }).to(".lb .star", {
    duration: 2,
    ease: "power1.inOut",
    rotate: -360,
    scale: 0,
  }, '<');

gsap.to(".rb .star", path[0])
gsap.timeline()
  .to(".rb .star", {
    duration: 2,
    ease: "power1.inOut",
    motionPath: {
      path: path,
      curviness: 1.5,
      autoRotate: false,
      debug: true
    }
  }).to(".rb .star", {
    duration: 2,
    ease: "power1.inOut",
    rotate: -360,
    scale: 0,
  }, '<');

// gsap.to(".lt .star", {
//   duration: 2,
//   // repeat: -1,
//   ease: "power1.inOut",
//   motionPath: {
//     path: flippedX,
//     curviness: 1.5,
//     autoRotate: false,
//     direction: -1,
//     debug: true
//   }
// });

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

// gsap.from(".obsidian #gem div", {
//   duration: 1,
//   opacity: 0,
//   y: 30,
//   stagger: 0.05,
//   ease: 'power3.out',
//   // clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
//   delay: 0.5
// })