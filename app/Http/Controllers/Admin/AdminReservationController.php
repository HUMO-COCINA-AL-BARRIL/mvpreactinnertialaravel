<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\ReservationSetting;
use App\Services\ReservationAvailabilityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AdminReservationController extends Controller
{
    public function index(ReservationAvailabilityService $availabilityService): Response
    {
        $settings = $availabilityService->getSettings();
        $defaultDate = now()->toDateString();

        return Inertia::render('Admin/Reservations/Index', [
            'reservations' => Reservation::query()
                ->latest('reservation_date')
                ->latest('reservation_time')
                ->get(),
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
            'date' => ['required', 'date'],
            'ignore_reservation_id' => ['nullable', 'integer', 'exists:reservations,id'],
        ]);

        return response()->json([
            'slots' => $availabilityService->getSlotsForDate(
                $data['date'],
                $data['ignore_reservation_id'] ?? null
            ),
        ]);
    }

    public function updateSettings(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'capacity_total' => ['required', 'integer', 'min:1', 'max:500'],
            'reservation_duration_minutes' => ['required', 'integer', 'min:30', 'max:480'],
            'slot_interval_minutes' => ['required', 'integer', Rule::in([15, 20, 30, 45, 60])],
            'open_time' => ['required', 'date_format:H:i'],
            'close_time' => ['required', 'date_format:H:i', 'after:open_time'],
        ]);

        ReservationSetting::current()->update($data);

        return back()->with('success', 'Configuracion de reservas actualizada correctamente.');
    }

    public function store(Request $request, ReservationAvailabilityService $availabilityService): RedirectResponse
    {
        $data = $this->validateData($request);

        if (in_array($data['status'], $availabilityService->blockingStatuses(), true)) {
            $availabilityService->ensureCapacity(
                $data['reservation_date'],
                $data['reservation_time'],
                (int) $data['people_count']
            );
        }

        Reservation::create($data);

        return back()->with('success', 'Reserva creada correctamente.');
    }

    public function update(Request $request, Reservation $reservation, ReservationAvailabilityService $availabilityService): RedirectResponse
    {
        $data = $this->validateData($request);

        if (in_array($data['status'], $availabilityService->blockingStatuses(), true)) {
            $availabilityService->ensureCapacity(
                $data['reservation_date'],
                $data['reservation_time'],
                (int) $data['people_count'],
                $reservation->id
            );
        }

        $reservation->update($data);

        return back()->with('success', 'Reserva actualizada correctamente.');
    }

    public function destroy(Reservation $reservation): RedirectResponse
    {
        $reservation->delete();

        return back()->with('success', 'Reserva eliminada correctamente.');
    }

    private function validateData(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:30'],
            'reservation_date' => ['required', 'date'],
            'reservation_time' => ['required', 'date_format:H:i'],
            'people_count' => ['required', 'integer', 'min:1', 'max:200'],
            'occasion' => ['required', 'in:cumpleanos,aniversario,reunion_familiar,otro'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'status' => ['required', 'in:pending,confirmed,completed,cancelled,no_show'],
        ]);
    }
}
