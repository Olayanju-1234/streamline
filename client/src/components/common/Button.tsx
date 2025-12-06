import { ButtonHTMLAttributes, forwardRef } from 'react';
import { useCommandStore } from '../../store/useCommandStore';

type ButtonVariant = 'primary' | 'secondary' | 'terminal' | 'chip' | 'chip-active' | 'icon';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
        const mode = useCommandStore((state) => state.mode);

        const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

        const sizeStyles: Record<ButtonSize, string> = {
            sm: 'px-3 py-1.5 text-sm',
            md: 'px-4 py-2 text-base',
            lg: 'px-6 py-3 text-lg',
        };

        const variantStyles: Record<ButtonVariant, string> = {
            primary: mode === 'curator'
                ? 'bg-[#111] text-white hover:bg-[#333]'
                : 'bg-[#00FF41] text-[#050505] hover:bg-[#00cc33] font-semibold',
            secondary: mode === 'curator'
                ? 'bg-white text-[#111] border border-[#111] hover:bg-gray-50'
                : 'bg-[#050505] text-white border border-white/20 hover:border-white/40',
            terminal: 'bg-[#050505] text-white border border-white/20 hover:border-white/40',
            chip: 'px-4 py-2 bg-[#050505] text-white border border-white/20 hover:border-white/40',
            'chip-active': 'px-4 py-2 bg-[#00FF41] text-[#050505] border border-[#00FF41]',
            icon: mode === 'curator'
                ? 'p-2 hover:bg-gray-100'
                : 'p-2 hover:bg-white/10',
        };

        return (
            <button
                ref={ref}
                className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
                {...props}
            >
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';

export default Button;
