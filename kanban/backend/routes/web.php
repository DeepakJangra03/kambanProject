<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BoardController;
use App\Http\Controllers\BoardListController;
use App\Http\Controllers\CardController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\TagController;

Route::prefix('api')->group(function () {

    Route::get('/boards', [BoardController::class, 'index']);
    Route::post('/boards', [BoardController::class, 'store']);
    Route::get('/boards/{board}', [BoardController::class, 'show']);
    Route::post('/boards/{board}/members', [BoardController::class, 'addMember']);
    Route::delete('/boards/{board}', [BoardController::class, 'destroy']);

    Route::post('/lists', [BoardListController::class, 'store']);
    Route::put('/lists/{list}', [BoardListController::class, 'update']);
    Route::delete('/lists/{list}', [BoardListController::class, 'destroy']);

    Route::post('/cards', [CardController::class, 'store']);
    Route::put('/cards/{card}', [CardController::class, 'update']);
    Route::delete('/cards/{card}', [CardController::class, 'destroy']);
    Route::put('/cards/reorder', [CardController::class, 'reorder']);

    Route::get('/members', [MemberController::class, 'index']);
    Route::post('/members', [MemberController::class, 'store']);
    Route::get('/tags', [TagController::class, 'index']);
    Route::post('/tags', [TagController::class, 'store']);
});

Route::get('/', function () {
    return response()->json(['status' => 'Kanban Backend API is running']);
});
