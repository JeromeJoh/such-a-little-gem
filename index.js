import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import { InertiaPlugin } from 'gsap/all';
import { TextPlugin } from 'gsap/all';
import VanillaTilt from 'vanilla-tilt';

gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(SplitText)
gsap.registerPlugin(MotionPathPlugin);
gsap.registerPlugin(MorphSVGPlugin);
gsap.registerPlugin(InertiaPlugin);
gsap.registerPlugin(TextPlugin);


let distance = 0, inScrollArea = false;

const wrapper = document.querySelector('.wrapper');
const container = document.querySelector('.container');
const cards = gsap.utils.toArray('.card');
const decorLines = gsap.utils.toArray('.decor-line');

// gsap.globalTimeline.timeScale(2);
const init = () => {
  resize();
  bindEvents();
}

const bindEvents = () => {
  window.addEventListener('resize', resize);
  // VanillaTilt.init(document.querySelectorAll('#gem'), { max: 25 });
}

const resize = () => {
  decorLines.forEach((line, index) => {
    line.style.width = `${Math.sqrt(window.innerWidth * window.innerWidth / 4 + window.innerHeight * window.innerHeight / 4)}px`;
    line.style.transform = `rotate(${Math.atan2(window.innerHeight, window.innerWidth) * 180 / Math.PI * (index % 3 === 0 ? 1 : -1)}deg)`;
  })
  distance = container.offsetWidth - window.innerWidth
  wrapper.style.height = `${distance}px`
  if (inScrollArea) {
    container.style.transform = `translateX(-${distance}px)`
  }
}

const st = ScrollTrigger.create({
  trigger: wrapper,
  start: 'top top',
  end: 'bottom bottom',
  inertia: {
    y: {
      velocity: 2, // 初始速度
      min: 0,
      max: wrapper.scrollHeight - wrapper.clientHeight // 边界
    }
  },
  snap: {
    snapTo: 1 / 8,
    delay: 0,
    ease: 'power3.out'
  },
  onUpdate: self => {
    // console.log("Scroll progress:", self.progress.toFixed(2));
    container.style.transform = `translateX(-${distance * self.progress}px)`;
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


init();


document.fonts.ready.then(() => {
  const introTl = gsap.timeline({
    scrollTrigger: {
      trigger: document.body,
      start: 'top top',
      end: `${window.innerHeight}px top`,
      scrub: 0.5,
      snap: {
        snapTo: 1,
        delay: 0,
        ease: 'power3.out'
      },
      onUpdate: self => {
        // console.log("Decor lines progress:", self.progress.toFixed(3));
      },
      onComplete: () => gsap.set('.overlay', { scale: 1 })
    }
  })

  const split = new SplitText('.caption', { type: 'chars' })


  introTl
    .to(decorLines, {
      scaleX: 0,
    })
    .from('.overlay', {
      scale: 0.6,
    }, '<')
    .to(decorLines, {
      scaleX: 0,
    })
    .from(split.chars, {
      duration: 0.8,
      opacity: 0,
      y: 30,
      stagger: 0.05,
      ease: 'power3.out'
    })

  const outroTl = gsap.timeline({
    scrollTrigger: {
      trigger: ".outro",
      start: `top bottom`,
      end: `bottom bottom`,
      scrub: 1,
      snap: {
        snapTo: 1,
        delay: 0,
        ease: 'power3.out'
      },
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
    .to(split.chars, {
      duration: 0.8,
      opacity: 0,
      y: -30,
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

const frameSet = [
  {
    mask: "frame",
    color: 'silver'
  },
  {
    mask: "ellipse",
    color: 'gold'
  }
]



// TODO: scroll animation with gems
// TODO: fix glare effects
// TODO: intro & outro animations

const overlay = document.querySelector('.overlay');


cards.forEach((card, index) => {
  const flag = index % 2 === 0
  const cardTl = gsap.timeline({
    scrollTrigger: {
      trigger: document.body,
      start: `${window.innerHeight + window.innerWidth * index}px top`,
      end: `${window.innerHeight + window.innerWidth * (index + 1)}px bottom`,
      scrub: 1,
      onUpdate: self => {
        console.log("gem scroll", self.progress.toFixed(3), index, flag);
      },
      onEnter: _ => console.log('card enter')
    }
  })



  cardTl
    .to(overlay, {
      rotateY: 90,
      scale: 1.5,
      onComplete: () => {
        overlay.style.maskImage = `url(/assets/images/${frameSet[Number(flag)].mask}.svg)`
        console.log('complete')
      },
    })
    .to(overlay, {
      rotateY: flag ? 180 : 0,
      scale: 1,
      onReverseComplete: () => {
        overlay.style.maskImage = `url(/assets/images/${frameSet[1 - Number(flag)].mask}.svg)`
        console.log('reverse')
      },
    })
    .to('.caption', {
      text: "Ruby"
    })
  // .to(card.querySelector('#gem>div'), {
  //   opacity: 0,
  //   ease: 'power3.out',
  //   clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)"
  // })
  // .to(flag ? overlay : overlaySub, {
  //   scale: 7,
  //   onComplete: () => {
  //     gsap.set(flag ? overlay : overlaySub, { transform: 'scale(0)' })
  //     console.log('to animation completed')
  //   }
  // })
  // .from(flag ? overlaySub : overlay, {
  //   scale: 0,
  //   onStart: () => {
  //     gsap.set(flag ? overlay : overlaySub, { transform: 'scale(1)' })
  //     console.log('from animation completed')
  //   }
  // }, '<')
})


// window.addEventListener('scroll', () => {
//   console.log('SCROLL EVENT', document.documentElement.scrollTop);
//   if (document.documentElement.scrollTop > window.innerHeight) return

//   wrapper.scrollIntoView({
//     behavior: 'smooth'
//   })
// })