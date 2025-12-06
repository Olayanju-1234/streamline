import { useCommandStore } from '../../store/useCommandStore';

type StatusType = 'idle' | 'loading' | 'success' | 'error' | 'info';

interface StatusMessageProps {
    message: string;
    type?: StatusType;
    className?: string;
}

export default function StatusMessage({ message, type = 'info', className = '' }: StatusMessageProps) {
    const mode = useCommandStore((state) => state.mode);

    const baseStyles = 'w-full p-6 text-center text-lg';

    const modeStyles = mode === 'curator'
        ? 'border border-[#111] bg-white'
        : 'border border-white/20 bg-[#050505]';

    const typeStyles: Record<StatusType, string> = {
        idle: mode === 'curator' ? 'text-gray-500' : 'text-white/50',
        loading: mode === 'curator' ? 'text-[#111]' : 'text-[#00FF41]',
        success: mode === 'curator' ? 'text-green-600' : 'text-[#00FF41]',
        error: mode === 'curator' ? 'text-red-600' : 'text-red-400',
        info: mode === 'curator' ? 'text-[#111]' : 'text-white',
    };

    return (
        <div className={`${baseStyles} ${modeStyles} ${typeStyles[type]} ${className}`}>
            {type === 'loading' && (
                <span className="inline-block mr-2 animate-pulse">●</span>
            )}
            {message}
        </div>
    );
}
