<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PengaturanApiController extends Controller
{
    public function index(Request $request)
    {
        return $this->successResponse([
            'store' => $request->user()->store,
        ], 'Pengaturan toko berhasil diambil.');
    }
}
