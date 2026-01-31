"use client";

// ============================================
// PageTransition - Animation d'entree de page
// ============================================
// Wrapper pour animer l'apparition du contenu des pages.
// Utilise framer-motion pour un fade-in avec leger slide.
//
// Usage:
//   import { PageTransition } from "@/components/layout/page-transition";
//
//   export default function MyPage() {
//     return (
//       <PageTransition>
//         <Container>...</Container>
//       </PageTransition>
//     );
//   }

import { motion, type HTMLMotionProps, type Transition } from "framer-motion";

interface PageTransitionProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
}

const defaultVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const defaultTransition: Transition = {
  duration: 0.2,
  ease: "easeOut",
};

export function PageTransition({
  children,
  variants = defaultVariants,
  transition = defaultTransition,
  ...props
}: PageTransitionProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      transition={transition}
      {...props}
    >
      {children}
    </motion.div>
  );
}
