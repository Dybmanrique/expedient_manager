<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Expedient extends Model
{
    protected $fillable = ['expedient_number', 'name', 'state', 'uuid', 'path', 'user_id'];
}
