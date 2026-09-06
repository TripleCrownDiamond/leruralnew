<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PublicMediaController extends Controller
{
    public function show(string $path): StreamedResponse
    {
        $normalized = ltrim($path, '/');

        abort_unless($normalized !== '' && Storage::disk('public')->exists($normalized), 404);

        return Storage::disk('public')->response($normalized);
    }
}
