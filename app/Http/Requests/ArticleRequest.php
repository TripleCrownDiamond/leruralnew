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
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'publication_mode' => ['required', 'in:draft,now,scheduled'],
            'title_fr' => ['required', 'string', 'max:255'],
            'title_en' => ['nullable', 'string', 'max:255'],
            'excerpt_fr' => ['required', 'string'],
            'excerpt_en' => ['nullable', 'string'],
            'content_fr' => ['required', 'string'],
            'content_en' => ['nullable', 'string'],
            'featured_image' => ['nullable', 'string'],
            'featured_image_position_x' => ['nullable', 'integer', 'min:0', 'max:100'],
            'featured_image_position_y' => ['nullable', 'integer', 'min:0', 'max:100'],
            'is_premium' => ['boolean'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'published_at' => ['nullable', 'required_if:publication_mode,scheduled', 'date'],
            'author_name' => ['required', 'string', 'max:255'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'categories' => ['nullable', 'array'],
            'categories.*' => ['exists:categories,id'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'focus_keyword' => ['nullable', 'string', 'max:255'],
            'is_featured' => ['boolean'],
            'featured_until' => ['nullable', 'date', 'after:now'],
        ];
    }

    /**
     * Get custom error messages for validation rules.
     */
    public function messages(): array
    {
        return [
            'content_fr.required' => 'Le contenu en francais est requis.',
            'excerpt_en.string' => 'L\'extrait en anglais doit etre une chaine de caracteres.',
        ];
    }
}