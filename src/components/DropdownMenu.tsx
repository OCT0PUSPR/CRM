
import React, { useState, useRef, useEffect, createContext, useContext } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const DropdownContext = createContext<{ isOpen: boolean; setIsOpen: (o: boolean) => void } | null>(null);

export const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <DropdownContext.Provider value={{ isOpen, setIsOpen }}>
            <div className="relative inline-block text-left">{children}</div>
        </DropdownContext.Provider>
    );
};

export const DropdownMenuTrigger = ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => {
    const context = useContext(DropdownContext);
    if (!context) return null;
    return (
        <div onClick={(e) => {
            e.stopPropagation();
            context.setIsOpen(!context.isOpen);
        }}>
            {children}
        </div>
    );
};

export const DropdownMenuContent = ({ children, align, className }: { children: React.ReactNode; align?: string; className?: string }) => {
    const context = useContext(DropdownContext);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                context?.setIsOpen(false);
            }
        };
        if (context?.isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [context]);

    return (
        <AnimatePresence>
            {context?.isOpen && (
                <motion.div 
                    ref={ref}
                    initial={{ opacity: 0, scale: 0.95, y: 10, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, scale: 0.95, y: 10, filter: 'blur(10px)' }}
                    transition={{ type: "spring", damping: 20, stiffness: 300 }}
                    className={`absolute ${align === 'start' ? 'left-0' : 'right-0'} mt-3 z-[150] origin-top bg-white dark:bg-premium-900 rounded-[28px] shadow-[0_40px_100px_rgba(0,0,0,0.18)] border border-premium-100 dark:border-premium-800 ${className}`}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export const DropdownMenuItem = ({ children, onClick, className }: { children: React.ReactNode; onClick?: () => void; className?: string }) => {
    const context = useContext(DropdownContext);
    return (
        <div 
            onClick={(e) => {
                e.stopPropagation();
                onClick?.();
                context?.setIsOpen(false);
            }}
            className={`cursor-pointer px-4 py-3 transition-all duration-200 hover:bg-premium-50 dark:hover:bg-premium-800 flex items-center gap-3 ${className}`}
        >
            {children}
        </div>
    );
};

export const DropdownMenuSeparator = ({ className }: { className?: string }) => (
    <div className={`h-px bg-premium-100 dark:bg-premium-800 my-2 ${className}`} />
);

export const DropdownMenuCheckboxItem = ({ children, checked, onCheckedChange, className }: { children: React.ReactNode; checked: boolean; onCheckedChange: () => void; className?: string }) => {
    return (
        <div 
            onClick={(e) => {
                e.stopPropagation();
                onCheckedChange();
            }}
            className={`cursor-pointer px-4 py-3 flex items-center justify-between transition-all duration-200 hover:bg-premium-50 dark:hover:bg-premium-800 ${className}`}
        >
            {children}
            <div className={`w-2 h-2 rounded-full transition-all duration-300 ${checked ? 'bg-brand-indigo scale-125' : 'bg-premium-200 dark:bg-premium-700 scale-100'}`} />
        </div>
    );
};
