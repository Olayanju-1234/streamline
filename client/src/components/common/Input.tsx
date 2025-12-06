import { InputHTMLAttributes, forwardRef } from 'react';
import { useCommandStore } from '../../store/useCommandStore';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string | null;
    showPasteButton?: boolean;
    onPaste?: () => void;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, showPasteButton, onPaste, className = '', ...props }, ref) => {
        const mode = useCommandStore((state) => state.mode);

        const baseInputStyles = mode === 'curator'
            ? 'flex-1 px-6 py-4 text-lg outline-none bg-transparent placeholder:text-gray-400'
            : 'flex-1 px-4 py-3 bg-[#050505] outline-none placeholder:text-white/40';

        const containerStyles = mode === 'curator'
            ? 'flex items-center border border-[#111] bg-white'
            : 'flex items-center border border-white/20 focus-within:border-[#00FF41]';

        const handlePaste = async () => {
            if (onPaste) {
                onPaste();
            }
        };

        return (
            <div className="w-full">
                {label && (
                    <label className="block mb-2 text-sm font-medium">
                        {label}
                    </label>
                )}
                <div className={containerStyles}>
                    <input
                        ref={ref}
                        className={`${baseInputStyles} ${className}`}
                        {...props}
                    />
                    {showPasteButton && (
                        <button
                            type="button"
                            onClick={handlePaste}
                            className={`px-4 py-4 transition-colors ${mode === 'curator'
                                    ? 'border-l border-[#111] hover:bg-gray-50'
                                    : 'border-l border-white/20 hover:bg-white/10'
                                }`}
                            aria-label="Paste from clipboard"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                            </svg>
                        </button>
                    )}
                </div>
                {error && (
                    <p className={`mt-2 text-sm ${mode === 'curator' ? 'text-red-600' : 'text-red-400'}`}>
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
