<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ArticleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // We'll handle authorization in the controller/policy
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title_fr' => ['required', 'string', 'max:255'],
            'title_en' => ['nullable', 'string', 'max:255'],
            'excerpt_fr' => ['required', 'string'],
            'excerpt_en' => ['nullable', 'string'],
            'content_fr' => ['required', 'string'],
            'content_en' => ['nullable', 'string'],
            'featured_image' => ['nullable', 'string'], // URL from Cloudinary
            'is_premium' => ['boolean'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'published_at' => ['nullable', 'date'],
            'author_name' => ['required', 'string', 'max:255'],
            'category_id' => ['nullable', 'exists:categories,id'], // Make nullable as we use categories array
            'categories' => ['nullable', 'array'],
            'categories.*' => ['exists:categories,id'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'focus_keyword' => ['nullable', 'string', 'max:255'],
            'is_featured' => ['boolean'],
            'featured_until' => ['nullable', 'date', 'after:now'],
        ];
    }
}
