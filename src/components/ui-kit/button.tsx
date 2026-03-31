import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { LoaderCircle } from 'lucide-react';

const buttonVariants = cva(
  'button-text-select inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[6px] text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*="size-"])]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary hover:bg-primary-600 text-white shadow',
        destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline:
          'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 px-3 text-xs has-[>svg]:px-2.5',
        lg: 'h-10 px-8 has-[>svg]:px-4',
        icon: 'h-9 w-9',
        'icon-sm': 'h-8 w-8',
        'icon-lg': 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  children,
  onClick,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    loading?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';

  // Help the user select text in the button, need this for the uilm extension edge cases
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Check if user is selecting text - if so, prevent button click
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // Otherwise, trigger the original onClick handler if it exists
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
      onClick={handleClick}
    >
      {loading && <LoaderCircle className="animate-spin" />}
      {children}
    </Comp>
  );
}

export { Button, buttonVariants };
