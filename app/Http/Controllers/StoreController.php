<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class StoreController extends Controller
{
    public function update(Request $request)
    {
        $request->validate([
            'name'       => 'required|string|max:255',
            'address'    => 'nullable|string',
            'phone'      => 'nullable|string',
            'logo'       => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'qris_image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        $store = auth()->user()->store;

        $data = $request->only(['name', 'address', 'phone']);

        if ($request->hasFile('logo')) {
            if ($store->logo) {
                \Storage::disk('public')->delete($store->logo);
            }
            $data['logo'] = $request->file('logo')->store('stores', 'public');
        }

        if ($request->hasFile('qris_image')) {
            if ($store->qris_image) {
                \Storage::disk('public')->delete($store->qris_image);
            }
            $data['qris_image'] = $request->file('qris_image')->store('stores', 'public');
        }

        $store->update($data);

        return redirect()->route('kelolatoko')->with('success', 'Profil toko berhasil diupdate!');
    }
}