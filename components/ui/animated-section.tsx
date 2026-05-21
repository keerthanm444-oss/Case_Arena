'use client';

import { motion } from 'framer-motion';
import { slideUp, staggerContainer } from '@/lib/motion';

export function AnimatedContainer({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedSection({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <motion.div variants={slideUp} className={className}>
      {children}
    </motion.div>
  );
}
