<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Order;
use App\Models\PaymentAttempt;
use App\Models\Product;
use App\Services\PaymentService;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function __invoke(PaymentService $paymentService): Response
    {
        return Inertia::render('Dashboard', [
            'stats' => [
                'products' => Product::count(),
                'availableProducts' => Product::where('is_available', true)->count(),
                'featuredProducts' => Product::where('is_featured', true)->count(),
                'categories' => Category::count(),
            ],
            'paymentStats' => $paymentService->getBalanceMetrics(),
            'orderStats' => [
                'pendingOrders' => Order::query()->where('status', Order::STATUS_PENDING)->count(),
                'confirmedOrders' => Order::query()->where('status', Order::STATUS_CONFIRMED)->count(),
                'cancelledOrders' => Order::query()->where('status', Order::STATUS_CANCELLED)->count(),
            ],
            'latestProducts' => Product::query()
                ->with('category:id,name')
                ->latest()
                ->limit(5)
                ->get(),
            'latestPayments' => PaymentAttempt::query()
                ->with('order:id,order_number,customer_name')
                ->latest()
                ->limit(8)
                ->get(),
        ]);
    }
}
