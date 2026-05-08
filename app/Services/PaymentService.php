<?php

namespace App\Services;

use App\Models\LoyaltyPointTransaction;
use App\Models\Order;
use App\Models\PaymentAttempt;
use Illuminate\Support\Facades\DB;

class PaymentService
{
    public function createAttempt(Order $order, string $provider = 'wompi'): PaymentAttempt
    {
        return PaymentAttempt::create([
            'order_id' => $order->id,
            'provider' => $provider,
            'status' => 'pending',
            'amount' => $order->total,
            'currency' => 'COP',
            'payload' => [
                'order_number' => $order->order_number,
            ],
        ]);
    }

    public function markAsPaid(Order $order, array $response = []): void
    {
        DB::transaction(function () use ($order, $response): void {
            $order->update([
                'payment_status' => Order::PAYMENT_PAID,
                'status' => Order::STATUS_CONFIRMED,
            ]);

            $points = (int) floor($order->total / 10000);
            if ($order->user_id && $points > 0) {
                $order->user()->increment('points', $points);

                LoyaltyPointTransaction::create([
                    'user_id' => $order->user_id,
                    'order_id' => $order->id,
                    'points' => $points,
                    'type' => 'earned',
                    'description' => 'Puntos por orden '.$order->order_number,
                ]);
            }

            $order->paymentAttempts()->latest()->first()?->update([
                'status' => 'success',
                'response' => $response,
            ]);
        });
    }

    public function getBalanceMetrics(): array
    {
        $paidOrders = Order::query()->where('payment_status', Order::PAYMENT_PAID);
        $grossRevenue = (int) (clone $paidOrders)->sum('total');
        $todayRevenue = (int) (clone $paidOrders)
            ->whereDate('created_at', now()->toDateString())
            ->sum('total');

        return [
            'grossRevenue' => $grossRevenue,
            'todayRevenue' => $todayRevenue,
            'pendingPayments' => Order::query()->where('payment_status', Order::PAYMENT_PENDING)->count(),
            'failedPayments' => Order::query()->where('payment_status', Order::PAYMENT_FAILED)->count(),
            'paidOrders' => (clone $paidOrders)->count(),
        ];
    }
}
