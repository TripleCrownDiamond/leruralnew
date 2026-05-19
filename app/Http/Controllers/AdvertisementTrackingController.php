<?php

namespace App\Http\Controllers;

use App\Models\Advertisement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Response;

class AdvertisementTrackingController extends Controller
{
    public function view(Advertisement $advertisement): Response
    {
        $advertisement->increment('view_count');

        return response()->noContent();
    }

    public function click(Advertisement $advertisement): RedirectResponse|Response
    {
        $advertisement->increment('click_count');

        if (! filled($advertisement->redirect_url)) {
            return response()->noContent();
        }

        return redirect()->away($advertisement->redirect_url);
    }
}