<?php

namespace Database\Seeders;

use App\Models\WebTvVideo;
use Illuminate\Database\Seeder;

class WebTvVideoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Données basées sur la chaîne YouTube Le Rural
        $videos = [
            [
                'title' => 'C\'est le moment - S1 - ÉPISODE 2 : Tout savoir sur l\'élevage de lapins',
                'youtube_id' => 'k3eY-Z8q1g8',
                'thumbnail' => 'https://img.youtube.com/vi/k3eY-Z8q1g8/maxresdefault.jpg',
                'emission_name' => 'C\'est le moment',
                'emission_image' => 'https://yt3.googleusercontent.com/ytc/AIdro_mQ1XQ_XQ_XQ_XQ_XQ_XQ_XQ_XQ=s176-c-k-c0x00ffffff-no-rj',
                'emission_link' => 'https://www.youtube.com/playlist?list=PLt5Q',
                'published_at' => now()->subDays(2),
                'is_featured' => true,
            ],
            [
                'title' => 'La production de l\'Ananas pain de sucre au Bénin : un levier économique',
                'youtube_id' => '1XgJq1g8XQ', // Placeholder ID replaced with realistic format
                'thumbnail' => 'https://img.youtube.com/vi/1XgJq1g8XQ/maxresdefault.jpg',
                'emission_name' => 'Reportage',
                'emission_image' => null,
                'emission_link' => null,
                'published_at' => now()->subDays(5),
                'is_featured' => false,
            ],
            [
                'title' => 'Comment réussir la culture de la tomate en saison pluvieuse ?',
                'youtube_id' => '2YhKp2h9YR', // Placeholder ID replaced with realistic format
                'thumbnail' => 'https://img.youtube.com/vi/2YhKp2h9YR/maxresdefault.jpg',
                'emission_name' => 'Conseil Agricole',
                'emission_image' => null,
                'emission_link' => null,
                'published_at' => now()->subDays(10),
                'is_featured' => false,
            ],
            [
                'title' => 'L\'entrepreneuriat agricole des jeunes : Défis et Opportunités',
                'youtube_id' => '3ZjLr3j0ZS', // Placeholder ID replaced with realistic format
                'thumbnail' => 'https://img.youtube.com/vi/3ZjLr3j0ZS/maxresdefault.jpg',
                'emission_name' => 'Talk Show',
                'emission_image' => null,
                'emission_link' => null,
                'published_at' => now()->subDays(15),
                'is_featured' => false,
            ],
        ];

        foreach ($videos as $video) {
            WebTvVideo::updateOrCreate(
                ['youtube_id' => $video['youtube_id']],
                $video
            );
        }
    }
}
