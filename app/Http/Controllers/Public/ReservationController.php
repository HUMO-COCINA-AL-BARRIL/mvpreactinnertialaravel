<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReservationRequest;
use App\Models\Reservation;
use App\Services\WhatsAppService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ReservationController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Public/Reservation/Create');
    }

    public function store(StoreReservationRequest $request, WhatsAppService $whatsAppService): RedirectResponse
    {
        $reservation = Reservation::create($request->validated());

        $reservation->whatsapp_link = $whatsAppService->generateReservationLink($reservation);
        $reservation->save();

        return redirect()->route('reservation.thanks');
    }

    public function thanks(): Response
    {
        return Inertia::render('Public/Reservation/Thanks');
    }
}
