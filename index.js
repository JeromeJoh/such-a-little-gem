import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import { InertiaPlugin } from 'gsap/all';
import { TextPlugin } from 'gsap/all';
import frame from './assets/images/frame.svg';
import ellipse from './assets/images/ellipse.svg';

const THEME_CONGFIG = {
  golden: {
    color: '#efd162',
    gradient: 'linear-gradient(to left, transparent 0%, #efd162 80%, transparent 80%)'
  },
  silver: {
    color: '#ffffff',
    gradient: 'linear-gradient(to left, transparent 0%, #fff 80%, transparent 80%)'
  },
}

// 在 gsap 设置 overlay 时乘上 frame-size

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

const FRAME_CONFIG = [
  {
    mask: frame,
    color: 'silver'
  },
  {
    mask: ellipse,
    color: 'gold'
  }
]

const preloadMasks = () => {
  const sources = [frame, ellipse]

  const promises = sources.map(src => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
    })
  })

  return Promise.all(promises)
}

let GOLDEN_THEME_ON = false, JUST_SWITCH = false;

let distance = 0, inScrollArea = false;

let hoverLock = true;

gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(SplitText)
gsap.registerPlugin(MotionPathPlugin);
gsap.registerPlugin(MorphSVGPlugin);
gsap.registerPlugin(InertiaPlugin);
gsap.registerPlugin(TextPlugin);
// gsap.globalTimeline.timeScale(2);

const wrapper = document.querySelector('.wrapper');
const container = document.querySelector('.container');
const cards = gsap.utils.toArray('.card');
const decorLines = gsap.utils.toArray('.decor-line');

console.log('cards', cards.length);

const originalElement = document.querySelector('.overlay');

// 复制该元素（包括子元素）
const clonedElements = Array.from({ length: 3 }, () => {
  const clone = originalElement.cloneNode(true)
  clone.style.visibility = 'visible';
  return clone;
});

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

const init = async () => {
  resize();
  bindEvents();
  await preloadMasks();


  function moveToStart(container, n) {
    const children = container.children
    if (n < 0 || n >= children.length) return

    const target = children[n]
    container.insertBefore(target, children[0])
  }

  moveToStart(document.querySelector('.container'), 8)

  const originalElement = document.querySelector('.overlay');



  // 获取父容器元素
  const container = document.querySelector('main');

  // 将复制的元素插入到原始元素的下方
  clonedElements.forEach((clonedElement) => {
    container.insertBefore(clonedElement, originalElement.nextSibling);
  });

  gsap.set(originalElement, {
    opacity: 0,
  })
  gsap.fromTo(clonedElements, {
    scale: 0,
    duration: 1,
  }, {
    scale: 0.6,
    stagger: 0.2,
    onComplete: () => {
      console.log('Animation complete, showing original element');
      clonedElements.forEach(el => el.remove());
      gsap.set(originalElement, {
        opacity: 1,
        visibility: 'visible',
      })
      gsap.set('[class^="caption"]', {
        visibility: 'visible',
      })

    }
  })
  gsap.from(decorLines, {
    scaleX: 0,
    duration: 0.8,
    ease: 'power3.out',
  })
  sprinkle();
}

const bindEvents = () => {
  window.addEventListener('resize', resize);
}

const resize = () => {
  decorLines.forEach((line, index) => {
    // 根据实际需要调整 width 的计算方式
    const width = Math.sqrt(Math.pow(window.innerWidth, 2) / 4 + Math.pow(window.innerHeight, 2) / 4);
    line.style.width = `${width}px`;

    // 旋转角度计算
    const rotation = Math.atan2(window.innerHeight, window.innerWidth) * 180 / Math.PI;
    line.style.transform = `rotate(${rotation * (index % 3 === 0 ? 1 : -1)}deg)`;
  });

  // 计算 distance，确保它不会变得过大
  distance = container.offsetWidth - window.innerWidth;
  wrapper.style.height = `${Math.max(distance, 0)}px`; // 确保 distance 不为负值

  console.log('resize', container.offsetWidth, window.innerWidth, distance);

  // 如果需要，将 container 移动
  if (inScrollArea) {
    container.style.transform = `translateX(-${distance}px)`;
  }

  // 刷新 ScrollTrigger
  ScrollTrigger.refresh();
}

ScrollTrigger.create({
  trigger: wrapper,
  start: 'top top',
  end: 'bottom bottom',
  snap: {
    snapTo: 1 / (cards.length - 1),
    delay: 0,
    ease: 'power1.inOut'
  },
  onUpdate: self => {
    console.log("scroll progress", self.progress.toFixed(3), distance);
    container.style.transform = `translateX(-${distance * self.progress}px)`;
  },
  onEnter: () => {
    inScrollArea = true;
    hoverLock = true;
    console.log("========== Entered scroll area");
  },
  onLeave: () => {
    inScrollArea = false;
    console.log("========== Left scroll area");
  },
  onLeaveBack: () => {
    hoverLock = true;
  },
  onSnapComplete: () => {
    hoverLock = false;
    console.log("========== Snap area");
  }
})


init();


document.fonts.ready.then(() => {
  const split = new SplitText('.caption-intro', { type: 'chars' })

  const introTl = gsap.timeline({
    scrollTrigger: {
      trigger: document.body,
      start: 'top top',
      end: `${window.innerHeight}px top`,
      scrub: 0.1,
      snap: {
        snapTo: 1,
        delay: 0,
        ease: 'power3.out'
      },
      onEnterBack: () => {
        const currentColor = GOLDEN_THEME_ON ? THEME_CONGFIG.golden.color : THEME_CONGFIG.silver.color;
        gsap.set('.caption', { opacity: 0, color: currentColor })
        gsap.set('.caption-intro', { opacity: 1, color: currentColor })
        document.documentElement.style.setProperty('--theme-color', currentColor)
      }
    }
  })

  introTl
    .to(decorLines, {
      scaleX: 0,
    })
    .from(originalElement, {
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
      ease: 'power3.out',
      onComplete: () => {
        gsap.set('.caption', { opacity: 1 });
        gsap.set('.caption-intro', { opacity: 0 });
        hoverLock = false;
      }
    }, '<')

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

gsap.to("#shape", {
  duration: 0.5,
  morphSVG: { shape: octagonPath },
  ease: "power2.inOut",
  repeat: -1,
  yoyo: true
});

morphShape("#shape", octagonPath, {
  duration: 2,
})

// TODO: Responsive

const overlay = document.querySelector('.overlay');

cards.forEach((card, index) => {
  const gem = card.querySelector('#gem');
  const effects = card.querySelectorAll('.effect-group');
  let facades = card.querySelectorAll('article>div');
  if (index === 8) facades = card.querySelectorAll('article>.content-wrapper>div');
  console.log('GEM', index, facades.length, gemList[index]);

  const animatefacades = (facades) => {
    const res = Array.from(facades).map((facade) => {
      const tl = gsap.timeline({
        ease: "power3.inOut",
        paused: true
      });

      const angle = Math.random() * Math.PI * 2;
      const distance = 200 + Math.random() * 100;

      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;

      tl
        .to(facade, {
          x,
          y,
          rotation: () => gsap.utils.random(0, 360),
          // opacity: 0,
          duration: gsap.utils.clamp(0.5, 1, facades.length * 0.05),
          ease: "power1.out"
        })
        .to(effects, {
          opacity: 0,
          duration: 0.2
        }, '<')

      return tl;
    });
    return {
      play: () => res.forEach(tl => tl.play()),
      reverse: () => res.forEach(tl => tl.reverse()),
    };
  }

  const animateFactory = (facades) => {
    const tl = gsap.timeline({
      paused: true,
    });

    function scalePath(path, factor) {
      return path.replace(/-?\d+(\.\d+)?/g, n => parseFloat(n) * factor);
    }

    const original = "M 72 0 A122 134 0 0 0 72 240 A122 134 0 0 0 72 0";
    const scaled = scalePath(original, 1.5);
    const amplitude = 100  // 波浪高度
    const wavelength = 6  // 波长

    // 针对不同类型的定制特效，注重展示 imageless facade 的多样性
    switch (index) {
      case 0:
        tl
          .to(gem.querySelectorAll(':scope>div.facade'), {
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
            rotate: '45deg',
            top: '50%',
            xPercent: index => index < 4 ? -50 - 100 * (index + 1) : 50 + 100 * (index - 4),
            yPercent: -50,
            left: '50%',
          }, '<');
        break;
      case 1:
        tl
          .to(gem, {
            clipPath: 'none',
          })
          .to(gem.querySelectorAll(':scope>div'), {
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
            scaleX: 0.3,
          }, '<')
          .to(gem.querySelectorAll(':scope>div.facade'), {
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
            xPercent: index => index < 17 ? -50 - 30 * (index + 1) : -20 + 30 * (index - 17),
            rotate: 0,
            left: '50%',
          }, '<')
        break;
      case 3:
        tl
          .to(gem, {
            clipPath: 'none',
            rotate: 0,
          })
          .to(gem.querySelectorAll(':scope>div'), {
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
            scaleX: 0.3,
          }, '<')
          .to(gem.querySelectorAll(':scope>div.facade'), {
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
            xPercent: index => index < 17 ? -50 - 30 * (index + 1) : -20 + 30 * (index - 17),
            left: '50%',
            y: index => index < 17 ? 10 + Math.sin(index / wavelength) * amplitude : -40 + Math.sin(index / wavelength) * amplitude,

          }, '<')
        break;
      case 5:
        // const duplica = gem.cloneNode(true);
        // card.appendChild(duplica);
        tl
          .to(gem.querySelector('.square'), {
            duration: 0.5,
            ease: 'power3.inOut'
          })
          .
          to(gem, {
            clipPath: 'none',
          })
          .to(gem.querySelectorAll(':scope>div'), {
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
            rotate: 0,
            top: 0,
            left: index => index * 80,
          }, '<');
        break;
      case 7:
        tl
          .to(gem, {
            maskImage: 'none',
          })
          .to(gem.querySelectorAll(':scope>div'), {
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
            scaleX: 0.3,
          }, '<')
          .to(gem.querySelectorAll(':scope>div.facade'), {
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
            xPercent: index => index < 17 ? -50 - 30 * (index + 1) : -20 + 30 * (index - 17),
            left: '50%',
            y: index => index < 17 ? 10 + Math.sin(index / wavelength) * amplitude : -40 + Math.sin(index / wavelength) * amplitude,

          }, '<')
        break
      case 8:
        tl
          // .to(gem, {
          //   borderRadius: 0,
          //   rotation: 0,
          // })
          .to(facades, {
            rotation: 360,
            duration: 0.5,
            ease: 'power3.inOut'
          });
        break;
      default:
        break;
    }

    tl
      .to(card.querySelector('.effect-group'), {
        opacity: 0
      }, '<')
      .to('.overlay', {
        opacity: 0,
        scale: 1.05,
        ease: 'power3.inOut',
      }, '<')
      .to('.caption', {
        text: 'palette',
      }, '<');

    return {
      play: () => tl.play(),
      reverse: () => tl.reverse(),
    };
  }

  const { play, reverse } = [0, 1, 3, 5, 7, 8].includes(index) ? animateFactory(facades) : animatefacades(facades);

  gem.addEventListener('click', () => {
    !hoverLock && play();
  })

  gem.addEventListener('pointerleave', () => {
    console.log('pointer leave', index, hoverLock);
    !hoverLock && reverse();
  })

  const flag = index % 2 === 0;

  const cardTl = gsap.timeline({
    scrollTrigger: {
      trigger: wrapper,
      start: `${window.innerWidth * index}px top`,
      end: `${window.innerWidth * (index + 1)}px bottom`,
      scrub: 1,
      onUpdate: self => {
        // console.log("gem scroll", self.progress.toFixed(3), index, flag);
      },
      onEnter: _ => {
        console.log('card enter', index)
        sprinkle();
      },
      onEnterBack: _ => {
        console.log('card leave', index)
      }
    }
  })

  cardTl
    .to(overlay, {
      rotateY: 90,
      scale: 1.5,
      onComplete: () => {
        console.log('complete', GOLDEN_THEME_ON);
        overlay.style.maskImage = `url(${FRAME_CONFIG[Number(flag)].mask})`;
        overlay.style.maskSize = flag ? '24%' : '26%';
        JUST_SWITCH = false;
      },
    })
    .to(overlay, {
      rotateY: flag ? 180 : 0,
      scale: 1,
      onReverseComplete: () => {
        console.log('reverse', GOLDEN_THEME_ON, JUST_SWITCH);
        overlay.style.maskImage = `url(${FRAME_CONFIG[1 - Number(flag)].mask})`;
        overlay.style.maskSize = flag ? '26%' : '24%';
        if (!JUST_SWITCH) {
          GOLDEN_THEME_ON = !GOLDEN_THEME_ON;
          const currentColor = GOLDEN_THEME_ON ? THEME_CONGFIG.golden.color : THEME_CONGFIG.silver.color;
          overlay.classList.toggle("overlay-sub");
          gsap.to(['header', '.caption', 'footer'], {
            color: currentColor,
            onComplete: () => {
              JUST_SWITCH = true;
            }
          });
          document.documentElement.style.setProperty('--theme-color', currentColor);
        };

      },
    })
    .to('.caption', {
      text: gemList[index + 1],
    }, '<');
})

const rootFontSize = getComputedStyle(document.documentElement).fontSize;
console.log('rootFontSize', rootFontSize);