<?php

namespace App\Http\Middleware;

use App\Models\BusinessSetting;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureCustomizationIsComplete
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! BusinessSetting::current()->setup_completed_at) {
            return redirect()->route('admin.customization.index');
        }

        return $next($request);
    }
}
