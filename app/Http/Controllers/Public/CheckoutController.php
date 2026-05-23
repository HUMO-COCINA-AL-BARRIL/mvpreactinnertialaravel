<?php

namespace App\Http\Controllers\Public;

use App\Events\OrderRealtimeUpdated;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Models\BusinessSetting;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\DeliveryFee;
use App\Services\WhatsAppService;
use App\Services\PaymentService;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\RedirectResponse;
use RuntimeException;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Public/Checkout/Create', [
            'availableProducts' => Product::query()
                ->where('is_available', true)
                ->get(['id', 'name', 'price', 'image', 'stock']),
            'deliveryFees' => DeliveryFee::query()
                ->where('is_active', true)
                ->get(['id', 'name', 'price', 'description']),
        ]);
    }

    public function store(StoreOrderRequest $request, WhatsAppService $whatsAppService, PaymentService $paymentService): RedirectResponse
    {
        $business = BusinessSetting::current();
        if (! $business->is_open) {
            return redirect()
                ->back()
                ->withErrors([
                    'message' => $business->closed_message ?: 'El local esta cerrado y no esta recibiendo pedidos en este momento.',
                ]);
        }

        $data = $request->validated();

        DB::beginTransaction();
        try {
            $products = Product::query()
                ->lockForUpdate()
                ->whereIn('id', collect($data['items'])->pluck('product_id')->all())
                ->get()
                ->keyBy('id');

            $computedItems = [];
            $subtotal = 0;
            $deliveryFeeAmount = 0;
            $deliveryFeeId = null;

            foreach ($data['items'] as $item) {
                $product = $products->get((int) $item['product_id']);
                if (! $product || ! $product->is_available) {
                    throw new RuntimeException('Uno de los productos ya no está disponible.');
                }

                $quantity = (int) $item['quantity'];
                if ($product->stock > 0 && $product->stock < $quantity) {
                    throw new RuntimeException("Stock insuficiente para {$product->name}.");
                }

                $lineSubtotal = $product->price * $quantity;
                $subtotal += $lineSubtotal;

                $computedItems[] = [
                    'product' => $product,
                    'quantity' => $quantity,
                    'unit_price' => (int) $product->price,
                    'line_subtotal' => (int) $lineSubtotal,
                ];
            }

            if (($data['delivery_method'] ?? '') === 'delivery') {
                $deliveryFee = DeliveryFee::query()
                    ->where('is_active', true)
                    ->find($data['delivery_fee_id'] ?? null);

                if (! $deliveryFee) {
                    throw new RuntimeException('Debes seleccionar una tarifa de domicilio válida.');
                }

                $deliveryFeeId = $deliveryFee->id;
                $deliveryFeeAmount = (int) $deliveryFee->price;
            }

            $order = Order::create([
                'user_id' => auth()->id(),
                'customer_name' => $data['customer_name'],
                'customer_phone' => $data['customer_phone'],
                'delivery_method' => $data['delivery_method'],
                'delivery_address' => $data['delivery_address'] ?? null,
                'delivery_fee_id' => $deliveryFeeId,
                'notes' => $data['notes'] ?? null,
                'subtotal' => $subtotal,
                'delivery_fee' => $deliveryFeeAmount,
                'total' => $subtotal + $deliveryFeeAmount,
                'status' => Order::STATUS_PENDING,
                'payment_status' => Order::PAYMENT_PENDING,
                'payment_method' => $data['payment_method'],
            ]);

            foreach ($computedItems as $item) {
                $product = $item['product'];

                if ($product->stock > 0) {
                    $product->decrement('stock', $item['quantity']);
                }

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'subtotal' => $item['line_subtotal'],
                ]);
            }

            if ($data['payment_method'] === 'online') {
                $paymentService->createAttempt($order, $data['payment_provider'] ?? 'wompi');
            }

            $order->whatsapp_link = $whatsAppService->generateOrderLink($order);
            $order->save();

            DB::commit();
            OrderRealtimeUpdated::dispatch($order->fresh(), 'created');

            return redirect()
                ->route('orders.tracking', [
                    'order_number' => $order->order_number,
                    'phone' => $order->customer_phone,
                ])
                ->with('clear_cart', true)
                ->with('success', 'Pedido creado correctamente. Ya puedes seguirlo en TrackCheck.');
        } catch (\Exception $e) {
            DB::rollBack();
            report($e);
            $message = $e instanceof RuntimeException
                ? $e->getMessage()
                : 'Error procesando el pedido.';
            return redirect()->back()->withErrors(['message' => $message])->withInput();
        }
    }
}
