'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { FiMoreVertical } from 'react-icons/fi';

export default function ActionMenu({ actions = [], label = 'Open actions' }) {
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (menuRef.current?.contains(event.target) || buttonRef.current?.contains(event.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const updatePosition = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      setMenuPosition({
        top: rect.bottom + 4,
        right: Math.max(8, window.innerWidth - rect.right),
      });
    };
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open]);

  const itemClass = (action) => `flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-charcoal-50 ${
    action.danger ? 'text-error' : action.success ? 'text-forest-800' : 'text-charcoal-700'
  }`;

  const menu = open && typeof document !== 'undefined' ? createPortal(
    <div
      ref={menuRef}
      className="fixed z-[100] w-44 rounded border border-border bg-white py-1 shadow-lg"
      style={{ top: menuPosition.top, right: menuPosition.right }}
    >
      {actions.map((action) => {
        const Icon = action.icon;
        const content = (
          <>
            {Icon && <Icon size={14} />}
            {action.label}
          </>
        );

        if (action.href) {
          return (
            <Link key={action.label} href={action.href} className={itemClass(action)} onClick={() => setOpen(false)}>
              {content}
            </Link>
          );
        }

        return (
          <button
            key={action.label}
            type="button"
            disabled={action.disabled}
            onClick={() => {
              setOpen(false);
              action.onClick?.();
            }}
            className={`${itemClass(action)} disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {content}
          </button>
        );
      })}
    </div>,
    document.body,
  ) : null;

  return (
    <div className="flex justify-end">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-8 w-8 items-center justify-center rounded border border-border text-charcoal-700 hover:bg-charcoal-50"
        aria-label={label}
      >
        <FiMoreVertical size={16} />
      </button>
      {menu}
    </div>
  );
}
