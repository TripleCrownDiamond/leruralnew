<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\Partner;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

class PartnerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all files from public/partners directory
        $path = public_path('partners');
        
        if (!File::exists($path)) {
            File::makeDirectory($path, 0755, true);
        }

        $files = File::files($path);

        if (count($files) > 0) {
            foreach ($files as $index => $file) {
                $filename = $file->getFilename();
                // Create partner entry
                Partner::create([
                    'name' => pathinfo($filename, PATHINFO_FILENAME),
                    'logo' => '/partners/' . $filename,
                    'url' => '#', // Placeholder URL
                    'is_active' => true,
                    'order' => $index,
                ]);
            }
        } else {
            // If no files, create some dummy entries using placeholders if needed, 
            // or just leave empty and rely on user adding files.
            // But user asked to use logos from that folder.
            // Let's create a few dummy ones pointing to potential files just in case
            $dummies = ['Partner 1', 'Partner 2', 'Partner 3', 'Partner 4', 'Partner 5'];
            foreach ($dummies as $index => $name) {
                Partner::create([
                    'name' => $name,
                    'logo' => 'https://ui-avatars.com/api/?name=' . urlencode($name) . '&background=random',
                    'url' => '#',
                    'is_active' => true,
                    'order' => $index,
                ]);
            }
        }
    }
}
