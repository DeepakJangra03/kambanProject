<?php

namespace App\Http\Controllers;

use App\Models\Board;
use Illuminate\Http\Request;

class BoardController extends Controller
{
    public function index()
    {
        return response()->json(Board::withCount(['lists'])->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $board = Board::create($validated);

        $board->lists()->create(['name' => 'To Do', 'order' => 0]);
        $board->lists()->create(['name' => 'Doing', 'order' => 1]);
        $board->lists()->create(['name' => 'Done', 'order' => 2]);

        return response()->json($board->load('lists'), 201);
    }

    public function show(Board $board)
    {
        $board->load([
            'members',
            'lists' => function ($query) {
                $query->orderBy('order');
            },
            'lists.cards' => function ($query) {
                $query->orderBy('order');
            },
            'lists.cards.tags',
            'lists.cards.member'
        ]);

        return response()->json($board);
    }

    public function addMember(Request $request, Board $board)
    {
        $validated = $request->validate([
            'member_id' => 'required|exists:members,id',
        ]);

        $board->members()->syncWithoutDetaching([$validated['member_id']]);

        return response()->json($board->load('members'));
    }

    public function destroy(Board $board)
    {
        $board->delete();
        return response()->json(null, 204);
    }
}
