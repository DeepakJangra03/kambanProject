<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Board extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description'];

    public function lists()
    {
        return $this->hasMany(BoardList::class)->orderBy('order');
    }

    public function members()
    {
        return $this->belongsToMany(Member::class, 'board_member');
    }
}
