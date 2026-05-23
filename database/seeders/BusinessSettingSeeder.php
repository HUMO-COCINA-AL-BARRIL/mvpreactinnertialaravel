<?php

namespace Database\Seeders;

use App\Models\BusinessSetting;
use Illuminate\Database\Seeder;

class BusinessSettingSeeder extends Seeder
{
    public function run(): void
    {
        BusinessSetting::query()->updateOrCreate(
            ['id' => 1],
            [
                'business_name' => 'HUMO Cocina al Barril',
                'is_open' => true,
                'closed_message' => 'El local esta cerrado en este momento. Vuelve pronto.',
            ]
        );
    }
}
