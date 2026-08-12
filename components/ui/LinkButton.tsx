import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { buttonClasses, type ButtonStyleOptions } from "./Button";

export interface LinkButtonProps
  extends Omit<ComponentProps<typeof Link>, "className">,
    ButtonStyleOptions {
  children: ReactNode;
}

/** A navigation control that looks like a button but stays a real link. */
export function LinkButton({
  variant,
  size,
  fullWidth,
  className,
  children,
  ...props
}: LinkButtonProps) {
  return (
    <Link className={buttonClasses({ variant, size, fullWidth, className })} {...props}>
      {children}
    </Link>
  );
}
