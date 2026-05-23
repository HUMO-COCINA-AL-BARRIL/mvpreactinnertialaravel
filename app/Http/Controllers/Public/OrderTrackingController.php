<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Inertia\Inertia;
use Inertia\Response;

class OrderTrackingController extends Controller
{
    public function __invoke(): Response
    {
        $orderNumber = strtoupper(trim((string) request('order_number', '')));
        $phone = trim((string) request('phone', ''));
        $order = null;

        if ($orderNumber !== '' && $phone !== '') {
            $candidate = Order::query()
                ->with(['items'])
                ->where('order_number', $orderNumber)
                ->first();

            if ($candidate && $this->normalizePhone($candidate->customer_phone) === $this->normalizePhone($phone)) {
                $order = [
                    'order_number' => $candidate->order_number,
                    'customer_name' => $candidate->customer_name,
                    'customer_phone' => $candidate->customer_phone,
                    'delivery_method' => $candidate->delivery_method,
                    'delivery_address' => $candidate->delivery_address,
                    'notes' => $candidate->notes,
                    'status' => $candidate->status,
                    'payment_status' => $candidate->payment_status,
                    'payment_method' => $candidate->payment_method,
                    'total' => (int) $candidate->total,
                    'delivery_fee' => (int) $candidate->delivery_fee,
                    'subtotal' => (int) $candidate->subtotal,
                    'cancellation_reason' => $candidate->cancellation_reason,
                    'created_at_label' => optional($candidate->created_at)?->diffForHumans(),
                    'items' => $candidate->items->map(fn ($item) => [
                        'id' => $item->id,
                        'product_name' => $item->product_name,
                        'quantity' => (int) $item->quantity,
                        'unit_price' => (int) $item->unit_price,
                        'subtotal' => (int) $item->subtotal,
                    ])->values(),
                ];
            }
        }

        return Inertia::render('Public/OrderTracking', [
            'filters' => [
                'order_number' => $orderNumber,
                'phone' => $phone,
            ],
            'searched' => $orderNumber !== '' || $phone !== '',
            'order' => $order,
        ]);
    }

    private function normalizePhone(?string $value): string
    {
        return preg_replace('/\D+/', '', (string) $value) ?: '';
    }
}
