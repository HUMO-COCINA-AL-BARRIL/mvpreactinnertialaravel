import { Link } from '@inertiajs/react';

export default function ResponsiveNavLink({ active = false, className = '', children, ...props }) {
    return (
        <Link
            {...props}
            className={`w-full flex items-start ps-3 pe-4 py-2 border-l-4 ${
                active
                    ? 'border-amber-400 bg-amber-50 text-amber-700 focus:bg-amber-50 focus:text-amber-700 focus:border-amber-400'
                    : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-950 focus:bg-slate-50 focus:text-slate-950 focus:border-transparent'
            } text-base font-medium focus:outline-none transition duration-150 ease-in-out ${className}`}
        >
            {children}
        </Link>
    );
}
