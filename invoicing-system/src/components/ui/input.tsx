import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        sm: "h-9 px-3 text-xs",
        md: "h-10 px-3",
        lg: "h-11 px-4 text-base",
      },
      rounded: {
        default: "rounded-md",
        full: "rounded-full",
        none: "rounded-none",
      },
    },
    defaultVariants: {
      size: "md",
      rounded: "default",
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, size, rounded, type, leftIcon, rightIcon, ...props }, ref) => {
    const hasLeft = Boolean(leftIcon)
    const hasRight = Boolean(rightIcon)
    return (
      <div className={cn("relative", hasLeft || hasRight ? "" : undefined)}>
        {hasLeft ? (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
            {leftIcon}
          </span>
        ) : null}
        <input
          type={type}
          className={cn(
            inputVariants({ size, rounded }),
            hasLeft ? "pl-9" : undefined,
            hasRight ? "pr-9" : undefined,
            className
          )}
          ref={ref}
          {...props}
        />
        {hasRight ? (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
            {rightIcon}
          </span>
        ) : null}
      </div>
    )
  }
)
Input.displayName = "Input"

const InputGroup = ({ className, children }: React.PropsWithChildren<{ className?: string }>) => (
  <div className={cn("flex items-center gap-2", className)}>{children}</div>
)

const InputAddon = ({ className, children }: React.PropsWithChildren<{ className?: string }>) => (
  <span className={cn("text-muted-foreground", className)}>{children}</span>
)

export { Input, InputGroup, InputAddon, inputVariants }