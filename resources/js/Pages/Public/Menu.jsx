import { Head, Link } from '@inertiajs/react';
import ProductCard from '../../Components/ProductCard';
import PublicLayout from '../../Layouts/PublicLayout';

export default function Menu({ categories = [], products = [], filters = {} }) {
    return (
        <>
            <Head title="Menú" />

            <PublicLayout>
                <div className="max-w-7xl mx-auto px-6 py-10">
                    <div className="flex items-end justify-between mb-8">
                        <div>
                            <h1 className="text-4xl font-extrabold">Menú completo</h1>
                            <p className="text-neutral-300 mt-2">Elige tus productos y agrégalos al carrito.</p>
                        </div>
                        <Link href={route('landing')} className="text-amber-400 font-semibold">
                            Volver al inicio
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </PublicLayout>
        </>
    );
}
