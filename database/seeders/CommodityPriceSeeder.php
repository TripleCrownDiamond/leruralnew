<?php

namespace Database\Seeders;

use App\Models\CommodityPrice;
use Illuminate\Database\Seeder;

class CommodityPriceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $prices = [
            [
                'name' => 'Cacao',
                'country' => 'CI',
                'price' => '2 800',
                'unit' => 'FCFA/kg',
                'note' => 'Campagne 2025-2026',
            ],
            [
                'name' => 'Café',
                'country' => 'CI',
                'price' => '1 700',
                'unit' => 'FCFA/kg',
                'note' => 'Campagne 2025-2026',
            ],
            [
                'name' => 'Anacarde',
                'country' => 'CI',
                'price' => '425',
                'unit' => 'FCFA/kg',
                'note' => 'Campagne 2025',
            ],
            [
                'name' => 'Anacarde',
                'country' => 'BF',
                'price' => '385',
                'unit' => 'FCFA/kg',
                'note' => 'Campagne 2025',
            ],
            [
                'name' => 'Anacarde',
                'country' => 'BJ',
                'price' => '375',
                'unit' => 'FCFA/kg',
                'note' => 'Campagne 2025',
            ],
            [
                'name' => 'Coton',
                'country' => 'CI',
                'price' => '310',
                'unit' => 'FCFA/kg',
                'note' => '1er choix',
            ],
        ];

        foreach ($prices as $p) {
            CommodityPrice::updateOrCreate(
                ['name' => $p['name'], 'country' => $p['country']],
                $p
            );
        }
    }
}
