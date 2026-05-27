// components/ui/Heading.tsx
"use client";
import { forwardRef, type HTMLAttributes } from "react";

type Level = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

type Props = HTMLAttributes<HTMLHeadingElement> & {
  as?: Level;              // default h2
  base?: string;           // common classes (optional)
  className?: string;      // extra classes
};

const BASE_DEFAULT = "font-serif";

const styles: Record<Level, string> = {
  h1: "text-4xl sm:text-5xl font-bold tracking-tight text-themeTeal",
  h2: "text-3xl sm:text-4xl font-semibold tracking-tight text-themeTeal",
  h3: "text-2xl sm:text-3xl font-semibold text-themeTeal",
  h4: "text-xl sm:text-2xl font-medium text-themeTeal",
  h5: "text-lg font-medium text-themeTeal",
  h6: "text-base font-medium uppercase text-themeTeal",
};

const Heading = forwardRef<HTMLHeadingElement, Props>(
  ({ as = "h2", base = BASE_DEFAULT, className = "", children, ...rest }, ref) => {
    const Comp = as;
    return (
      <Comp ref={ref} className={`${base} ${styles[as]} ${className}`.trim()} {...rest}>
        {children}
      </Comp>
    );
  }
);

Heading.displayName = "Heading";
export default Heading;
