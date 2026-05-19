<?php

namespace App\Services;

use App\Models\MediaAsset;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaUploadService
{
    public function upload(UploadedFile $file, string $folder = 'uploads', array $options = []): array
    {
        $maxWidth = (int) ($options['max_width'] ?? 2200);
        $quality = (int) ($options['quality'] ?? 84);
        $maxImageBytes = (int) ($options['max_image_bytes'] ?? 1048576);

        $prepared = $this->prepareFileData($file, $maxWidth, $quality, $maxImageBytes);

        foreach ($this->resolveProviderOrder() as $provider) {
            $result = match ($provider) {
                'cloudinary' => $this->uploadToCloudinary($prepared, $folder),
                'imagekit' => $this->uploadToImageKit($prepared, $folder),
                'uploadcare' => $this->uploadToUploadcare($prepared, $folder),
                'storage', 'public' => $this->storeOnPublicDisk($prepared, $folder),
                default => null,
            };

            if ($result !== null) {
                return $this->indexUploadedAsset($file, $result, $options);
            }
        }

        return $this->indexUploadedAsset($file, $this->storeOnPublicDisk($prepared, $folder), $options);
    }

    private function resolveProviderOrder(): array
    {
        $raw = (string) env('MEDIA_UPLOAD_PROVIDERS', 'cloudinary,imagekit,uploadcare,storage');

        $providers = collect(explode(',', $raw))
            ->map(fn ($provider) => strtolower(trim($provider)))
            ->filter()
            ->map(fn ($provider) => $provider === 'public' ? 'storage' : $provider)
            ->filter(fn ($provider) => in_array($provider, ['cloudinary', 'imagekit', 'uploadcare', 'storage'], true))
            ->unique()
            ->values()
            ->all();

        if (!in_array('storage', $providers, true)) {
            $providers[] = 'storage';
        }

        return $providers;
    }

    private function prepareFileData(UploadedFile $file, int $maxWidth, int $quality, int $maxImageBytes): array
    {
        $mime = $file->getMimeType() ?: 'application/octet-stream';
        $originalName = $file->getClientOriginalName();
        $extension = strtolower($file->getClientOriginalExtension() ?: pathinfo($originalName, PATHINFO_EXTENSION) ?: 'bin');

        if (!str_starts_with($mime, 'image/')) {
            $contents = file_get_contents($file->getRealPath());

            return [
                'contents' => $contents === false ? '' : $contents,
                'mime' => $mime,
                'extension' => $extension,
                'original_name' => $originalName,
                'size' => (int) $file->getSize(),
                'width' => null,
                'height' => null,
                'is_image' => false,
            ];
        }

        if (!function_exists('imagecreatefromstring')) {
            $contents = file_get_contents($file->getRealPath());

            return [
                'contents' => $contents === false ? '' : $contents,
                'mime' => $mime,
                'extension' => $extension,
                'original_name' => $originalName,
                'size' => (int) $file->getSize(),
                'width' => null,
                'height' => null,
                'is_image' => true,
            ];
        }

        $raw = file_get_contents($file->getRealPath());
        if ($raw === false) {
            return [
                'contents' => '',
                'mime' => $mime,
                'extension' => $extension,
                'original_name' => $originalName,
                'size' => (int) $file->getSize(),
                'width' => null,
                'height' => null,
                'is_image' => true,
            ];
        }

        if (in_array($extension, ['svg', 'svgz', 'gif'], true)) {
            return [
                'contents' => $raw,
                'mime' => $mime,
                'extension' => $extension,
                'original_name' => $originalName,
                'size' => strlen($raw),
                'width' => null,
                'height' => null,
                'is_image' => true,
            ];
        }

        $image = @imagecreatefromstring($raw);
        if ($image === false) {
            return [
                'contents' => $raw,
                'mime' => $mime,
                'extension' => $extension,
                'original_name' => $originalName,
                'size' => strlen($raw),
                'width' => null,
                'height' => null,
                'is_image' => true,
            ];
        }

        $width = imagesx($image);
        $height = imagesy($image);

        if ($width <= $maxWidth && strlen($raw) <= $maxImageBytes) {
            imagedestroy($image);

            return [
                'contents' => $raw,
                'mime' => $mime,
                'extension' => $extension,
                'original_name' => $originalName,
                'size' => strlen($raw),
                'width' => $width,
                'height' => $height,
                'is_image' => true,
            ];
        }

        if ($width > $maxWidth) {
            $newWidth = $maxWidth;
            $newHeight = max(1, (int) round(($height / max(1, $width)) * $newWidth));
            $resized = imagecreatetruecolor($newWidth, $newHeight);

            imagealphablending($resized, false);
            imagesavealpha($resized, true);
            imagecopyresampled($resized, $image, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);

            imagedestroy($image);
            $image = $resized;
            $width = $newWidth;
            $height = $newHeight;
        }

        $hasAlpha = $this->imageHasAlpha($mime, $extension);
        $encodeQuality = max(62, min(90, $quality));
        $encoded = $this->encodeImage($image, $hasAlpha, $encodeQuality);

        $attempt = 0;
        while (strlen($encoded['contents']) > $maxImageBytes && $attempt < 4 && $width > 640) {
            $newWidth = max(640, (int) floor($width * 0.85));
            $newHeight = max(1, (int) round(($height / max(1, $width)) * $newWidth));

            $resized = imagecreatetruecolor($newWidth, $newHeight);
            imagealphablending($resized, false);
            imagesavealpha($resized, true);
            imagecopyresampled($resized, $image, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);

            imagedestroy($image);
            $image = $resized;
            $width = $newWidth;
            $height = $newHeight;

            $encodeQuality = max(56, $encodeQuality - 7);
            $encoded = $this->encodeImage($image, $hasAlpha, $encodeQuality);
            $attempt++;
        }

        imagedestroy($image);

        return [
            'contents' => $encoded['contents'],
            'mime' => $encoded['mime'],
            'extension' => $encoded['extension'],
            'original_name' => $originalName,
            'size' => strlen($encoded['contents']),
            'width' => $width,
            'height' => $height,
            'is_image' => true,
        ];
    }

    private function imageHasAlpha(string $mime, string $extension): bool
    {
        if (str_contains($mime, 'png') || str_contains($mime, 'webp') || str_contains($mime, 'gif')) {
            return true;
        }

        return in_array($extension, ['png', 'webp', 'gif'], true);
    }


    private function encodeImage($image, bool $hasAlpha, int $quality): array
    {
        $extension = 'jpg';
        $mime = 'image/jpeg';

        ob_start();
        if ($hasAlpha) {
            if (function_exists('imagewebp')) {
                imagepalettetotruecolor($image);
                imagealphablending($image, false);
                imagesavealpha($image, true);
                imagewebp($image, null, $quality);
                $extension = 'webp';
                $mime = 'image/webp';
            } else {
                imagealphablending($image, false);
                imagesavealpha($image, true);
                imagepng($image, null, 7);
                $extension = 'png';
                $mime = 'image/png';
            }
        } elseif (function_exists('imagewebp')) {
            imagewebp($image, null, $quality);
            $extension = 'webp';
            $mime = 'image/webp';
        } else {
            imagejpeg($image, null, $quality);
            $extension = 'jpg';
            $mime = 'image/jpeg';
        }

        return [
            'contents' => (string) ob_get_clean(),
            'extension' => $extension,
            'mime' => $mime,
        ];
    }
    private function uploadToCloudinary(array $prepared, string $folder): ?array
    {
        $cloudName = env('CLOUDINARY_CLOUD_NAME') ?: env('VITE_CLOUDINARY_CLOUD_NAME');
        $uploadPreset = env('CLOUDINARY_UPLOAD_PRESET') ?: env('VITE_CLOUDINARY_UPLOAD_PRESET');

        if (!$cloudName || !$uploadPreset) {
            return null;
        }

        try {
            $folderPath = trim($folder, '/');
            $publicId = Str::uuid()->toString();

            $response = Http::connectTimeout(5)
                ->timeout(15)
                ->attach(
                'file',
                $prepared['contents'],
                $this->buildFileName($prepared['original_name'], $prepared['extension'])
            )->post("https://api.cloudinary.com/v1_1/{$cloudName}/auto/upload", [
                'upload_preset' => $uploadPreset,
                'folder' => $folderPath,
                'public_id' => $publicId,
                'resource_type' => 'auto',
                'quality' => 'auto',
                'fetch_format' => 'auto',
            ]);

            if (!$response->successful()) {
                return null;
            }

            $json = $response->json();
            $secureUrl = $json['secure_url'] ?? null;
            $returnedPublicId = $json['public_id'] ?? $publicId;

            if (!$secureUrl) {
                return null;
            }

            return [
                'disk' => 'cloudinary',
                'url' => $secureUrl,
                'path' => $returnedPublicId,
                'mime_type' => (string) ($prepared['mime'] ?? 'application/octet-stream'),
                'size' => (int) ($json['bytes'] ?? $prepared['size']),
                'extension' => (string) ($json['format'] ?? $prepared['extension']),
                'width' => $prepared['width'],
                'height' => $prepared['height'],
                'meta' => [
                    'provider' => 'cloudinary',
                    'public_id' => $returnedPublicId,
                    'raw' => $json,
                ],
            ];
        } catch (\Throwable $exception) {
            report($exception);

            return null;
        }
    }

    private function uploadToImageKit(array $prepared, string $folder): ?array
    {
        $privateKey = (string) env('IMAGEKIT_PRIVATE_KEY', '');

        if ($privateKey === '') {
            return null;
        }

        try {
            $fileName = $this->buildFileName($prepared['original_name'], $prepared['extension']);
            $targetFolder = '/' . trim($folder, '/');

            $response = Http::connectTimeout(5)
                ->timeout(15)
                ->withBasicAuth($privateKey, '')
                ->asMultipart()
                ->post('https://upload.imagekit.io/api/v1/files/upload', [
                [
                    'name' => 'file',
                    'contents' => $prepared['contents'],
                    'filename' => $fileName,
                ],
                [
                    'name' => 'fileName',
                    'contents' => $fileName,
                ],
                [
                    'name' => 'folder',
                    'contents' => $targetFolder,
                ],
                [
                    'name' => 'useUniqueFileName',
                    'contents' => 'true',
                ],
            ]);

            if (!$response->successful()) {
                return null;
            }

            $json = $response->json();
            $url = (string) ($json['url'] ?? '');
            if ($url === '') {
                return null;
            }

            $filePath = (string) ($json['filePath'] ?? '');
            $fileId = (string) ($json['fileId'] ?? '');
            $extension = strtolower(pathinfo(parse_url($url, PHP_URL_PATH) ?? '', PATHINFO_EXTENSION) ?: ($prepared['extension'] ?? 'bin'));

            return [
                'disk' => 'imagekit',
                'url' => $url,
                'path' => $filePath !== '' ? $filePath : ($json['name'] ?? $fileName),
                'mime_type' => (string) ($json['mime'] ?? $prepared['mime'] ?? 'application/octet-stream'),
                'size' => (int) ($json['size'] ?? $prepared['size'] ?? 0),
                'extension' => $extension,
                'width' => $prepared['width'],
                'height' => $prepared['height'],
                'meta' => [
                    'provider' => 'imagekit',
                    'file_id' => $fileId,
                    'file_path' => $filePath,
                    'raw' => $json,
                ],
            ];
        } catch (\Throwable $exception) {
            report($exception);

            return null;
        }
    }

    private function uploadToUploadcare(array $prepared, string $folder): ?array
    {
        $publicKey = (string) env('UPLOADCARE_PUBLIC_KEY', '');

        if ($publicKey === '') {
            return null;
        }

        try {
            $fileName = $this->buildFileName($prepared['original_name'], $prepared['extension']);
            $response = Http::connectTimeout(5)
                ->timeout(15)
                ->asMultipart()
                ->post('https://upload.uploadcare.com/base/', [
                [
                    'name' => 'UPLOADCARE_PUB_KEY',
                    'contents' => $publicKey,
                ],
                [
                    'name' => 'UPLOADCARE_STORE',
                    'contents' => '1',
                ],
                [
                    'name' => 'file',
                    'contents' => $prepared['contents'],
                    'filename' => $fileName,
                ],
            ]);

            if (!$response->successful()) {
                return null;
            }

            $json = $response->json();
            $uuid = (string) ($json['file'] ?? '');
            if ($uuid === '') {
                return null;
            }

            return [
                'disk' => 'uploadcare',
                'url' => "https://ucarecdn.com/{$uuid}/",
                'path' => trim($folder, '/') . '/' . $uuid,
                'mime_type' => (string) ($prepared['mime'] ?? 'application/octet-stream'),
                'size' => (int) ($prepared['size'] ?? 0),
                'extension' => (string) ($prepared['extension'] ?? 'bin'),
                'width' => $prepared['width'],
                'height' => $prepared['height'],
                'meta' => [
                    'provider' => 'uploadcare',
                    'uuid' => $uuid,
                    'folder' => trim($folder, '/'),
                    'raw' => $json,
                ],
            ];
        } catch (\Throwable $exception) {
            report($exception);

            return null;
        }
    }

    private function storeOnPublicDisk(array $prepared, string $folder): array
    {
        $relativePath = trim($folder, '/') . '/' . Str::uuid()->toString() . '.' . $prepared['extension'];
        Storage::disk('public')->put($relativePath, $prepared['contents']);

        return [
            'disk' => 'public',
            'url' => $this->publicMediaUrl($relativePath),
            'path' => $relativePath,
            'mime_type' => $prepared['mime'],
            'size' => $prepared['size'],
            'extension' => $prepared['extension'],
            'width' => $prepared['width'],
            'height' => $prepared['height'],
            'meta' => [
                'provider' => 'storage',
            ],
        ];
    }

    private function publicMediaUrl(string $relativePath): string
    {
        $normalized = ltrim($relativePath, '/');

        return url('/public-media/' . ltrim($normalized, '/'));

    }

    private function buildFileName(string $originalName, string $extension): string
    {
        $base = pathinfo($originalName, PATHINFO_FILENAME);
        $safe = Str::slug($base);

        return ($safe !== '' ? $safe : 'file') . '.' . $extension;
    }

    public function delete(string $disk, ?string $path, array $meta = []): void
    {
        if (!$path) {
            return;
        }

        if ($disk === 'public') {
            Storage::disk('public')->delete($path);
            return;
        }

        if ($disk === 'cloudinary') {
            $publicId = $meta['public_id'] ?? $path;
            $cloudName = env('CLOUDINARY_CLOUD_NAME') ?: env('VITE_CLOUDINARY_CLOUD_NAME');
            $apiKey = env('CLOUDINARY_API_KEY') ?: env('VITE_CLOUDINARY_API_KEY');
            $apiSecret = env('CLOUDINARY_API_SECRET');

            if (!$cloudName || !$apiKey || !$apiSecret || !$publicId) {
                return;
            }

            try {
                $timestamp = time();
                $signature = sha1("public_id={$publicId}&timestamp={$timestamp}{$apiSecret}");

                Http::connectTimeout(5)
                    ->timeout(15)
                    ->asForm()
                    ->post("https://api.cloudinary.com/v1_1/{$cloudName}/image/destroy", [
                    'public_id' => $publicId,
                    'api_key' => $apiKey,
                    'timestamp' => $timestamp,
                    'signature' => $signature,
                    'invalidate' => true,
                ]);
            } catch (\Throwable $exception) {
                report($exception);
            }

            return;
        }

        if ($disk === 'imagekit') {
            $privateKey = (string) env('IMAGEKIT_PRIVATE_KEY', '');
            $fileId = (string) ($meta['file_id'] ?? '');

            if ($privateKey === '' || $fileId === '') {
                return;
            }

            try {
                Http::connectTimeout(5)
                    ->timeout(15)
                    ->withBasicAuth($privateKey, '')
                    ->delete("https://api.imagekit.io/v1/files/{$fileId}");
            } catch (\Throwable $exception) {
                report($exception);
            }

            return;
        }

        if ($disk === 'uploadcare') {
            $publicKey = (string) env('UPLOADCARE_PUBLIC_KEY', '');
            $secretKey = (string) env('UPLOADCARE_SECRET_KEY', '');
            $uuid = (string) ($meta['uuid'] ?? '');

            if ($publicKey === '' || $secretKey === '' || $uuid === '') {
                return;
            }

            try {
                Http::withBasicAuth($publicKey, $secretKey)->delete("https://api.uploadcare.com/files/{$uuid}/");
            } catch (\Throwable $exception) {
                report($exception);
            }
        }
    }

    private function indexUploadedAsset(UploadedFile $file, array $result, array $options): array
    {
        if (($options['index_media'] ?? true) === false) {
            return $result;
        }

        try {
            $mime = (string) ($result['mime_type'] ?? $file->getMimeType() ?? 'application/octet-stream');
            $extension = strtolower((string) ($result['extension'] ?? $file->getClientOriginalExtension()));
            $originalName = $file->getClientOriginalName() ?: ('file.' . ($extension ?: 'bin'));
            $base = pathinfo($originalName, PATHINFO_FILENAME);

            $asset = MediaAsset::create([
                'user_id' => $options['user_id'] ?? Auth::id(),
                'original_name' => $originalName,
                'file_name' => (Str::slug($base) ?: 'file') . '.' . ($extension ?: 'bin'),
                'mime_type' => $mime,
                'file_size' => (int) ($result['size'] ?? $file->getSize() ?? 0),
                'extension' => $extension !== '' ? $extension : null,
                'kind' => $this->resolveKind($mime, $extension),
                'disk' => (string) ($result['disk'] ?? 'public'),
                'path' => $result['path'] ?? null,
                'url' => (string) ($result['url'] ?? ''),
                'width' => $result['width'] ?? null,
                'height' => $result['height'] ?? null,
                'meta' => $result['meta'] ?? [],
            ]);

            $result['asset_id'] = $asset->id;
        } catch (\Throwable $exception) {
            report($exception);
        }

        return $result;
    }

    private function resolveKind(string $mime, ?string $extension = null): string
    {
        $mime = strtolower($mime);
        $extension = strtolower((string) $extension);

        if (str_starts_with($mime, 'image/') || in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'avif'], true)) {
            return 'image';
        }

        if (str_starts_with($mime, 'video/') || in_array($extension, ['mp4', 'webm', 'mov', 'mkv'], true)) {
            return 'video';
        }

        if (str_starts_with($mime, 'audio/') || in_array($extension, ['mp3', 'wav', 'aac', 'ogg'], true)) {
            return 'audio';
        }

        if (str_contains($mime, 'pdf') || str_contains($mime, 'word') || str_contains($mime, 'text') || in_array($extension, ['pdf', 'doc', 'docx', 'txt', 'rtf'], true)) {
            return 'document';
        }

        if (str_contains($mime, 'zip') || str_contains($mime, 'rar') || in_array($extension, ['zip', 'rar', '7z', 'tar', 'gz'], true)) {
            return 'archive';
        }

        return 'other';
    }
}





