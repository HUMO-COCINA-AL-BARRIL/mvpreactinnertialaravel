import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    Package,
    Sparkles,
    Layers3,
    CheckCircle2,
    Wallet,
    CircleDollarSign,
    Clock3,
    AlertTriangle,
    ArrowUpRight,
    Flame,
    Camera,
} from 'lucide-react';

function StatCard({ title, value, icon: Icon, accent, hint }) {
    return (
        <div className="rounded-[1.75rem] border border-white/70 bg-white/90 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{title}</p>
                    <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">{value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${accent}`}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>
            <p className="text-sm leading-6 text-slate-600">{hint}</p>
        </div>
    );
}

function DataTable({ title, subtitle, columns, rows, renderRow }) {
    return (
        <div className="overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/90 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            <div className="border-b border-slate-100 px-6 py-5">
                <h3 className="text-lg font-bold text-slate-950">{title}</h3>
                <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50/80 text-slate-500">
                        <tr>
                            {columns.map((column) => (
                                <th key={column} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em]">
                                    {column}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map(renderRow)}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const money = (value) =>
    new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
    }).format(value || 0);

export default function Dashboard({ auth, stats, paymentStats, orderStats, latestProducts = [], latestPayments = [] }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="rounded-[2rem] border border-amber-200/70 bg-[linear-gradient(135deg,#fff8eb_0%,#ffffff_55%,#f8fafc_100%)] px-6 py-7 shadow-[0_22px_60px_rgba(15,23,42,0.08)] sm:px-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl">
                            <span className="inline-flex rounded-full border border-amber-300 bg-amber-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
                                Vista general
                            </span>
                            <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950">Dashboard de HUMO</h1>
                            <p className="mt-3 text-base leading-7 text-slate-600">
                                Un resumen claro del negocio con acceso rapido a productos, pagos y estado operativo del dia.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Link
                                href={route('admin.products.index')}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-400 px-5 py-3 text-sm font-bold text-black transition hover:bg-amber-300"
                            >
                                Gestionar productos
                                <ArrowUpRight className="h-4 w-4" />
                            </Link>
                            <Link
                                href={route('admin.categories.index')}
                                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
                            >
                                Ver categorias
                            </Link>
                            <Link
                                href={route('admin.moments.index')}
                                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
                            >
                                Gestionar momentos
                            </Link>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="pb-10">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                        <StatCard title="Productos" value={stats.products} icon={Package} accent="bg-slate-100 text-slate-700" hint="Catalogo total disponible en el panel." />
                        <StatCard title="Disponibles" value={stats.availableProducts} icon={CheckCircle2} accent="bg-emerald-100 text-emerald-700" hint="Items listos para mostrarse al cliente." />
                        <StatCard title="Destacados" value={stats.featuredProducts} icon={Sparkles} accent="bg-amber-100 text-amber-700" hint="Productos que empujan la oferta principal." />
                        <StatCard title="Categorias" value={stats.categories} icon={Layers3} accent="bg-sky-100 text-sky-700" hint="Secciones activas del menu digital." />
                        <StatCard title="Momentos" value={stats.moments} icon={Camera} accent="bg-rose-100 text-rose-700" hint={`${stats.momentComments} comentarios y ${stats.momentLikes} likes en el feed social.`} />
                    </section>

                    <section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
                        <div className="rounded-[2rem] border border-white/70 bg-[#171717] p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
                            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                                <div>
                                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400 text-black">
                                        <Flame className="h-5 w-5" />
                                    </div>
                                    <p className="mt-5 text-sm font-semibold uppercase tracking-[0.22em] text-amber-300">Ingresos</p>
                                    <p className="mt-3 text-4xl font-black tracking-tight">{money(paymentStats.grossRevenue)}</p>
                                    <p className="mt-3 max-w-xl text-sm leading-6 text-white/80">
                                        Total acumulado registrado en pagos dentro de la plataforma.
                                    </p>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-3 lg:w-[420px]">
                                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">Hoy</p>
                                        <p className="mt-2 text-xl font-black text-white">{money(paymentStats.todayRevenue)}</p>
                                    </div>
                                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">Pendientes</p>
                                        <p className="mt-2 text-xl font-black text-white">{paymentStats.pendingPayments}</p>
                                    </div>
                                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">Fallidos</p>
                                        <p className="mt-2 text-xl font-black text-white">{paymentStats.failedPayments}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4">
                            <StatCard title="Ingresos hoy" value={money(paymentStats.todayRevenue)} icon={CircleDollarSign} accent="bg-sky-100 text-sky-700" hint="Movimiento registrado durante la jornada." />
                            <StatCard title="Pagos pendientes" value={paymentStats.pendingPayments} icon={Clock3} accent="bg-amber-100 text-amber-700" hint="Pagos que aun requieren confirmacion." />
                            <StatCard title="Pagos fallidos" value={paymentStats.failedPayments} icon={AlertTriangle} accent="bg-rose-100 text-rose-700" hint="Intentos que necesitan revision manual." />
                        </div>
                    </section>

                    <section className="grid gap-6 lg:grid-cols-2">
                        <DataTable
                            title="Ultimos productos"
                            subtitle="Los productos mas recientes dentro del catalogo."
                            columns={['Nombre', 'Categoria', 'Precio']}
                            rows={latestProducts}
                            renderRow={(product) => (
                                <tr key={product.id} className="border-t border-slate-100">
                                    <td className="px-6 py-4 font-semibold text-slate-900">{product.name}</td>
                                    <td className="px-6 py-4 text-slate-600">{product.category?.name || 'Sin categoria'}</td>
                                    <td className="px-6 py-4 text-slate-900">{money(product.price)}</td>
                                </tr>
                            )}
                        />

                        <DataTable
                            title="Ultimos pagos"
                            subtitle="Seguimiento rapido del estado de transacciones."
                            columns={['Orden', 'Estado', 'Monto']}
                            rows={latestPayments}
                            renderRow={(payment) => (
                                <tr key={payment.id} className="border-t border-slate-100">
                                    <td className="px-6 py-4 font-semibold text-slate-900">{payment.order?.order_number || '-'}</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-700">
                                            {payment.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-900">{money(payment.amount)}</td>
                                </tr>
                            )}
                        />
                    </section>

                    <section className="rounded-[1.75rem] border border-white/70 bg-white/90 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h3 className="text-xl font-black tracking-tight text-slate-950">Balance de ordenes</h3>
                                <p className="mt-2 text-sm text-slate-500">Una lectura rapida del estado operacional actual.</p>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-3">
                                <div className="rounded-2xl bg-slate-50 px-5 py-4 text-sm text-slate-600">
                                    Pendientes
                                    <p className="mt-2 text-2xl font-black text-slate-950">{orderStats.pendingOrders}</p>
                                </div>
                                <div className="rounded-2xl bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
                                    Confirmadas
                                    <p className="mt-2 text-2xl font-black text-emerald-900">{orderStats.confirmedOrders}</p>
                                </div>
                                <div className="rounded-2xl bg-rose-50 px-5 py-4 text-sm text-rose-700">
                                    Canceladas
                                    <p className="mt-2 text-2xl font-black text-rose-900">{orderStats.cancelledOrders}</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
