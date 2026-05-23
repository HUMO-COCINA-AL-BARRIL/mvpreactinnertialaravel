<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BusinessSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Schema;

class AdminBusinessStatusController extends Controller
{
    public function update(): RedirectResponse
    {
        if (! Schema::hasTable('business_settings')) {
            return back()->with('error', 'Primero ejecuta las migraciones para activar el control del comercio.');
        }

        $settings = BusinessSetting::current();
        $settings->update([
            'is_open' => ! $settings->is_open,
        ]);

        return back()->with(
            'success',
            $settings->is_open
                ? 'El comercio ahora esta abierto para pedidos.'
                : 'El comercio ahora esta cerrado para pedidos.'
        );
    }
}
