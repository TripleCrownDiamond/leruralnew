<?php

namespace App\Http\Controllers;

use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;

class PublicMediaController extends Controller
{
    public function show(string $path): Response
    {
        $normalized = ltrim($path, '/');

        abort_unless($normalized !== '' && Storage::disk('public')->exists($normalized), 404);

        return Storage::disk('public')->response($normalized);
    }
}
