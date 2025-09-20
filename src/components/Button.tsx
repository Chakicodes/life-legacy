import { cn } from '@/lib/utils';
import Link, { type LinkProps } from 'next/link';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

type Variant = 'primary' | 'secondary';

type BaseProps = {
  variant?: Variant;
  className?: string;
  children: ReactNode;
  isDisabled?: boolean;
};

type ButtonAsButton = BaseProps &
  ComponentPropsWithoutRef<'button'> & {
    href?: undefined;
  };

type ButtonAsLink = BaseProps &
  Omit<ComponentPropsWithoutRef<'a'>, 'href'> &
  LinkProps & {
    href: LinkProps['href'];
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const baseClasses =
  'px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60';
const variants: Record<Variant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
  secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-400',
};

export function Button(props: ButtonProps) {
  if ('href' in props && props.href !== undefined) {
    const {
      className,
      variant = 'primary',
      href,
      children,
      isDisabled,
      onClick,
      tabIndex,
      target,
      rel,
      ...rest
    } = props;
    const computedRel = target === '_blank' ? (rel ?? 'noopener noreferrer') : rel;
    return (
      <Link
        href={href}
        className={cn(
          baseClasses,
          variants[variant],
          className,
          isDisabled && 'opacity-60 cursor-not-allowed pointer-events-none',
        )}
        aria-disabled={isDisabled || undefined}
        tabIndex={isDisabled ? -1 : tabIndex}
        target={target}
        rel={computedRel}
        onClick={
          isDisabled
            ? (e) => {
                e.preventDefault();
                e.stopPropagation();
              }
            : onClick
        }
        {...rest}
      >
        {children}
      </Link>
    );
  }

  const {
    className,
    variant = 'primary',
    type = 'button',
    children,
    isDisabled,
    disabled,
    ...rest
  } = props;
  return (
    <button
      type={type}
      disabled={isDisabled || disabled}
      className={cn(baseClasses, variants[variant], className)}
      {...rest}
    >
      {children}
    </button>
  );
}
