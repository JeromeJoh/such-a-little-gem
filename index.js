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

const sprinkle = (() => {
  const cx = 15, cy = 20;

  const path = [
    { x: 0, y: 0 },
    { x: cx, y: -cy },
    { x: 2 * cx, y: 0 },
    { x: cx, y: cy },
    { x: 0, y: 0 }
  ];

  // 配置表：每个象限的选择器 + 初始 rotate 设置
  const config = [
    { selector: ".lt", set: { rotateY: 180, rotate: -30 } },
    { selector: ".rt", set: { rotate: 30 } },
    { selector: ".lb", set: { rotateZ: 180, rotate: 30 } },
    { selector: ".rb", set: { rotateX: 180, rotate: -30 } },
  ];

  // 动画函数
  const animate = (selector) => {
    gsap.set(`${selector} .star`, { x: 0, y: 0, scale: 1, rotate: 0 });
    gsap.to(`${selector} .star`, path[0]);
    gsap.timeline()
      .to(`${selector} .star`, {
        duration: 2,
        ease: "power1.inOut",
        motionPath: {
          path,
          curviness: 1.5,
          autoRotate: false,
          debug: true
        }
      })
      .to(`${selector} .star`, {
        duration: 2,
        ease: "power1.inOut",
        rotate: -360,
        scale: 0,
      }, "<");
  };

  let fn = () => {
    // 初始化（只执行一次）
    config.forEach(({ selector, set }) => {
      gsap.set(`${selector} p`, set);
    });

    // 播放动画
    config.forEach(({ selector }) => animate(selector));

    // 替换函数 → 之后只做动画
    fn = () => {
      config.forEach(({ selector }) => animate(selector));
    };
  };

  return () => fn();
})();


// gsap.globalTimeline.timeScale(2);
const init = () => {
  resize();
  bindEvents();
  sprinkle();
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
  // inertia: {
  //   y: {
  //     velocity: 2, // 初始速度
  //     min: 0,
  //     max: wrapper.scrollHeight - wrapper.clientHeight // 边界
  //   }
  // },
  snap: {
    snapTo: 1 / 8,
    delay: 0,
    ease: 'power3.out'
  },
  onUpdate: self => {
    console.log("Scroll progress:", self.progress.toFixed(3));
    container.style.transform = `translateX(-${distance * self.progress}px)`;
  },
  onEnter: () => {
    inScrollArea = true;
    console.log("========== Entered scroll area");
  },
  onLeave: () => {
    inScrollArea = false;
    console.log("========== Left scroll area");
  },
  onSnapComplete: () => {
    console.log("========== Snap area");
  }
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
      scrub: true,
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
    .to('.caption', {
      duration: 0.8,
      opacity: 0,
      y: -30,
      onComplete: _ => console.log("OUTRO============")
    }, '<')
    .to('.author', {
      scale: 1.5
    })
    .to('.author span', {
      text: ' Presents'
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
const overlay = document.querySelector('.overlay');


cards.forEach((card, index) => {
  const flag = index % 2 === 0
  const cardTl = gsap.timeline({
    scrollTrigger: {
      trigger: wrapper,
      start: `${window.innerWidth * index}px top`,
      end: `${window.innerWidth * (index + 1)}px bottom`,
      // scrub: true,
      onUpdate: self => {
        console.log("gem scroll", self.progress.toFixed(3), index, flag);
      },
      onEnter: _ => {
        console.log('card enter')
        tl.play();
        sprinkle();
      },
      onLeaveBack: _ => {
        console.log('card leave')
        tl.reverse();
        sprinkle();
      }
    }
  })

  const gemList = [
    'obsidian',
    'amethyst',
    'diamond',
    'aquamarine',
    'emerald',
    'pearl',
    'ruby',
    'spinel',
    'sapphire',
  ]

  const tl = gsap.timeline({
    paused: true
  })
    .to(overlay, {
      rotateY: 90,
      scale: 1.5,
      onComplete: () => {
        overlay.style.maskImage = `url(/assets/images/${frameSet[Number(flag)].mask}.svg)`
        overlay.classList.remove("overlay-sub")
        overlay.style.maskSize = flag ? '24%' : '26%'
        console.log('complete')
      },
    })
    .to(overlay, {
      rotateY: flag ? 180 : 0,
      scale: 1,
      onReverseComplete: () => {
        overlay.style.maskImage = `url(/assets/images/${frameSet[1 - Number(flag)].mask}.svg)`
        overlay.classList.add("overlay-sub")
        overlay.style.maskSize = flag ? '26%' : '24%'
        console.log('reverse')
      },
    })
    .to('.caption', {
      text: gemList[index + 1],
      onComplete: () => console.log("CAPTION ================ END")
    }, '<')


  // cardTl
  //   .to(overlay, {
  //     rotateY: 90,
  //     scale: 1.5,
  //     onComplete: () => {
  //       overlay.style.maskImage = `url(/assets/images/${frameSet[Number(flag)].mask}.svg)`
  //       console.log('complete')
  //     },
  //   })
  //   .to(overlay, {
  //     rotateY: flag ? 180 : 0,
  //     scale: 1,
  //     onReverseComplete: () => {
  //       overlay.style.maskImage = `url(/assets/images/${frameSet[1 - Number(flag)].mask}.svg)`
  //       console.log('reverse')
  //     },
  //   })
  //   .to('.caption', {
  //     text: gemList[index],
  //     onComplete: () => console.log("CAPTION ================ END")
  //   }, '<')
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