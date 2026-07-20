<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Member extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'email'];

    public function boards()
    {
        return $this->belongsToMany(Board::class, 'board_member');
    }

    public function cards()
    {
        return $this->hasMany(Card::class);
    }
}
