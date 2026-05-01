<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
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
            'sku'           => 'required|unique:products,sku,' . $this->product->id,
            'name'          => 'required|string|max:255',
            'description'   => 'nullable|string',
            'cost_price'    => 'required|numeric|min:0',
            'selling_price' => 'required|numeric|min:0',
            'stock'         => 'required|integer|min:0',
            'unit'          => 'required|string|max:50',
            'is_active'     => 'boolean',
        ];
    }
}