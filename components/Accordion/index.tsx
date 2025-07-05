'use client';

import { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface AccordionProps {
  title: string | ReactNode;
  icon: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}

export default function Accordion({
  title,
  icon,
  children,
  defaultOpen = true,
}: AccordionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultOpen);

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden my-2">
      <button
        type="button"
        className="w-full flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
            {title}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 0 : -90 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-zinc-500" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="content"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, height: 'auto' },
              collapsed: { opacity: 0, height: 0 },
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="p-3 text-sm"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 