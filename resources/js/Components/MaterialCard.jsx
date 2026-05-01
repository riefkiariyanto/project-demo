export default function MaterialCard({
  item,
  qtyValue,
  modeValue,
  onQtyChange,
  onModeChange,
  onProcess,
  onEdit,
  onDelete,
}) {
  const stock = Number(item.stock || 0);
  const minStock = Number(item.min_stock || 0);
  const buyPrice = Number(item.buy_price || 0);
  const initialQty = Number(item.initial_qty || 1);
  const stockValue = Math.round((buyPrice / initialQty) * stock);
  const low = stock <= minStock;

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
            <p className="text-sm text-gray-500">{item.unit}</p>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${low ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
            {low ? 'Stok Rendah' : 'Stok Aman'}
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Stok</span>
            <span className="font-semibold text-gray-900">{stock} {item.unit}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Harga Beli</span>
            <span className="font-semibold text-gray-900">Rp {buyPrice.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Nilai Stok</span>
            <span className="font-semibold text-orange-600">Rp {stockValue.toLocaleString('id-ID')}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="flex-1 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors font-medium"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(item)}
            className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}