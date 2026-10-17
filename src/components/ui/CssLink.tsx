"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface CssLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
  className?: string;
  external?: boolean;
}

export function CssLink({
  href,
  children,
  className,
  external = false,
  ...props
}: CssLinkProps) {
  const isExternal = external || href.startsWith("http") || href.startsWith("mailto:");

  const content = (
    <>
      <span>{children}</span>
      {isExternal && (
        <svg
          className="ml-1 inline-block size-3 -translate-y-0.5 opacity-60 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-1 group-hover:opacity-100"
          fill="none"
          viewBox="0 0 10 10"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M1.004 9.166 9.337.833m0 0v8.333m0-8.333H1.004"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </>
  );

  const baseClasses = cn(
    "group relative inline-flex items-center text-zinc-300 hover:text-white transition-colors duration-200 cursor-pointer",
    "before:pointer-events-none before:absolute before:bottom-0 before:left-0 before:h-[1px] before:w-full before:bg-zinc-400 before:content-['']",
    "before:origin-right before:scale-x-0 before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.4,0,0.2,1)]",
    "hover:before:origin-left hover:before:scale-x-100",
    className
  );

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={baseClasses}
        {...props}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={baseClasses} {...props}>
      {content}
    </Link>
  );
}

export default CssLink;
