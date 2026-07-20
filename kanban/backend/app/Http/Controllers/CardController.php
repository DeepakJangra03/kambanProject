<?php

namespace App\Http\Controllers;

use App\Models\Card;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CardController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'board_list_id' => 'required|exists:board_lists,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'member_id' => 'nullable|exists:members,id',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:tags,id',
        ]);

        $maxOrder = Card::where('board_list_id', $validated['board_list_id'])->max('order');
        $validated['order'] = is_null($maxOrder) ? 0 : $maxOrder + 1;

        $card = Card::create($validated);

        if (!empty($request->tags)) {
            $card->tags()->sync($request->tags);
        }

        return response()->json($card->load(['tags', 'member']), 201);
    }

    public function update(Request $request, Card $card)
    {
        $validated = $request->validate([
            'board_list_id' => 'sometimes|required|exists:board_lists,id',
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'member_id' => 'nullable|exists:members,id',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:tags,id',
        ]);

        $card->update($validated);

        if ($request->has('tags')) {
            $card->tags()->sync($request->tags);
        }

        return response()->json($card->load(['tags', 'member']));
    }

    public function destroy(Card $card)
    {
        $card->delete();
        return response()->json(['success' => true]);
    }

    public function reorder(Request $request)
    {
        $request->validate([
            'card_id' => 'required|exists:cards,id',
            'board_list_id' => 'required|exists:board_lists,id',
            'order' => 'required|integer|min:0',
        ]);

        $cardId = $request->card_id;
        $targetListId = $request->board_list_id;
        $newOrder = $request->order;

        DB::transaction(function () use ($cardId, $targetListId, $newOrder) {
            $card = Card::findOrFail($cardId);
            $sourceListId = $card->board_list_id;
            $oldOrder = $card->order;

            if ($sourceListId == $targetListId) {

                if ($oldOrder < $newOrder) {
                    Card::where('board_list_id', $sourceListId)
                        ->whereBetween('order', [$oldOrder + 1, $newOrder])
                        ->decrement('order');
                } elseif ($oldOrder > $newOrder) {
                    Card::where('board_list_id', $sourceListId)
                        ->whereBetween('order', [$newOrder, $oldOrder - 1])
                        ->increment('order');
                }
                $card->order = $newOrder;
                $card->save();
            } else {

                Card::where('board_list_id', $targetListId)
                    ->where('order', '>=', $newOrder)
                    ->increment('order');

                $card->board_list_id = $targetListId;
                $card->order = $newOrder;
                $card->save();

                Card::where('board_list_id', $sourceListId)
                    ->where('order', '>', $oldOrder)
                    ->decrement('order');
            }
        });

        return response()->json(['success' => true]);
    }
}
