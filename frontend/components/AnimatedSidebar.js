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
        "h-full px-4 py-4 hidden md:flex md:flex-col bg-[#0f1629] flex-shrink-0",
        className
      )}
      animate={{
        width: animate ? (open ? "280px" : "70px") : "280px",
      }}
      transition={{
        duration: 0.3,
        ease: "easeInOut",
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
          "h-16 px-4 flex flex-row md:hidden items-center justify-between bg-[#0f1629] w-full border-b border-[#1e2139]"
        )}
        {...props}
      >
        <div className="flex items-center gap-3">
          <div className="h-6 w-7 bg-gradient-to-br from-[#2962ff] to-[#26a69a] rounded-lg flex-shrink-0" />
          <span className="font-semibold text-white text-lg">Volume Delta</span>
        </div>
        <button
          className="p-2 rounded-lg hover:bg-[#1e2139] transition-colors"
          onClick={() => setOpen(!open)}
        >
          <Menu className="text-white h-5 w-5" />
        </button>
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
                "fixed h-full w-full inset-0 bg-[#0f1629] p-6 z-[100] flex flex-col",
                className
              )}
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-7 bg-gradient-to-br from-[#2962ff] to-[#26a69a] rounded-lg flex-shrink-0" />
                  <span className="font-semibold text-white text-lg">Volume Delta</span>
                </div>
                <button
                  className="p-2 rounded-lg hover:bg-[#1e2139] transition-colors"
                  onClick={() => setOpen(!open)}
                >
                  <X className="text-white h-5 w-5" />
                </button>
              </div>
              <div className="flex-1">
                {children}
              </div>
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
        isActive ? "bg-[#2962ff]/20 border-l-4 border-[#2962ff]" : "hover:bg-[#1e2139]",
        className
      )}
      {...props}
    >
      <div className={cn(
        "flex-shrink-0",
        isActive ? "text-[#2962ff]" : "text-neutral-400"
      )}>
        {link.icon}
      </div>

      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className={cn(
          "text-sm transition duration-150 whitespace-pre inline-block !p-0 !m-0",
          isActive ? "text-[#2962ff] font-semibold" : "text-neutral-200 group-hover/sidebar:text-white"
        )}
      >
        {link.label}
      </motion.span>
    </Link>
  );
};

// Complete Sidebar Component with Navigation
export function AnimatedSidebarDemo({ children }) {
  const links = [
    {
      label: "Start",
      href: "/",
      icon: <Home className="h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Charts",
      href: "/charts",
      icon: <BarChart3 className="h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Backtest",
      href: "/backtest",
      icon: <Zap className="h-5 w-5 flex-shrink-0" />,
    },
  ];

  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        "flex flex-col md:flex-row bg-[#0a0e27] w-full flex-1",
        "min-h-screen"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {/* Logo and Title */}
            <motion.div
              animate={{
                padding: open ? "0" : "0 8px",
              }}
            >
              {open ? <Logo /> : <LogoIcon />}
            </motion.div>
            <div className="mt-8 flex flex-col gap-1">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>

          {/* Footer Info */}
          <div className="border-t border-[#1e2139] pt-4">
            <div className="px-3 py-2">
              <motion.div
                animate={{
                  opacity: open ? 1 : 0,
                }}
                className="flex flex-col gap-1"
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="text-[#2962ff] h-4 w-4" />
                  <span className="text-xs text-neutral-400">Market</span>
                </div>
                <span className="text-sm text-white font-medium">Gold (GC)</span>
                <span className="text-xs text-neutral-500">2020-2023</span>
              </motion.div>
              {!open && (
                <div className="flex justify-center">
                  <TrendingUp className="text-[#2962ff] h-5 w-5" />
                </div>
              )}
            </div>
          </div>
        </SidebarBody>
      </Sidebar>
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <div className="p-6 md:p-8 bg-[#0a0e27] flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

export const Logo = () => {
  return (
    <Link
      href="/"
      className="font-normal flex space-x-2 items-center text-sm py-2 px-3 relative z-20"
    >
      <div className="h-6 w-7 bg-gradient-to-br from-[#2962ff] to-[#26a69a] rounded-lg flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-semibold text-white whitespace-pre text-lg"
      >
        Volume Delta
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      href="/"
      className="font-normal flex justify-center items-center text-sm py-2 relative z-20"
    >
      <div className="h-6 w-7 bg-gradient-to-br from-[#2962ff] to-[#26a69a] rounded-lg flex-shrink-0" />
    </Link>
  );
};
