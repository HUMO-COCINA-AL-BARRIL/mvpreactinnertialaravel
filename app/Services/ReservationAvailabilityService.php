<?php

namespace App\Services;

use App\Models\Reservation;
use App\Models\ReservationSetting;
use Carbon\Carbon;
use Carbon\CarbonImmutable;
use Illuminate\Validation\ValidationException;

class ReservationAvailabilityService
{
    public function getSettings(): ReservationSetting
    {
        return ReservationSetting::current();
    }

    public function getSlotsForDate(string $date, ?int $ignoreReservationId = null): array
    {
        $settings = $this->getSettings();
        $capacity = max(1, (int) $settings->capacity_total);
        $duration = max(30, (int) $settings->reservation_duration_minutes);
        $interval = max(15, (int) $settings->slot_interval_minutes);

        $day = CarbonImmutable::parse($date)->startOfDay();
        $opening = $day->setTimeFromTimeString($settings->open_time);
        $closing = $day->setTimeFromTimeString($settings->close_time);
        $lastStart = $closing->subMinutes($duration);

        if ($lastStart->lessThan($opening)) {
            return [];
        }

        $reservations = Reservation::query()
            ->whereDate('reservation_date', $day->toDateString())
            ->whereIn('status', $this->blockingStatuses())
            ->when($ignoreReservationId, fn ($query) => $query->whereKeyNot($ignoreReservationId))
            ->get();

        $slots = [];

        for ($cursor = $opening; $cursor->lessThanOrEqualTo($lastStart); $cursor = $cursor->addMinutes($interval)) {
            $slotEnd = $cursor->addMinutes($duration);
            $reservedPeople = $reservations
                ->filter(function (Reservation $reservation) use ($cursor, $slotEnd, $duration, $day) {
                    $reservationStart = $day->setTimeFromTimeString(substr((string) $reservation->reservation_time, 0, 5));
                    $reservationEnd = $reservationStart->addMinutes($duration);

                    return $reservationStart->lt($slotEnd) && $reservationEnd->gt($cursor);
                })
                ->sum('people_count');

            $remainingCapacity = max(0, $capacity - $reservedPeople);

            $slots[] = [
                'value' => $cursor->format('H:i'),
                'label' => $cursor->format('H:i'),
                'reserved_people' => $reservedPeople,
                'remaining_capacity' => $remainingCapacity,
                'is_available' => $remainingCapacity > 0,
            ];
        }

        return $slots;
    }

    public function ensureCapacity(string $date, string $time, int $peopleCount, ?int $ignoreReservationId = null): void
    {
        $settings = $this->getSettings();
        $slots = collect($this->getSlotsForDate($date, $ignoreReservationId))->keyBy('value');

        if (! $slots->has($time)) {
            throw ValidationException::withMessages([
                'reservation_time' => 'La hora seleccionada no esta disponible dentro del horario configurado.',
            ]);
        }

        if ($peopleCount > (int) $settings->capacity_total) {
            throw ValidationException::withMessages([
                'people_count' => 'La cantidad de personas supera el cupo total configurado.',
            ]);
        }

        $slot = $slots->get($time);

        if (($slot['remaining_capacity'] ?? 0) < $peopleCount) {
            throw ValidationException::withMessages([
                'reservation_time' => 'Ya no hay disponibilidad para ese horario con la cantidad de personas solicitada.',
            ]);
        }
    }

    public function blockingStatuses(): array
    {
        return [
            Reservation::STATUS_PENDING,
            Reservation::STATUS_CONFIRMED,
        ];
    }
}
