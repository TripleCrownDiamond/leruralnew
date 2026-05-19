<?php

namespace App\Http\Controllers\Admin;

use App\Models\PressPaper;
use App\Services\MediaUploadService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PressPaperController extends AdminController
{
    public function __construct(private readonly MediaUploadService $mediaUploadService)
    {
        parent::__construct();
    }

    public function index(): Response
    {
        return Inertia::render('Dashboard/PressPapers/Index', [
            'pressPapers' => PressPaper::query()
                ->orderByDesc('published_at')
                ->orderByDesc('id')
                ->get()
                ->map(fn (PressPaper $paper) => [
                    'id' => $paper->id,
                    'title' => $paper->title,
                    'slug' => $paper->slug,
                    'description' => $paper->description,
                    'cover_image' => $paper->cover_image,
                    'cover_url' => $this->toPublicUrl($paper->cover_image),
                    'pdf_file' => $paper->pdf_file,
                    'pdf_url' => $this->toPublicUrl($paper->pdf_file),
                    'price' => (float) $paper->price,
                    'is_active' => $paper->is_active,
                    'published_at' => optional($paper->published_at)?->format('Y-m-d\TH:i'),
                ])
                ->values(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'cover_image' => ['nullable', 'image', 'max:4096'],
            'cover_image_url' => ['nullable', 'url', 'max:2048'],
            'pdf_file' => ['nullable', 'file', 'mimes:pdf', 'max:20480'],
            'pdf_file_url' => ['nullable', 'url', 'max:2048'],
            'price' => ['required', 'numeric', 'min:0'],
            'is_active' => ['boolean'],
            'published_at' => ['nullable', 'date'],
        ]);

        $slug = $this->generateUniqueSlug($data['title']);

        $coverImagePath = filled($data['cover_image_url'] ?? null) ? trim((string) $data['cover_image_url']) : null;
        if ($request->hasFile('cover_image')) {
            $upload = $this->mediaUploadService->upload($request->file('cover_image'), 'press-papers/covers', [
                'max_width' => 1800,
                'quality' => 84,
            ]);
            $coverImagePath = $upload['url'];
        }

        $pdfPath = filled($data['pdf_file_url'] ?? null) ? trim((string) $data['pdf_file_url']) : null;
        if ($request->hasFile('pdf_file')) {
            $upload = $this->mediaUploadService->upload($request->file('pdf_file'), 'press-papers/pdfs', [
                'quality' => 88,
            ]);
            $pdfPath = $upload['url'];
        }

        if (!$pdfPath) {
            return back()->withErrors(['pdf_file' => 'Le fichier PDF est obligatoire.'])->withInput();
        }

        PressPaper::create([
            'title' => trim($data['title']),
            'slug' => $slug,
            'description' => filled($data['description'] ?? null) ? trim($data['description']) : null,
            'cover_image' => $coverImagePath,
            'pdf_file' => $pdfPath,
            'price' => $data['price'],
            'is_active' => !empty($data['is_active']),
            'published_at' => $data['published_at'] ?? null,
        ]);

        $this->flushSharedContentCache();

        return back()->with('success', 'Edition papier ajoutee.');
    }

    public function update(Request $request, PressPaper $pressPaper)
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'cover_image' => ['nullable', 'image', 'max:4096'],
            'cover_image_url' => ['nullable', 'url', 'max:2048'],
            'pdf_file' => ['nullable', 'file', 'mimes:pdf', 'max:20480'],
            'pdf_file_url' => ['nullable', 'url', 'max:2048'],
            'price' => ['required', 'numeric', 'min:0'],
            'is_active' => ['boolean'],
            'published_at' => ['nullable', 'date'],
        ]);

        $slug = $pressPaper->title === trim($data['title'])
            ? $pressPaper->slug
            : $this->generateUniqueSlug($data['title'], $pressPaper->id);

        $coverImagePath = filled($data['cover_image_url'] ?? null) ? trim((string) $data['cover_image_url']) : $pressPaper->cover_image;
        if ($request->hasFile('cover_image')) {
            $upload = $this->mediaUploadService->upload($request->file('cover_image'), 'press-papers/covers', [
                'max_width' => 1800,
                'quality' => 84,
            ]);
            $coverImagePath = $upload['url'];
        }

        $pdfPath = filled($data['pdf_file_url'] ?? null) ? trim((string) $data['pdf_file_url']) : $pressPaper->pdf_file;
        if ($request->hasFile('pdf_file')) {
            $upload = $this->mediaUploadService->upload($request->file('pdf_file'), 'press-papers/pdfs', [
                'quality' => 88,
            ]);
            $pdfPath = $upload['url'];
        }

        $pressPaper->update([
            'title' => trim($data['title']),
            'slug' => $slug,
            'description' => filled($data['description'] ?? null) ? trim($data['description']) : null,
            'cover_image' => $coverImagePath,
            'pdf_file' => $pdfPath,
            'price' => $data['price'],
            'is_active' => !empty($data['is_active']),
            'published_at' => $data['published_at'] ?? null,
        ]);

        $this->flushSharedContentCache();

        return back()->with('success', 'Edition papier mise a jour.');
    }

    public function destroy(PressPaper $pressPaper)
    {
        $this->deleteStoredMedia($pressPaper->getRawOriginal('cover_image'));
        $this->deleteStoredMedia($pressPaper->getRawOriginal('pdf_file'));

        $pressPaper->delete();

        $this->flushSharedContentCache();

        return back()->with('success', 'Edition papier supprimee.');
    }

    private function flushSharedContentCache(): void
    {
        Cache::forget('shared_content:v1');
    }

    private function toPublicUrl(?string $path): ?string
    {
        if (!$path) {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        $normalized = preg_replace('#^/?storage/#', '', $path) ?? $path;
        $normalized = ltrim((string) preg_replace('#^public/#', '', $normalized), '/');

        if ($normalized === '') {
            return null;
        }

        return Storage::disk('public')->url($normalized);
    }

    private function deleteStoredMedia(?string $path): void
    {
        if (!$path) {
            return;
        }

        if (preg_match('#^https?://#i', $path) === 1) {
            $parsed = parse_url($path);
            $candidate = $parsed['path'] ?? '';
            if ($candidate === '') {
                return;
            }

            $path = $candidate;
        }

        $normalized = preg_replace('#^/?storage/#', '', $path) ?? $path;
        $normalized = ltrim((string) preg_replace('#^public/#', '', $normalized), '/');

        if ($normalized === '') {
            return;
        }

        Storage::disk('public')->delete($normalized);
    }

    private function generateUniqueSlug(string $title, ?int $ignoreId = null): string
    {
        $base = Str::slug(trim($title));
        $slug = $base ?: Str::random(8);
        $counter = 1;

        while (
            PressPaper::query()
                ->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))
                ->where('slug', $slug)
                ->exists()
        ) {
            $slug = sprintf('%s-%d', $base ?: 'edition', $counter);
            $counter++;
        }

        return $slug;
    }
}