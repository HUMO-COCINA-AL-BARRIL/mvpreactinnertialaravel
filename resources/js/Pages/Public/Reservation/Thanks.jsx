import { Head, Link } from '@inertiajs/react';

export default function ReservationThanks() {
    return (
        <>
            <Head title="Gracias por reservar" />
            <div className="max-w-3xl mx-auto p-6">
                <h1 className="text-2xl font-bold mb-4">Gracias</h1>
                <p>Tu reserva fue recibida. Te enviaremos confirmación por WhatsApp.</p>
                <div className="mt-6">
                    <Link href={route('landing')} className="underline">
                        Volver al inicio
                    </Link>
                </div>
            </div>
        </>
    );
}
