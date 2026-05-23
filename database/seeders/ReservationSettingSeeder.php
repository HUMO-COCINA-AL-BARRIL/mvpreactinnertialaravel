<?php

namespace Database\Seeders;

use App\Models\ReservationSetting;
use Illuminate\Database\Seeder;

class ReservationSettingSeeder extends Seeder
{
    public function run(): void
    {
        ReservationSetting::query()->updateOrCreate(
            ['id' => 1],
            ReservationSetting::defaults()
        );
    }
}
