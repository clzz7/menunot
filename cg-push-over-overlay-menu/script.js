import { gsap } from "gsap";
import Lenis from "lenis";

// Initialize smooth scrolling
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  direction: 'vertical',
  gestureDirection: 'vertical',
  smooth: true,
  mouseMultiplier: 1,
  smoothTouch: false,
  touchMultiplier: 2,
  infinite: false,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// Menu toggle functionality
class MenuToggle {
  constructor() {
    this.menuToggleBtn = document.querySelector('.menu-toggle-btn');
    this.menuOverlay = document.querySelector('.menu-overlay');
    this.menuHamburgerIcon = document.querySelector('.menu-hamburger-icon');
    this.menuLinks = document.querySelectorAll('.menu-link');
    this.menuTags = document.querySelectorAll('.menu-tag');
    this.menuMedia = document.querySelector('.menu-media-wrapper img');
    this.menuContent = document.querySelector('.menu-content-wrapper');
    
    this.isOpen = false;
    
    this.init();
  }
  
  init() {
    this.setupEventListeners();
    this.setupInitialStates();
  }
  
  setupEventListeners() {
    this.menuToggleBtn.addEventListener('click', () => {
      this.toggleMenu();
    });
    
    // Close menu when clicking outside
    this.menuOverlay.addEventListener('click', (e) => {
      if (e.target === this.menuOverlay) {
        this.closeMenu();
      }
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.closeMenu();
      }
    });
  }
  
  setupInitialStates() {
    gsap.set(this.menuOverlay, {
      clipPath: "circle(0% at 100% 0%)",
      visibility: "hidden"
    });
    
    gsap.set([this.menuLinks, this.menuTags], {
      y: 100,
      opacity: 0
    });
    
    gsap.set(this.menuMedia, {
      scale: 1.2,
      opacity: 0
    });
    
    gsap.set(this.menuContent, {
      x: 100,
      opacity: 0
    });
  }
  
  toggleMenu() {
    if (this.isOpen) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }
  
  openMenu() {
    this.isOpen = true;
    this.menuHamburgerIcon.classList.add('active');
    
    const tl = gsap.timeline();
    
    tl.set(this.menuOverlay, { visibility: "visible" })
      .to(this.menuOverlay, {
        clipPath: "circle(150% at 100% 0%)",
        duration: 0.8,
        ease: "power2.inOut"
      })
      .to(this.menuMedia, {
        scale: 1,
        opacity: 1,
        duration: 0.6,
        ease: "power2.out"
      }, "-=0.4")
      .to(this.menuContent, {
        x: 0,
        opacity: 1,
        duration: 0.6,
        ease: "power2.out"
      }, "-=0.4")
      .to([this.menuLinks, this.menuTags], {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out"
      }, "-=0.3");
  }
  
  closeMenu() {
    this.isOpen = false;
    this.menuHamburgerIcon.classList.remove('active');
    
    const tl = gsap.timeline();
    
    tl.to([this.menuLinks, this.menuTags], {
        y: -50,
        opacity: 0,
        duration: 0.3,
        stagger: 0.05,
        ease: "power2.in"
      })
      .to(this.menuContent, {
        x: 100,
        opacity: 0,
        duration: 0.4,
        ease: "power2.in"
      }, "-=0.2")
      .to(this.menuMedia, {
        scale: 1.2,
        opacity: 0,
        duration: 0.4,
        ease: "power2.in"
      }, "-=0.3")
      .to(this.menuOverlay, {
        clipPath: "circle(0% at 100% 0%)",
        duration: 0.6,
        ease: "power2.inOut"
      }, "-=0.2")
      .set(this.menuOverlay, { visibility: "hidden" });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new MenuToggle();
});