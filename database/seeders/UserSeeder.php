<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $superadmin = User::create([
            'name' => 'superadmin',
            'email' => '1@gmail.com',
            'password' => bcrypt('password')
        ]);
        $superadmin->assignRole('superadmin');

        $admin = User::create([
            'name' => 'admin',
            'email' => '2@gmail.com',
            'password' => bcrypt('password')
        ]);
        $admin->assignRole('admin');

        $user = User::create([
            'name' => 'user',
            'email' => '3@gmail.com',
            'password' => bcrypt('password')
        ]);
        $user->assignRole('user');
    }
}