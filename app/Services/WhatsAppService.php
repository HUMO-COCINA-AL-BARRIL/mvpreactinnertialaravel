<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Reservation;

class WhatsAppService
{
    public function generateOrderLink(Order $order): string
    {
        $lines = [
            'Hola, quiero confirmar mi pedido en Humo Cocina al Barril.',
            '',
            'Orden: #'.$order->order_number,
            'Cliente: '.$order->customer_name,
            'Celular: '.$order->customer_phone,
            'Tipo de pedido: '.$this->formatDeliveryMethod($order->delivery_method),
            '',
            'Productos:',
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

        return $this->buildUrl(implode(PHP_EOL, $lines));
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

    private function formatDeliveryMethod(string $deliveryMethod): string
    {
        return match ($deliveryMethod) {
            'pickup' => 'Recoger en local',
            'dine_in' => 'Comer en restaurante',
            default => 'Domicilio',
        };
    }
}
