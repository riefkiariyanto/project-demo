<?php

namespace Database\Seeders;

<<<<<<< HEAD
use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
=======
use Illuminate\Database\Seeder;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;
>>>>>>> 49979cee001e869504cc1e09c0091dd308ddb19d

class UserSeeder extends Seeder
{
    public function run(): void
    {
<<<<<<< HEAD
        // ✅ BUAT ROLE DULU
        $superadminRole = Role::firstOrCreate(['name' => 'superadmin']);
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $userRole = Role::firstOrCreate(['name' => 'user']);

        // ✅ SUPERADMIN
        $superadmin = User::firstOrCreate(
            ['email' => '1@gmail.com'],
            [
                'name' => 'superadmin',
                'password' => bcrypt('password')
            ]
        );
        $superadmin->assignRole($superadminRole);

        // ✅ ADMIN
        $admin = User::firstOrCreate(
            ['email' => '2@gmail.com'],
            [
                'name' => 'admin',
                'password' => bcrypt('password')
            ]
        );
        $admin->assignRole($adminRole);

        // ✅ USER
        $user = User::firstOrCreate(
            ['email' => '3@gmail.com'],
            [
                'name' => 'user',
                'password' => bcrypt('password')
            ]
        );
        $user->assignRole($userRole);
=======
        Role::firstOrCreate(['name' => 'superadmin']);
        Role::firstOrCreate(['name' => 'admin']);
        Role::firstOrCreate(['name' => 'user']);

        $user = User::updateOrCreate(
            ['email' => '1@gmail.com'],
            [
                'name' => 'superadmin',
                'password' => Hash::make('password'),
            ]
        );

        $user->assignRole('superadmin');
>>>>>>> 49979cee001e869504cc1e09c0091dd308ddb19d
    }
}