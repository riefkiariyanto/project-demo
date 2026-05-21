<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class PengaturanController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        return Inertia::render('Pengaturan', [
            'store' => $user->store,
        ]);
    }
}
