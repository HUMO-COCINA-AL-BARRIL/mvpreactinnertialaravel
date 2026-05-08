<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DeliveryFee;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminDeliveryFeeController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/DeliveryFees/Index', [
            'deliveryFees' => DeliveryFee::query()->latest()->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'price' => ['required', 'integer', 'min:0'],
            'description' => ['nullable', 'string'],
            'is_active' => ['required', 'boolean'],
        ]);

        DeliveryFee::create($data);

        return back()->with('success', 'Tarifa de domicilio creada correctamente.');
    }

    public function update(Request $request, DeliveryFee $deliveryFee): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'price' => ['required', 'integer', 'min:0'],
            'description' => ['nullable', 'string'],
            'is_active' => ['required', 'boolean'],
        ]);

        $deliveryFee->update($data);

        return back()->with('success', 'Tarifa de domicilio actualizada correctamente.');
    }

    public function destroy(DeliveryFee $deliveryFee): RedirectResponse
    {
        $deliveryFee->delete();

        return back()->with('success', 'Tarifa de domicilio eliminada correctamente.');
    }
}
