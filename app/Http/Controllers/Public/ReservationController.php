<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReservationRequest;
use App\Models\Reservation;
use App\Services\ReservationAvailabilityService;
use App\Services\WhatsAppService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ReservationController extends Controller
{
    public function create(ReservationAvailabilityService $availabilityService): Response
    {
        $settings = $availabilityService->getSettings();
        $defaultDate = now()->toDateString();

        return Inertia::render('Public/Reservation/Create', [
            'occasionOptions' => [
                ['value' => 'cumpleanos', 'label' => 'Cumpleanos'],
                ['value' => 'aniversario', 'label' => 'Aniversario'],
                ['value' => 'reunion_familiar', 'label' => 'Reunion familiar'],
                ['value' => 'otro', 'label' => 'Otro'],
            ],
            'reservationSettings' => [
                'capacity_total' => $settings->capacity_total,
                'reservation_duration_minutes' => $settings->reservation_duration_minutes,
                'slot_interval_minutes' => $settings->slot_interval_minutes,
                'open_time' => substr((string) $settings->open_time, 0, 5),
                'close_time' => substr((string) $settings->close_time, 0, 5),
            ],
            'defaultReservationDate' => $defaultDate,
            'availableTimeSlots' => $availabilityService->getSlotsForDate($defaultDate),
        ]);
    }

    public function availability(Request $request, ReservationAvailabilityService $availabilityService): JsonResponse
    {
        $data = $request->validate([
            'date' => ['required', 'date', 'after_or_equal:today'],
        ]);

        return response()->json([
            'slots' => $availabilityService->getSlotsForDate($data['date']),
        ]);
    }

    public function store(
        StoreReservationRequest $request,
        WhatsAppService $whatsAppService,
        ReservationAvailabilityService $availabilityService
    ): RedirectResponse
    {
        $data = $request->validated();
        $data['status'] = Reservation::STATUS_PENDING;

        $availabilityService->ensureCapacity(
            $data['reservation_date'],
            $data['reservation_time'],
            (int) $data['people_count']
        );

        $reservation = Reservation::create($data);

        $reservation->whatsapp_link = $whatsAppService->generateReservationLink($reservation);
        $reservation->save();

        return redirect()
            ->route('reservation.thanks')
            ->with('success', 'Reserva registrada correctamente.')
            ->with('reservation_whatsapp_link', $reservation->whatsapp_link);
    }

    public function thanks(): Response
    {
        return Inertia::render('Public/Reservation/Thanks', [
            'whatsappLink' => session('reservation_whatsapp_link'),
        ]);
    }
}
