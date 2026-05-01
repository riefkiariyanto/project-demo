export const formatCurrency = (value = 0) => {
  return `Rp ${Number(value || 0).toLocaleString('id-ID')}`;
};

export const toNumber = (value = 0) => {
  return Number(value || 0);
};

export const floorStock = (value = 0) => {
  return Math.floor(Number(value || 0));
};

export const calcMaterialValue = (item = {}) => {
  const stock = Number(item.stock || 0);
  const buyPrice = Number(item.buy_price || 0);
  const initialQty = Number(item.initial_qty || 1);

  return Math.round((buyPrice / initialQty) * stock);
};

export const calcRecipeRowCost = (row = {}, materials = []) => {
  const material = materials.find(
    (m) => String(m.id) === String(row.material_id)
  );

  if (!material) return 0;

  const buyPrice = Number(material.buy_price || 0);
  const initialQty = Number(material.initial_qty || 1);
  const qty = Number(row.qty || 0);

  return (buyPrice / initialQty) * qty;
};

export const calcRecipeCost = (recipeItems = [], materials = []) => {
  return Math.round(
    recipeItems.reduce((total, row) => {
      return total + calcRecipeRowCost(row, materials);
    }, 0)
  );
};

export const getMaterialUnit = (materialId, materials = []) => {
  const material = materials.find(
    (m) => String(m.id) === String(materialId)
  );

  return material?.unit || '';
};

export const getReadyLabel = (stock = 0) => {
  return Number(stock || 0) > 0 ? 'Ready' : 'Habis';
};

export const getReadyClass = (stock = 0) => {
  return Number(stock || 0) > 0
    ? 'bg-green-600 text-white'
    : 'bg-red-600 text-white';
};

export const getStockAlert = (item = {}) => {
  const stock = Number(item.stock || 0);
  const minStock = Number(item.min_stock || 0);

  return stock <= minStock ? 'Menipis' : 'Aman';
};

export const getStockAlertClass = (item = {}) => {
  const stock = Number(item.stock || 0);
  const minStock = Number(item.min_stock || 0);

};