<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Poll;
use App\Models\PollOption;
use App\Models\PollVote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PollController extends Controller
{
    public function vote(Request $request, Poll $poll)
    {
        $validated = $request->validate([
            'option_id' => 'required|exists:poll_options,id',
        ]);

        $ip = $request->ip();
        $sessionId = $request->session()->getId();

        // Check if user already voted via cookie
        $votedPolls = json_decode($request->cookie('voted_polls', '[]'), true);
        if (in_array($poll->id, $votedPolls)) {
             return back()->with('error', 'Vous avez déjà voté pour ce sondage.');
        }

        // Check if user already voted via IP/Session (fallback)
        $hasVoted = PollVote::where('poll_id', $poll->id)
            ->where(function ($query) use ($ip, $sessionId) {
                $query->where('ip_address', $ip)
                      ->orWhere('session_id', $sessionId);
            })
            ->exists();

        if ($hasVoted) {
            // Update cookie if missing but DB says voted
             if (!in_array($poll->id, $votedPolls)) {
                $votedPolls[] = $poll->id;
                return back()
                    ->with('error', 'Vous avez déjà voté pour ce sondage.')
                    ->cookie('voted_polls', json_encode($votedPolls), 60 * 24 * 30);
            }
            return back()->with('error', 'Vous avez déjà voté pour ce sondage.');
        }

        DB::transaction(function () use ($poll, $validated, $ip, $sessionId) {
            // Record vote
            PollVote::create([
                'poll_id' => $poll->id,
                'poll_option_id' => $validated['option_id'],
                'ip_address' => $ip,
                'session_id' => $sessionId,
            ]);

            // Increment option count
            PollOption::where('id', $validated['option_id'])->increment('votes');
        });

        // Add cookie to track vote
        $votedPolls[] = $poll->id;

        return back()
            ->with('success', 'Merci pour votre vote !')
            ->cookie('voted_polls', json_encode($votedPolls), 60 * 24 * 30); // 30 days
    }
}
