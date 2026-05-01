<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id'   => 'required|exists:categories,id',
            'store_id'      => 'nullable|exists:stores,id',
            'sku'           => 'required|unique:products,sku',
            'name'          => 'required|string|max:255',
            'image'         => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'description'   => 'nullable|string',
            'cost_price'    => 'required|numeric|min:0',
            'selling_price' => 'required|numeric|min:0',
            'stock'         => 'required|integer|min:0',
            'unit'          => 'required|string|max:50',
            'is_active'     => 'boolean',
        ];
    }
}