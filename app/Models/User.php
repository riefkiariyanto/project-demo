<?php

namespace App\Models;

<<<<<<< HEAD
// use Illuminate\Contracts\Auth\MustVerifyEmail;
=======
>>>>>>> 49979cee001e869504cc1e09c0091dd308ddb19d
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
<<<<<<< HEAD
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable,HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
=======
    use HasFactory, Notifiable, HasRoles;

>>>>>>> 49979cee001e869504cc1e09c0091dd308ddb19d
    protected $fillable = [
        'name',
        'email',
        'password',
<<<<<<< HEAD
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
=======
        'store_id',
        'phone',
        'address',
        'is_active',
    ];

>>>>>>> 49979cee001e869504cc1e09c0091dd308ddb19d
    protected $hidden = [
        'password',
        'remember_token',
    ];

<<<<<<< HEAD
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
=======
>>>>>>> 49979cee001e869504cc1e09c0091dd308ddb19d
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
<<<<<<< HEAD
        ];
    }
}
=======
            'is_active' => 'boolean',
        ];
    }

    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    public function sales()
    {
        return $this->hasMany(Sale::class);
    }

    public function shifts()
    {
        return $this->hasMany(Shift::class);
    }

    public function expenses()
    {
        return $this->hasMany(Expense::class);
    }

    public function activityLogs()
    {
        return $this->hasMany(ActivityLog::class);
    }
}
>>>>>>> 49979cee001e869504cc1e09c0091dd308ddb19d
