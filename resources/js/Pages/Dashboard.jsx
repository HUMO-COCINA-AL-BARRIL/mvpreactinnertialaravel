import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Package, Sparkles, Layers3, CheckCircle2, Wallet, CircleDollarSign, Clock3, AlertTriangle } from 'lucide-react';

function StatCard({ title, value, icon: Icon, accent }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-slate-500">{title}</p>
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${accent}`}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>
            <p className="text-3xl font-semibold text-slate-900">{value}</p>
        </div>
    );
}

const money = (value) => `$${new Intl.NumberFormat('es-CO').format(value || 0)}`;

export default function Dashboard({ auth, stats, paymentStats, orderStats, latestProducts = [], latestPayments = [] }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-slate-900 leading-tight">Dashboard</h2>}
        >
            <Head title="Dashboard" />

            <div className="py-10">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Panel de administración</h1>
                            <p className="text-slate-500 mt-1">Gestiona productos, pagos y balance del negocio.</p>
                        </div>
                        <Link
                            href={route('admin.products.index')}
                            className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                        >
                            Gestionar productos
                        </Link>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-6">
                        <StatCard title="Productos" value={stats.products} icon={Package} accent="bg-slate-100 text-slate-700" />
                        <StatCard title="Disponibles" value={stats.availableProducts} icon={CheckCircle2} accent="bg-emerald-100 text-emerald-700" />
                        <StatCard title="Destacados" value={stats.featuredProducts} icon={Sparkles} accent="bg-amber-100 text-amber-700" />
                        <StatCard title="Categorías" value={stats.categories} icon={Layers3} accent="bg-blue-100 text-blue-700" />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-6">
                        <StatCard title="Ingresos totales" value={money(paymentStats.grossRevenue)} icon={Wallet} accent="bg-emerald-100 text-emerald-700" />
                        <StatCard title="Ingresos hoy" value={money(paymentStats.todayRevenue)} icon={CircleDollarSign} accent="bg-sky-100 text-sky-700" />
                        <StatCard title="Pagos pendientes" value={paymentStats.pendingPayments} icon={Clock3} accent="bg-amber-100 text-amber-700" />
                        <StatCard title="Pagos fallidos" value={paymentStats.failedPayments} icon={AlertTriangle} accent="bg-rose-100 text-rose-700" />
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2 mb-6">
                        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-200">
                                <h3 className="font-semibold text-slate-900">Últimos productos</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 text-slate-500">
                                        <tr>
                                            <th className="text-left px-6 py-3 font-medium">Nombre</th>
                                            <th className="text-left px-6 py-3 font-medium">Categoría</th>
                                            <th className="text-left px-6 py-3 font-medium">Precio</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {latestProducts.map((product) => (
                                            <tr key={product.id} className="border-t border-slate-100">
                                                <td className="px-6 py-3 font-medium text-slate-900">{product.name}</td>
                                                <td className="px-6 py-3 text-slate-600">{product.category?.name || 'Sin categoría'}</td>
                                                <td className="px-6 py-3 text-slate-900">{money(product.price)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-200">
                                <h3 className="font-semibold text-slate-900">Últimos pagos</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 text-slate-500">
                                        <tr>
                                            <th className="text-left px-6 py-3 font-medium">Orden</th>
                                            <th className="text-left px-6 py-3 font-medium">Estado</th>
                                            <th className="text-left px-6 py-3 font-medium">Monto</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {latestPayments.map((payment) => (
                                            <tr key={payment.id} className="border-t border-slate-100">
                                                <td className="px-6 py-3 font-medium text-slate-900">{payment.order?.order_number || '-'}</td>
                                                <td className="px-6 py-3 text-slate-700 capitalize">{payment.status}</td>
                                                <td className="px-6 py-3 text-slate-900">{money(payment.amount)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h3 className="font-semibold text-slate-900 mb-3">Balance de órdenes</h3>
                        <div className="grid gap-3 sm:grid-cols-3 text-sm">
                            <div className="rounded-xl bg-slate-50 p-3">Pendientes: <strong>{orderStats.pendingOrders}</strong></div>
                            <div className="rounded-xl bg-slate-50 p-3">Confirmadas: <strong>{orderStats.confirmedOrders}</strong></div>
                            <div className="rounded-xl bg-slate-50 p-3">Canceladas: <strong>{orderStats.cancelledOrders}</strong></div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
