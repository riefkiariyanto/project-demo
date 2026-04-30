<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class UserSeeder extends Seeder
{
    public function run(): void
    {
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
    }
}