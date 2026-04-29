<?php

namespace App\Http\Controllers;

use App\Models\Advertisement;
use App\Services\MediaUploadService;
use Illuminate\Http\Request;

class AdvertisementController extends Controller
{
    public function __construct(private readonly MediaUploadService $mediaUploadService)
    {
    }

    public function getByLocation(Request $request)
    {
        $locationId = $request->query('location_id');

        if (!$locationId) {
            return response()->json(['error' => 'location_id requis'], 400);
        }

        $advertisement = Advertisement::getActiveByLocation($locationId);

        return response()->json($advertisement);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'image_url' => 'nullable|url',
            'redirect_url' => 'nullable|url',
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
        ]);

        $advertisement = Advertisement::findOrFail($id);
        $advertisement->update($request->all());

        return response()->json($advertisement);
    }

    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|max:5120',
        ]);

        if ($request->hasFile('image')) {
            $upload = $this->mediaUploadService->upload($request->file('image'), 'advertisements', [
                'max_width' => 2200,
                'quality' => 82,
                'max_image_bytes' => 900000,
                'user_id' => $request->user()?->id,
            ]);

            return response()->json(['url' => (string) ($upload['url'] ?? '')]);
        }

        return response()->json(['error' => 'Aucune image fournie'], 400);
    }

    public function upsert(Request $request)
    {
        $request->validate([
            'location_id' => 'required|string|max:50',
            'image_url' => 'nullable|url',
            'redirect_url' => 'nullable|url',
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
        ]);

        $advertisement = Advertisement::updateOrCreate(
            ['location_id' => $request->location_id],
            $request->only(['image_url', 'redirect_url', 'title', 'description', 'is_active'])
        );

        return response()->json($advertisement);
    }
}