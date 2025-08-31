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


// TODO 四角线屏幕尺寸变动时角度的问题

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

// decorLines.forEach((line, index) => {
//   gsap.set(line, {
//     rotate: `(${Math.atan2(window.innerHeight, window.innerWidth) * 180 / Math.PI + (index % 2 === 0 ? 0 : -180)}deg)`,
//   })
// });

gsap.set('.caption', { y: -500 });

const introTl = gsap.timeline({
  scrollTrigger: {
    trigger: "body",
    start: 'top top',
    end: `${window.innerHeight}px top`,
    scrub: 1,
    snap: 1,
    onUpdate: self => {
      // console.log("Decor lines progress:", self.progress.toFixed(3));
    },
    onComplete: () => gsap.set('.overlay', { scale: 1 })
  }
})

introTl
  .to(decorLines, {
    scaleX: 0,
  })
  .from('.overlay', {
    scale: 0.6,
  }, '<')



const outroTl = gsap.timeline({
  scrollTrigger: {
    trigger: ".outro",
    start: `top bottom`,
    end: `bottom bottom`,
    scrub: 1,
    snap: 1
  }
})

outroTl
  .to('.author', {
    scale: 1.15,
    y: -window.innerHeight / 2,
    // color: '#000',
  })
  .to('h1', {
    opacity: 0
  }, '<')
  .to(decorLines, {
    scaleX: 1,
  }, '<')
  .to('.overlay', {
    scale: 7,
    opacity: 0
  }, '<')

window.addEventListener('resize', resize);

const st = ScrollTrigger.create({
  trigger: wrapper,
  start: 'top top',
  end: 'bottom bottom',
  snap: {
    snapTo: 1 / 8,
    delay: 0,
    ease: 'power1.out'
  },
  onUpdate: self => {
    // console.log("Scroll progress:", self.progress.toFixed(2));
    container.style.transform = `translateX(-${distance * self.progress}px)`
    // if (Number(self.progress.toFixed(3)) % 0.125 === 0) {
    //   gsap.to('.overlay', { scale: 7, onComplete: () => gsap.set('.overlay', { scale: 0 }) })
    //   console.log(111111111111111111)
    // } else {

    // }
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



// TODO: scroll animation with gems
// TODO: fix glare effects
// TODO: intro & outro animations
const overlay = document.querySelector('.overlay');
const overlaySub = document.querySelector('.overlay-sub');

cards.forEach((card, index) => {
  const cardTl = gsap.timeline({
    scrollTrigger: {
      trigger: "body",
      start: `${window.innerHeight + window.innerWidth * index}px top`,
      end: `${window.innerHeight + window.innerWidth * (index + 1)}px bottom`,
      scrub: 1,
      onUpdate: self => {
        console.log("gem scroll", self.progress.toFixed(3), index);
      }
    }
  })

  const expand = index % 2 === 0
  console.log('-===================-', expand, index)

  cardTl
    .to(overlay, {
      rotateY: expand ? 90 : 0,
      onComplete: () => overlay.style.maskImage = "url(/assets/images/ellipse.svg)"
    })
    .to(overlay, {
      rotateY: expand ? 180 : 0,
    })
  // .to(card.querySelector('#gem>div'), {
  //   opacity: 0,
  //   ease: 'power3.out',
  //   clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)"
  // })
  // .to(expand ? overlay : overlaySub, {
  //   scale: 7,
  //   onComplete: () => {
  //     gsap.set(expand ? overlay : overlaySub, { transform: 'scale(0)' })
  //     console.log('to animation completed')
  //   }
  // })
  // .from(expand ? overlaySub : overlay, {
  //   scale: 0,
  //   onStart: () => {
  //     gsap.set(expand ? overlay : overlaySub, { transform: 'scale(1)' })
  //     console.log('from animation completed')
  //   }
  // }, '<')
})

const intro = document.querySelector('.intro');


// window.addEventListener('scroll', () => {
//   console.log('SCROLL EVENT', document.documentElement.scrollTop);
//   if (document.documentElement.scrollTop > window.innerHeight) return

//   wrapper.scrollIntoView({
//     behavior: 'smooth'
//   })
// })