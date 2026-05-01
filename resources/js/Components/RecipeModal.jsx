export default function RecipeModal({
  open,
  product,
  materials = [],
  recipeItems = [],
  setRecipeItems,
  onClose,
  onSave,
}) {
  if (!open) return null;

  const totalHpp = Math.round(
    recipeItems.reduce((total, row) => {
      const material = materials.find(
        (m) => String(m.id) === String(row.material_id)
      );

      if (!material) return total;

      const buyPrice = Number(material.buy_price || 0);
      const initialQty = Number(material.initial_qty || 1);
      const qty = Number(row.qty || 0);

      return total + (buyPrice / initialQty) * qty;
    }, 0)
  );

  const updateRow = (index, key, value) => {
    const updated = [...recipeItems];
    updated[index][key] = value;
    setRecipeItems(updated);
  };

  const removeRow = (index) => {
    setRecipeItems(recipeItems.filter((_, i) => i !== index));
  };

  const addRow = () => {
    setRecipeItems([
      ...recipeItems,
      { material_id: '', qty: '' },
    ]);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#111827] rounded-2xl border border-gray-700 p-6 space-y-4 shadow-2xl">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">Atur Resep</h2>
            <p className="text-sm text-gray-400">{product?.name}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-12 gap-2 text-xs text-gray-400 px-1">
          <div className="col-span-4">Bahan</div>
          <div className="col-span-2">Qty</div>
          <div className="col-span-1">Unit</div>
          <div className="col-span-3">Biaya</div>
          <div className="col-span-1"></div>

          {recipeItems.map((row, index) => {
            const material = materials.find(
              (m) => String(m.id) === String(row.material_id)
            );
            const unit = material?.unit || '-';
            const cost = material
              ? (Number(material.buy_price || 0) / Number(material.initial_qty || 1)) * Number(row.qty || 0)
              : 0;

            return (
              <div key={index} className="grid grid-cols-12 gap-2 col-span-12">
                <div className="col-span-4">
                  <select
                    value={row.material_id}
                    onChange={(e) => updateRow(index, 'material_id', e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-[#1f2937] border border-gray-700 text-white"
                  >
                    <option value="">Pilih Bahan</option>
                    {materials.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={row.qty}
                    onChange={(e) => updateRow(index, 'qty', e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-[#1f2937] border border-gray-700 text-white"
                  />
                </div>

                <div className="col-span-1 text-sm text-gray-300 font-semibold">
                  {unit}
                </div>

                <div className="col-span-3">
                  <div className="w-full px-4 py-2 rounded-xl bg-[#1f2937] border border-gray-700 text-cyan-400 font-semibold">
                    Rp {Math.round(cost).toLocaleString('id-ID')}
                  </div>
                </div>

                <div className="col-span-1">
                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    className="text-red-400 hover:text-red-500"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={addRow}
          className="px-4 py-2 rounded-xl bg-gray-700 text-white hover:bg-gray-600"
        >
          + Tambah Bahan
        </button>

        <div className="border-t border-gray-700 pt-4 flex justify-between items-center">
          <span className="text-gray-400">Total HPP</span>
          <span className="text-xl font-bold text-orange-400">
            Rp {totalHpp.toLocaleString('id-ID')}
          </span>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-600 text-white"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={onSave}
            className="px-4 py-2 rounded-xl bg-orange-500 text-white hover:bg-orange-600"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
          
