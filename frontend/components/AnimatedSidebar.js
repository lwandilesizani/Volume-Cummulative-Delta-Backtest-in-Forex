"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Home, BarChart3, Zap, TrendingUp } from "lucide-react";
import { useRouter } from "next/router";

const SidebarContext = createContext(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...props} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <motion.div
      className={cn(
        "h-screen px-4 py-6 hidden md:flex md:flex-col bg-[#0f1629] border-r border-[#1e222d] flex-shrink-0 fixed left-0 top-0 z-50 overflow-hidden",
        className
      )}
      animate={{
        width: animate ? (open ? "260px" : "70px") : "260px",
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}) => {
  const { open, setOpen } = useSidebar();
  return (
    <>
      <div
        className={cn(
          "h-16 px-4 py-4 flex flex-row md:hidden items-center justify-between bg-[#0f1629] border-b border-[#1e222d] w-full fixed top-0 left-0 z-40"
        )}
        {...props}
      >
        <div className="flex justify-between items-center w-full">
          <span className="text-xl font-bold text-white">Volume Delta</span>
          <Menu
            className="text-white cursor-pointer"
            onClick={() => setOpen(!open)}
          />
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className={cn(
                "fixed h-full w-full inset-0 bg-[#0a0e27] p-10 z-[100] flex flex-col justify-between",
                className
              )}
            >
              <div
                className="absolute right-10 top-10 z-50 text-white cursor-pointer"
                onClick={() => setOpen(!open)}
              >
                <X />
              </div>
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export const SidebarLink = ({
  link,
  className,
  ...props
}) => {
  const { open, animate } = useSidebar();
  const router = useRouter();
  const isActive = router.pathname === link.href;

  return (
    <Link
      href={link.href}
      className={cn(
        "flex items-center justify-start gap-3 group/sidebar py-3 px-3 rounded-lg transition-all duration-200",
        isActive
          ? "bg-[#2962ff] text-white"
          : "text-[#9ca3af] hover:bg-[#1a1f35] hover:text-white",
        className
      )}
      {...props}
    >
      <div className={cn(
        "transition-transform duration-200",
        !isActive && "group-hover/sidebar:scale-110"
      )}>
        {link.icon}
      </div>
      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className={cn(
          "text-sm font-medium whitespace-pre inline-block !p-0 !m-0 transition-transform duration-200",
          !isActive && "group-hover/sidebar:translate-x-1"
        )}
      >
        {link.label}
      </motion.span>
    </Link>
  );
};

// Complete Sidebar Component with Navigation
export function AnimatedSidebarDemo() {
  const links = [
    {
      label: "Start",
      href: "/",
      icon: <Home className="w-5 h-5" />,
    },
    {
      label: "Charts",
      href: "/charts",
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      label: "Backtest",
      href: "/backtest",
      icon: <Zap className="w-5 h-5" />,
    },
  ];

  const [open, setOpen] = useState(false);

  return (
    <Sidebar open={open} setOpen={setOpen} animate={true}>
      <SidebarBody className="justify-between gap-10">
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          {/* Logo and Title */}
          <motion.div
            className="flex flex-col gap-2 mb-8 mt-2"
            animate={{
              alignItems: open ? "flex-start" : "center",
            }}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#2962ff] to-[#26a69a] rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <motion.span
                animate={{
                  display: open ? "inline-block" : "none",
                  opacity: open ? 1 : 0,
                }}
                className="text-xl font-bold text-white whitespace-nowrap"
              >
                Volume Delta
              </motion.span>
            </div>
            <motion.p
              animate={{
                display: open ? "block" : "none",
                opacity: open ? 1 : 0,
              }}
              className="text-xs text-[#6b7280]"
            >
              Trading System
            </motion.p>
          </motion.div>

          {/* Navigation Links */}
          <div className="flex flex-col gap-2">
            {links.map((link, idx) => (
              <SidebarLink key={idx} link={link} />
            ))}
          </div>
        </div>

        {/* Footer Info */}
        <div className="border-t border-[#1e222d] pt-4">
          <motion.div
            animate={{
              opacity: open ? 1 : 0,
              display: open ? "flex" : "none",
            }}
            className="flex flex-col gap-3"
          >
            <div className="flex flex-col gap-1">
              <p className="text-xs text-[#6b7280] uppercase tracking-wide font-medium">
                Market
              </p>
              <p className="text-sm text-white font-semibold">Gold (GC)</p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-xs text-[#6b7280] uppercase tracking-wide font-medium">
                Data Range
              </p>
              <p className="text-sm text-white font-semibold">2020-2023</p>
            </div>
          </motion.div>

          {/* Collapsed state - just icons */}
          <motion.div
            animate={{
              opacity: open ? 0 : 1,
              display: open ? "none" : "flex",
            }}
            className="flex flex-col items-center gap-2"
          >
            <div className="w-8 h-8 rounded-full bg-[#1a1f35] flex items-center justify-center">
              <span className="text-sm font-bold text-[#26a69a]">GC</span>
            </div>
          </motion.div>
        </div>
      </SidebarBody>
    </Sidebar>
  );
}
