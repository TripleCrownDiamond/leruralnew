<x-mail::layout>
{{-- Header --}}
<x-slot:header>
<x-mail::header :url="config('app.url')">
{{ config('app.name') }}
</x-mail::header>
</x-slot:header>

{{-- Body --}}
{!! $slot !!}

{{-- Subcopy --}}
@isset($subcopy)
<x-slot:subcopy>
<x-mail::subcopy>
{!! $subcopy !!}
</x-mail::subcopy>
</x-slot:subcopy>
@endisset

{{-- Footer --}}
<x-slot:footer>
<x-mail::footer>
© {{ date('Y') }} {{ config('app.name') }}. @lang('All rights reserved.')
<br>
{{ \App\Models\Setting::where('key', 'site_address')->value('value') ?? 'Immeuble Le Rural, Cotonou, Bénin' }}
<br>
Tél : {{ \App\Models\Setting::where('key', 'site_phone')->value('value') ?? '+229 01 02 03 04' }}
<br>
Email : <a href="mailto:{{ \App\Models\Setting::where('key', 'site_email')->value('value') ?? 'contact@lerural.bj' }}">{{ \App\Models\Setting::where('key', 'site_email')->value('value') ?? 'contact@lerural.bj' }}</a>
</x-mail::footer>
</x-slot:footer>
</x-mail::layout>
