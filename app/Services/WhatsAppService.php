<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Reservation;

class WhatsAppService
{
    public function generateOrderLink(Order $order): string
    {
        $lines = [
            'Hola, quiero confirmar tu pedido en Humo Cocina al Barril.',
            '',
            'Queremos confirmar tu pedido #'.$order->order_number.'.',
            'Tipo de pedido: '.$this->formatDeliveryMethod($order->delivery_method),
            '',
            'Resumen:',
            '',
        ];

        foreach ($order->items as $item) {
            $lines[] = sprintf(
                '* %d x %s - $%s',
                $item->quantity,
                $item->product_name,
                number_format($item->subtotal, 0, ',', '.')
            );
        }

        $lines[] = '';
        $lines[] = 'Total: $'.number_format($order->total, 0, ',', '.');
        $lines[] = '';

        if ($order->notes) {
            $lines[] = 'Notas:';
            $lines[] = $order->notes;
            $lines[] = '';
        }

        if ($order->delivery_method === 'delivery' && $order->delivery_address) {
            $lines[] = 'Direccion:';
            $lines[] = $order->delivery_address;
        }

        $lines[] = '';
        $lines[] = 'Puedes hacer seguimiento aqui:';
        $lines[] = route('orders.tracking', [
            'order_number' => $order->order_number,
            'phone' => $order->customer_phone,
        ]);
        $lines[] = '';
        $lines[] = 'Si deseas responder o ajustar algo, estamos atentos.';

        return $this->buildCustomerUrl($order->customer_phone, implode(PHP_EOL, $lines));
    }

    public function generateReservationLink(Reservation $reservation): string
    {
        $lines = [
            'Hola, quiero confirmar mi reserva en Humo Cocina al Barril.',
            '',
            'Nombre: '.$reservation->name,
            'Celular: '.$reservation->phone,
            'Fecha: '.$reservation->reservation_date->format('Y-m-d'),
            'Hora: '.$reservation->reservation_time,
            'Personas: '.$reservation->people_count,
            'Ocasion: '.$reservation->occasion,
        ];

        if ($reservation->notes) {
            $lines[] = 'Notas: '.$reservation->notes;
        }

        return $this->buildUrl(implode(PHP_EOL, $lines));
    }

    private function buildUrl(string $message): string
    {
        $number = preg_replace('/\D+/', '', (string) config('services.whatsapp.number'));

        return 'https://wa.me/'.$number.'?text='.urlencode($message);
    }

    private function buildCustomerUrl(string $phone, string $message): string
    {
        $number = preg_replace('/\D+/', '', $phone);

        return 'https://wa.me/'.$number.'?text='.urlencode($message);
    }

    private function formatDeliveryMethod(string $deliveryMethod): string
    {
        return match ($deliveryMethod) {
            'pickup' => 'Recoger en local',
            'dine_in' => 'Comer en restaurante',
            default => 'Domicilio',
        };
    }
}
