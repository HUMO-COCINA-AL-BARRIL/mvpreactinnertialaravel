import { Head, Link } from '@inertiajs/react';
import ProductCard from '../../Components/ProductCard';
import PublicLayout from '../../Layouts/PublicLayout';

function ToggleButton({ children, active }) {
    return (
        <button
            className={`px-5 py-2 rounded-full border shadow-sm text-sm font-medium flex items-center gap-2 transition ${active
                ? 'bg-amber-500 text-black border-amber-500'
                : 'bg-white text-gray-700 border-gray-200 hover:border-amber-300'
                }`}
        >
            {children}
        </button>
    );
}

export default function Landing({
    featuredCategories = [],
    featuredProducts = [],
    testimonials = [],
}) {
    return (
        <>
            <Head title="HUMO Cocina al Barril | Manizales" />

            <PublicLayout>
                <section className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-black via-neutral-950 to-neutral-900" />

                    <div className="relative max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <span className="inline-flex mb-5 px-4 py-2 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-sm font-semibold">
                                Cocina al barril en Manizales
                            </span>

                            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
                                La mejor experiencia en asados al barril
                            </h1>

                            <p className="text-lg text-neutral-300 mb-8 leading-relaxed max-w-xl">
                                En HUMO vivimos la carne con fuego lento, sabor intenso y una
                                experiencia pensada para compartir. Costillas, chicharron,
                                carnes al barril, picadas, reservas y pedidos para llevar.
                            </p>

                            <div className="flex flex-wrap gap-4 mb-8">
                                <ToggleButton active>Asados al barril</ToggleButton>
                                <ToggleButton>Domicilios</ToggleButton>
                                <ToggleButton>Manizales</ToggleButton>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link
                                    href={route('menu.index')}
                                    className="inline-flex justify-center bg-amber-500 hover:bg-amber-400 text-black font-bold px-10 py-4 rounded-2xl shadow-lg transition"
                                >
                                    Ver menu
                                </Link>

                                <a
                                    href="https://wa.me/573001234567?text=Hola%20HUMO,%20quiero%20hacer%20un%20pedido"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex justify-center bg-white text-black font-bold px-10 py-4 rounded-2xl shadow-lg hover:bg-neutral-100 transition"
                                >
                                    Pedir por WhatsApp
                                </a>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 bg-neutral-900">
                                <img
                                    src="/images/humo_hero.png"
                                    alt="Comida al barril HUMO"
                                    className="w-full h-[520px] object-cover"
                                />
                            </div>

                            <div className="absolute -bottom-6 left-6 right-6 bg-white text-black rounded-3xl p-5 shadow-xl">
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <p className="text-2xl font-extrabold">5.0</p>
                                        <p className="text-xs text-gray-500">Calificacion</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-extrabold">21K+</p>
                                        <p className="text-xs text-gray-500">Seguidores</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-extrabold">Fuego</p>
                                        <p className="text-xs text-gray-500">Sabor al barril</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-20 bg-neutral-900">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="bg-neutral-800 rounded-3xl p-6 border border-white/10">
                                <h3 className="text-xl font-bold mb-3">Especialidad</h3>
                                <p className="text-neutral-300">
                                    Carnes preparadas al barril con coccion lenta, textura jugosa
                                    y sabor ahumado.
                                </p>
                            </div>

                            <div className="bg-neutral-800 rounded-3xl p-6 border border-white/10">
                                <h3 className="text-xl font-bold mb-3">Ubicacion</h3>
                                <p className="text-neutral-300">
                                    Manizales, Carrera 23 #74-114, sector El Perro.
                                </p>
                            </div>

                            <div className="bg-neutral-800 rounded-3xl p-6 border border-white/10">
                                <h3 className="text-xl font-bold mb-3">Opciones</h3>
                                <p className="text-neutral-300">
                                    Pide para llevar, reserva tu mesa o solicita domicilio desde
                                    el menu digital.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {featuredCategories.length > 0 && (
                    <section className="py-16 bg-neutral-950">
                        <div className="max-w-7xl mx-auto px-6">
                            <h2 className="text-3xl font-extrabold mb-8">Categorias destacadas</h2>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                                {featuredCategories.map((category) => (
                                    <div
                                        key={category.id}
                                        className="bg-neutral-900 rounded-3xl p-5 border border-white/10"
                                    >
                                        <p className="font-bold">{category.name}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                <section className="py-20 bg-neutral-100 text-black">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex items-end justify-between mb-8">
                            <div>
                                <h2 className="text-3xl font-extrabold text-amber-600">Productos mas pedidos</h2>
                                <p className="text-gray-600 mt-2">Seleccion de la casa disponible hoy.</p>
                            </div>

                            <Link
                                href={route('menu.index')}
                                className="hidden md:inline-flex font-semibold text-amber-700"
                            >
                                Ver todo el menu
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                            {featuredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </div>
                </section>

                <section className="py-20 bg-black">
                    <div className="max-w-4xl mx-auto px-6 text-center">
                        <h2 className="text-4xl font-extrabold mb-4">Listo para probar HUMO?</h2>

                        <p className="text-neutral-300 mb-8">
                            Consulta el menu, arma tu pedido y finaliza por WhatsApp con los
                            datos de la orden.
                        </p>

                        <Link
                            href={route('menu.index')}
                            className="inline-flex bg-amber-500 hover:bg-amber-400 text-black font-bold px-12 py-4 rounded-2xl shadow-lg transition"
                        >
                            Ordenar ahora
                        </Link>
                    </div>
                </section>
            </PublicLayout>
        </>
    );
}
