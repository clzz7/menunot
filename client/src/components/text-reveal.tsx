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

      gsap.set(lines.current, { y: "100%" });

      // Configurações otimizadas para mobile
      const mobileOptimizations = isMobile ? {
        duration: Math.min(duration * 0.7, 0.8), // Reduz duração em 30% mas não menos que 0.8s
        stagger: Math.max(stagger * 0.6, 0.05), // Reduz stagger mas mantém mínimo
        ease: "power2.out", // Ease mais leve para mobile
        force3D: false, // Desabilita aceleração 3D que pode causar lag
        lazy: false, // Força cálculo imediato
      } : {
        force3D: true,
        lazy: true,
      };

      const animationProps = {
        y: "0%",
        duration: duration,
        stagger: stagger,
        ease: ease,
        delay: delay,
        ...mobileOptimizations,
      };

      if (animateOnScroll) {
        gsap.to(lines.current, {
          ...animationProps,
          scrollTrigger: {
            trigger: containerRef.current,
            start: triggerStart,
            once: true,
            invalidateOnRefresh: !isMobile, // Desabilita refresh em mobile
            fastScrollEnd: isMobile, // Otimização para scroll rápido
          },
        });
      } else {
        gsap.to(lines.current, animationProps);
      }

      return () => {
        splitRefs.current.forEach((split) => {
          if (split) {
            split.revert();
          }
        });
      };
    },
    { scope: containerRef, dependencies: [animateOnScroll, delay, stagger, duration, ease, triggerStart] }
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