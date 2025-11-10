import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex w-full border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        default: "h-10 px-3 py-2",
        sm: "h-9 px-3 py-1 text-xs",
        lg: "h-11 px-4 py-3 text-base",
      },
      variant: {
        default: "rounded-md",
        underlined: "rounded-none border-0 border-b focus:border-b-2 px-0",
        pill: "rounded-full",
      },
      state: {
        default: "",
        error: "border-destructive focus-visible:ring-destructive/50",
        success: "border-green-500 focus-visible:ring-green-500/50",
      }
    },
    defaultVariants: {
      size: "default",
      variant: "default",
      state: "default",
    }
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
  Omit<VariantProps<typeof inputVariants>, 'size'> {
  inputSize?: 'default' | 'sm' | 'lg'
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  containerClassName?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, inputSize = "default", variant, state, leftIcon, rightIcon, containerClassName, ...props }, ref) => {
    if (leftIcon || rightIcon) {
      return (
        <div className={cn(
          "relative flex items-center",
          containerClassName
        )}>
          {leftIcon && (
            <div className="absolute left-3 flex h-full items-center text-muted-foreground">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              inputVariants({ size: inputSize, variant, state }),
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              className
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 flex h-full items-center text-muted-foreground">
              {rightIcon}
            </div>
          )}
        </div>
      )
    }

    return (
      <input
        type={type}
        className={cn(
          inputVariants({ size: inputSize, variant, state }),
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        className={cn(
          "flex flex-row items-stretch rounded-md",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    )
  }
)
InputGroup.displayName = "InputGroup"

interface InputAddonProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const InputAddon = React.forwardRef<HTMLDivElement, InputAddonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        className={cn(
          "flex items-center justify-center border border-input bg-muted px-3 text-sm text-muted-foreground",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    )
  }
)
InputAddon.displayName = "InputAddon"

export { Input, InputGroup, InputAddon, inputVariants }
