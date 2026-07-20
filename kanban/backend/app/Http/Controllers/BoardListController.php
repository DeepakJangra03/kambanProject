<?php

namespace App\Http\Controllers;

use App\Models\BoardList;
use Illuminate\Http\Request;

class BoardListController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'board_id' => 'required|exists:boards,id',
            'name' => 'required|string|max:255',
        ]);

        $order = BoardList::where('board_id', $validated['board_id'])->count();
        $validated['order'] = $order;

        $list = BoardList::create($validated);

        return response()->json($list->load('cards'), 201);
    }

    public function update(Request $request, BoardList $list)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $list->update($validated);

        return response()->json($list);
    }

    public function destroy(BoardList $list)
    {
        $list->delete();
        return response()->json(['success' => true]);
    }
}
