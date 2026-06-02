'use client';

import { motion } from 'framer-motion';

export default function Button({
  children,
  variant = 'primary',
  className = '',
  href,
  onClick,
  type = 'button',
  ...props
}) {
  const base =
    'inline-flex items-center justify-center font-body text-sm font-medium transition-colors duration-300';

  const variants = {
    primary:
      'rounded-full bg-primary-container px-8 py-3 text-white hover:bg-secondary',
    secondary:
      'rounded-full border border-sand bg-transparent px-8 py-3 text-charcoal hover:bg-surface-container',
    outline:
      'rounded-md border border-charcoal bg-transparent px-6 py-3 text-charcoal hover:bg-surface-container',
    checkout:
      'rounded-md bg-primary-container px-8 py-3 text-white hover:bg-secondary',
    flat:
      'rounded-none bg-primary-container py-2 text-xs uppercase tracking-wider text-white hover:bg-secondary',
  };

  const classes = `${base} ${variants[variant] || variants.primary} ${className}`;

  if (href) {
    return (
      <motion.a
        href={href}
        className={classes}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        {...props}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      type={type}
      className={classes}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
