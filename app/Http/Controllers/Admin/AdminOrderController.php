<?php

namespace App\Http\Controllers\Admin;

use App\Events\OrderRealtimeUpdated;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateOrderStatusRequest;
use App\Models\Order;
use App\Services\WhatsAppService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AdminOrderController extends Controller
{
    public function __construct(
        private readonly WhatsAppService $whatsAppService,
    ) {
    }

    public function index(): Response
    {
        return Inertia::render('Admin/Orders/Index', $this->buildPayload());
    }

    public function snapshot(): JsonResponse
    {
        return response()->json($this->buildPayload());
    }

    public function update(UpdateOrderStatusRequest $request, Order $order): JsonResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($order, $data): void {
            $status = $data['status'];
            $isCancelled = $status === Order::STATUS_CANCELLED;
            $paymentStatus = $isCancelled
                ? Order::PAYMENT_CANCELLED
                : ($data['payment_status'] ?? $order->payment_status);

            $order->update([
                'status' => $status,
                'payment_status' => $paymentStatus,
                'cancellation_reason' => $isCancelled ? $data['cancellation_reason'] : null,
            ]);

            if ($isCancelled) {
                $order->paymentAttempts()->latest()->first()?->update([
                    'status' => 'cancelled',
                    'response' => [
                        'reason' => $data['cancellation_reason'],
                        'cancelled_from_admin' => true,
                    ],
                ]);
            }
        });

        OrderRealtimeUpdated::dispatch($order->fresh(), 'updated');

        return response()->json([
            'message' => 'Pedido actualizado correctamente.',
            'order' => $this->transformOrder($order->fresh([
                'items',
                'deliveryFeeModel:id,name,price',
                'paymentAttempts' => fn ($query) => $query->latest(),
            ])),
        ]);
    }

    private function buildPayload(): array
    {
        $orders = Order::query()
            ->with([
                'items',
                'deliveryFeeModel:id,name,price',
                'paymentAttempts' => fn ($query) => $query->latest(),
            ])
            ->latest()
            ->limit(40)
            ->get();

        return [
            'stats' => [
                'totalOrders' => Order::count(),
                'pendingOrders' => Order::query()->where('status', Order::STATUS_PENDING)->count(),
                'activeOrders' => Order::query()->whereIn('status', [
                    Order::STATUS_CONFIRMED,
                    Order::STATUS_PREPARING,
                    Order::STATUS_READY,
                ])->count(),
                'paidOrders' => Order::query()->where('payment_status', Order::PAYMENT_PAID)->count(),
            ],
            'latestOrderId' => (int) ($orders->max('id') ?? 0),
            'orders' => $orders->map(fn (Order $order) => $this->transformOrder($order))->values(),
        ];
    }

    private function transformOrder(Order $order): array
    {
        $latestPayment = $order->paymentAttempts->first();

        return [
            'id' => $order->id,
            'order_number' => $order->order_number,
            'customer_name' => $order->customer_name,
            'customer_phone' => $order->customer_phone,
            'delivery_method' => $order->delivery_method,
            'delivery_address' => $order->delivery_address,
            'delivery_fee_name' => $order->deliveryFeeModel?->name,
            'notes' => $order->notes,
            'cancellation_reason' => $order->cancellation_reason,
            'payment_method' => $order->payment_method,
            'payment_status' => $order->payment_status,
            'status' => $order->status,
            'subtotal' => (int) $order->subtotal,
            'delivery_fee' => (int) $order->delivery_fee,
            'total' => (int) $order->total,
            'whatsapp_link' => $this->whatsAppService->generateOrderLink($order),
            'tracking_url' => route('orders.tracking', [
                'order_number' => $order->order_number,
                'phone' => $order->customer_phone,
            ]),
            'created_at' => optional($order->created_at)?->toISOString(),
            'created_at_label' => optional($order->created_at)?->diffForHumans(),
            'is_new' => optional($order->created_at)?->gt(now()->subMinutes(5)) ?? false,
            'latest_payment' => $latestPayment ? [
                'provider' => $latestPayment->provider,
                'status' => $latestPayment->status,
                'amount' => (int) $latestPayment->amount,
            ] : null,
            'items' => $order->items->map(fn ($item) => [
                'id' => $item->id,
                'product_name' => $item->product_name,
                'quantity' => (int) $item->quantity,
                'unit_price' => (int) $item->unit_price,
                'subtotal' => (int) $item->subtotal,
            ])->values(),
        ];
    }
}
