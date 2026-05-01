<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RolePermissionSeeder::class,
            UserSeeder::class,
<<<<<<< HEAD
        ]);
    }
}
=======
            CategorySeeder::class,
            MaterialSeeder::class,
            ProductSeeder::class,
        ]);
    }
}

>>>>>>> 49979cee001e869504cc1e09c0091dd308ddb19d
