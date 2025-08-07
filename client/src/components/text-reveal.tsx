"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useIsMobile } from "@/hooks/use-mobile";

gsap.registerPlugin(SplitText, ScrollTrigger);

interface TextRevealProps {
  children: React.ReactNode;
  animateOnScroll?: boolean;
  delay?: number;
  stagger?: number;
  duration?: number;
  ease?: string;
  triggerStart?: string;
  className?: string;
}

export default function TextReveal({ 
  children, 
  animateOnScroll = true, 
  delay = 0,
  stagger = 0.1,
  duration = 1,
  ease = "power4.out",
  triggerStart = "top 75%",
  className = ""
}: TextRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const elementRefs = useRef<HTMLElement[]>([]);
  const splitRefs = useRef<any[]>([]);
  const lines = useRef<HTMLElement[]>([]);
  const isMobile = useIsMobile();

  // Otimizações para mobile
  const mobileOptimizedDuration = isMobile ? duration * 0.7 : duration;
  const mobileOptimizedStagger = isMobile ? stagger * 0.8 : stagger;
  const mobileOptimizedEase = isMobile ? "power2.out" : ease;

  useGSAP(
    () => {
      if (!containerRef.current) return;

      splitRefs.current = [];
      lines.current = [];
      elementRefs.current = [];

      let elements: HTMLElement[] = [];
      if (containerRef.current.hasAttribute("data-text-reveal-wrapper")) {
        elements = Array.from(containerRef.current.children) as HTMLElement[];
      } else {
        elements = [containerRef.current];
      }

      elements.forEach((element) => {
        elementRefs.current.push(element);

        // Store original styles before splitting
        const originalStyles = {
          color: window.getComputedStyle(element).color,
          fontWeight: window.getComputedStyle(element).fontWeight,
          fontSize: window.getComputedStyle(element).fontSize,
          lineHeight: window.getComputedStyle(element).lineHeight,
        };

        const split = SplitText.create(element, {
          type: "lines",
          mask: "lines",
          linesClass: "line++",
          lineThreshold: 0.1,
        });

        splitRefs.current.push(split);

        // Preserve styles on split lines
        split.lines.forEach((line: HTMLElement) => {
          // Copy classes from original element to preserve styling
          const originalClasses = element.className;
          if (originalClasses) {
            line.className += ` ${originalClasses}`;
          }
          
          // Apply original styles to ensure consistency
          Object.assign(line.style, originalStyles);

          // Hardware acceleration e otimizações
          if (isMobile) {
            Object.assign(line.style, {
              willChange: 'transform',
              backfaceVisibility: 'hidden',
              perspective: '1000px'
            });
          }
        });

        const computedStyle = window.getComputedStyle(element);
        const textIndent = computedStyle.textIndent;

        if (textIndent && textIndent !== "0px") {
          if (split.lines.length > 0) {
            split.lines[0].style.paddingLeft = textIndent;
          }
          element.style.textIndent = "0";
        }

        lines.current.push(...split.lines);
      });

      gsap.set(lines.current, { 
        y: "100%",
        force3D: true
      });

      const animationProps = {
        y: "0%",
        duration: mobileOptimizedDuration,
        stagger: mobileOptimizedStagger,
        ease: mobileOptimizedEase,
        delay: delay,
        force3D: true
      };

      if (animateOnScroll) {
        gsap.to(lines.current, {
          ...animationProps,
          scrollTrigger: {
            trigger: containerRef.current,
            start: triggerStart,
            once: true,
          },
        });
      } else {
        gsap.to(lines.current, animationProps);
      }

      return () => {
        // Cleanup das otimizações móveis
        if (isMobile) {
          lines.current.forEach((line) => {
            if (line && line.style) {
              line.style.willChange = 'auto';
              line.style.backfaceVisibility = 'visible';
              line.style.perspective = 'none';
            }
          });
        }

        splitRefs.current.forEach((split) => {
          if (split) {
            split.revert();
          }
        });
      };
    },
    { scope: containerRef, dependencies: [animateOnScroll, delay, stagger, duration, ease, triggerStart, isMobile, mobileOptimizedDuration, mobileOptimizedStagger, mobileOptimizedEase] }
  );

  if (React.Children.count(children) === 1) {
    return React.cloneElement(children as React.ReactElement, { 
      ref: containerRef,
      className: `${(children as React.ReactElement).props.className || ''} ${className}`.trim()
    });
  }

  return (
    <div ref={containerRef} data-text-reveal-wrapper="true" className={className}>
      {children}
    </div>
  );
}