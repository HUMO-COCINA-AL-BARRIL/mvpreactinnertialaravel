<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderRealtimeUpdated implements ShouldBroadcastNow
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public Order $order,
        public string $action = 'updated',
    ) {
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('admin.orders'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'order.rt.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'action' => $this->action,
            'created_at' => optional($this->order->created_at)?->toISOString(),
        ];
    }
}
