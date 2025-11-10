import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground",
  {
    variants: {
      variant: {
        default: "shadow-sm",
        outline: "border-2",
        flat: "shadow-none",
        elevated: "shadow-md hover:shadow-lg transition-shadow duration-200",
        interactive: "hover:border-primary/50 cursor-pointer transition-all duration-200 hover:translate-y-[-2px]",
      },
      padding: {
        default: "",
        sm: "",
        lg: "",
        none: "p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
    },
    compoundVariants: [
      {
        padding: "sm",
        className: "[&>div:first-child]:p-4 [&>div:not(:first-child)]:p-4 [&>div:not(:first-child)]:pt-0",
      },
      {
        padding: "default",
        className: "[&>div:first-child]:p-6 [&>div:not(:first-child)]:p-6 [&>div:not(:first-child)]:pt-0",
      },
      {
        padding: "lg",
        className: "[&>div:first-child]:p-8 [&>div:not(:first-child)]:p-8 [&>div:not(:first-child)]:pt-0",
      },
    ],
  }
)

interface CardProps extends
  React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<
  HTMLDivElement,
  CardProps
>(({ className, variant, padding, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(cardVariants({ variant, padding, className }))}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & { as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' }
>(({ className, as: Comp = 'h3', ...props }, ref) => {
  const Component = Comp as any
  return (
    <Component
      ref={ref}
      className={cn(
        "font-semibold leading-none tracking-tight",
        Comp === 'h1' && "text-3xl",
        Comp === 'h2' && "text-2xl",
        Comp === 'h3' && "text-xl",
        Comp === 'h4' && "text-lg",
        Comp === 'h5' && "text-base",
        Comp === 'h6' && "text-sm",
        className
      )}
      {...props}
    />
  )
})
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn(className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center justify-end gap-2", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
