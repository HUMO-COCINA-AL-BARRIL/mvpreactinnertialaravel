import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
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
        <div className="brand-admin-card rounded-[1.75rem] p-5">
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
        <div className="brand-admin-table overflow-hidden rounded-[1.75rem]">
            <div className="brand-admin-divider border-b px-6 py-5">
                <h3 className="text-lg font-bold text-slate-950">{title}</h3>
                <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="brand-admin-table-head">
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
    const { business } = usePage().props;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="rounded-[2rem] border px-6 py-7 shadow-[0_22px_60px_rgba(15,23,42,0.08)] sm:px-8" style={{ borderColor: 'color-mix(in srgb, var(--brand-primary) 28%, rgba(255,255,255,0.7))', background: 'linear-gradient(135deg, color-mix(in srgb, var(--brand-primary) 9%, #fff8eb) 0%, #ffffff 55%, #f8fafc 100%)' }}>
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl">
                            <span className="brand-soft-badge inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em]">
                                Vista general
                            </span>
                            <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950">Dashboard de {business?.name || 'HUMO'}</h1>
                            <p className="mt-3 text-base leading-7 text-slate-600">
                                Un resumen claro del negocio con acceso rapido a productos, pagos y estado operativo del dia.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Link
                                href={route('admin.products.index')}
                                className="brand-button inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold"
                            >
                                Gestionar productos
                                <ArrowUpRight className="h-4 w-4" />
                            </Link>
                            <Link
                                href={route('admin.categories.index')}
                                className="brand-soft-button inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold"
                            >
                                Ver categorias
                            </Link>
                            <Link
                                href={route('admin.moments.index')}
                                className="brand-soft-button inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold"
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
                        <StatCard title="Productos" value={stats.products} icon={Package} accent="brand-soft-icon" hint="Catalogo total disponible en el panel." />
                        <StatCard title="Disponibles" value={stats.availableProducts} icon={CheckCircle2} accent="brand-soft-icon" hint="Items listos para mostrarse al cliente." />
                        <StatCard title="Destacados" value={stats.featuredProducts} icon={Sparkles} accent="brand-soft-icon" hint="Productos que empujan la oferta principal." />
                        <StatCard title="Categorias" value={stats.categories} icon={Layers3} accent="brand-soft-icon" hint="Secciones activas del menu digital." />
                        <StatCard title="Momentos" value={stats.moments} icon={Camera} accent="brand-soft-icon" hint={`${stats.momentComments} comentarios y ${stats.momentLikes} likes en el feed social.`} />
                    </section>

                    <section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
                        <div className="brand-surface-panel rounded-[2rem] border border-white/70 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
                            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                                <div>
                                    <div className="brand-button inline-flex h-12 w-12 items-center justify-center rounded-2xl">
                                        <Flame className="h-5 w-5" />
                                    </div>
                                    <p className="mt-5 text-sm font-semibold uppercase tracking-[0.22em]" style={{ color: 'color-mix(in srgb, var(--brand-primary) 72%, white)' }}>Ingresos</p>
                                    <p className="mt-3 text-4xl font-black tracking-tight">{money(paymentStats.grossRevenue)}</p>
                                    <p className="mt-3 max-w-xl text-sm leading-6 text-white/80">
                                        Total acumulado registrado en pagos dentro de la plataforma.
                                    </p>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-3 lg:w-[420px]">
                                    <div className="brand-surface-chip rounded-2xl p-4">
                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">Hoy</p>
                                        <p className="mt-2 text-xl font-black text-white">{money(paymentStats.todayRevenue)}</p>
                                    </div>
                                    <div className="brand-surface-chip rounded-2xl p-4">
                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">Pendientes</p>
                                        <p className="mt-2 text-xl font-black text-white">{paymentStats.pendingPayments}</p>
                                    </div>
                                    <div className="brand-surface-chip rounded-2xl p-4">
                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">Fallidos</p>
                                        <p className="mt-2 text-xl font-black text-white">{paymentStats.failedPayments}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4">
                            <StatCard title="Ingresos hoy" value={money(paymentStats.todayRevenue)} icon={CircleDollarSign} accent="brand-soft-icon" hint="Movimiento registrado durante la jornada." />
                            <StatCard title="Pagos pendientes" value={paymentStats.pendingPayments} icon={Clock3} accent="brand-soft-icon" hint="Pagos que aun requieren confirmacion." />
                            <StatCard title="Pagos fallidos" value={paymentStats.failedPayments} icon={AlertTriangle} accent="brand-soft-icon" hint="Intentos que necesitan revision manual." />
                        </div>
                    </section>

                    <section className="grid gap-6 lg:grid-cols-2">
                        <DataTable
                            title="Ultimos productos"
                            subtitle="Los productos mas recientes dentro del catalogo."
                            columns={['Nombre', 'Categoria', 'Precio']}
                            rows={latestProducts}
                            renderRow={(product) => (
                                <tr key={product.id} className="brand-admin-divider border-t">
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
                                <tr key={payment.id} className="brand-admin-divider border-t">
                                    <td className="px-6 py-4 font-semibold text-slate-900">{payment.order?.order_number || '-'}</td>
                                    <td className="px-6 py-4">
                                        <span className="brand-soft-badge inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize">
                                            {payment.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-900">{money(payment.amount)}</td>
                                </tr>
                            )}
                        />
                    </section>

                    <section className="brand-admin-card rounded-[1.75rem] p-6">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h3 className="text-xl font-black tracking-tight text-slate-950">Balance de ordenes</h3>
                                <p className="mt-2 text-sm text-slate-500">Una lectura rapida del estado operacional actual.</p>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-3">
                                <div className="brand-admin-subtle rounded-2xl px-5 py-4 text-sm">
                                    Pendientes
                                    <p className="mt-2 text-2xl font-black text-slate-950">{orderStats.pendingOrders}</p>
                                </div>
                                <div className="brand-admin-subtle rounded-2xl px-5 py-4 text-sm">
                                    Confirmadas
                                    <p className="mt-2 text-2xl font-black text-slate-950">{orderStats.confirmedOrders}</p>
                                </div>
                                <div className="brand-admin-subtle rounded-2xl px-5 py-4 text-sm">
                                    Canceladas
                                    <p className="mt-2 text-2xl font-black text-slate-950">{orderStats.cancelledOrders}</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
