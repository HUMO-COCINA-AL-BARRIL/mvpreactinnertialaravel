import { useEffect } from 'react';
import Checkbox from '@/Components/Checkbox';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();

        post(route('login'));
    };

    return (
        <GuestLayout>
            <Head title="Iniciar sesion" />

            <div className="mb-8">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-500">Acceso privado</p>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Inicia sesion</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                    Entra al panel de HUMO para gestionar productos, pedidos y operaciones del dia.
                </p>
            </div>

            {status && (
                <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <InputLabel htmlFor="email" value="Correo" className="text-sm font-semibold text-slate-700" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-2 block w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-none focus:border-amber-400 focus:bg-white focus:ring-amber-400"
                        autoComplete="username"
                        isFocused={true}
                        placeholder="admin@humo.com"
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Contrasena" className="text-sm font-semibold text-slate-700" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-2 block w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-none focus:border-amber-400 focus:bg-white focus:ring-amber-400"
                        autoComplete="current-password"
                        placeholder="Ingresa tu contrasena"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <label className="flex items-center gap-3">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            className="rounded border-slate-300 text-amber-500 shadow-none focus:ring-amber-400"
                            onChange={(e) => setData('remember', e.target.checked)}
                        />
                        <span className="text-sm text-slate-600">Recordarme</span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-sm font-medium text-slate-500 transition hover:text-amber-600 focus:outline-none"
                        >
                            Olvidaste tu contrasena?
                        </Link>
                    )}
                </div>

                <div className="pt-2">
                    <PrimaryButton
                        className="w-full justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold uppercase tracking-[0.24em] hover:bg-amber-500 focus:bg-amber-500 focus:ring-amber-400"
                        disabled={processing}
                    >
                        Entrar al panel
                    </PrimaryButton>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-6 text-slate-500">
                    Acceso exclusivo para administracion. Si necesitas soporte de ingreso, valida tus credenciales con el equipo interno.
                </div>
            </form>
        </GuestLayout>
    );
}
