<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Card extends Model
{
    use HasFactory;

    protected $fillable = ['board_list_id', 'title', 'description', 'due_date', 'member_id', 'order'];

    protected $casts = [
        'due_date' => 'datetime',
    ];

    public function boardList()
    {
        return $this->belongsTo(BoardList::class, 'board_list_id');
    }

    public function member()
    {
        return $this->belongsTo(Member::class);
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'card_tag');
    }
}
