import { useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'react-hot-toast';

export default function AppNotifications() {
    const lastSuccess = useRef(null);
    const lastError = useRef(null);
    const lastValidationError = useRef(null);

    useEffect(() => {
        const removeSuccessListener = router.on('success', (event) => {
            const page = event.detail.page;
            const flash = page?.props?.flash || {};
            const errors = page?.props?.errors || {};

            if (flash.success && flash.success !== lastSuccess.current) {
                lastSuccess.current = flash.success;
                toast.success(flash.success);
            }

            if (flash.error && flash.error !== lastError.current) {
                lastError.current = flash.error;
                toast.error(flash.error);
            }

            const firstError = Object.values(errors)[0];

            if (firstError && firstError !== lastValidationError.current) {
                lastValidationError.current = firstError;
                toast.error(firstError);
            }
        });

        const removeErrorListener = router.on('error', (errors) => {
            const firstError = Object.values(errors.detail.errors || {})[0];

            if (firstError && firstError !== lastValidationError.current) {
                lastValidationError.current = firstError;
                toast.error(firstError);
            }
        });

        return () => {
            removeSuccessListener();
            removeErrorListener();
        };
    }, []);

    return null;
}
