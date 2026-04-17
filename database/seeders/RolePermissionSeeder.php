<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // PERMISSION
        $permissions = [
            'view users',
            'create users',
            'delete users',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // ROLE
        $superadmin = Role::firstOrCreate(['name' => 'superadmin']);
        $admin = Role::firstOrCreate(['name' => 'admin']);
        $user = Role::firstOrCreate(['name' => 'user']);

        // ASSIGN PERMISSION
        $superadmin->givePermissionTo(Permission::all());

        $admin->givePermissionTo([
            'view users',
            'create users',
        ]);

        $user->givePermissionTo([
            'view users',
        ]);
    }
}