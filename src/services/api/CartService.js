import { getApperClient } from "@/services/apperClient";

// Map cart item to database format
const mapCartItemToDatabase = (item) => ({
  Name: item.name || item.Name,
  product_id_c: parseInt(item.productId) || item.product_id_c,
  brand_c: item.brand || item.brand_c,
  size_c: item.size || item.size_c,
  color_c: item.color || item.color_c,
  quantity_c: item.quantity || item.quantity_c,
  price_c: item.price || item.price_c,
  discount_price_c: item.discountPrice || item.discount_price_c,
  // image_c handled by ApperFileFieldComponent
});

// Map database cart item to display format
const mapCartItemFromDatabase = (dbItem) => ({
  Id: dbItem.Id,
  productId: dbItem.product_id_c?.Id || dbItem.product_id_c,
  name: dbItem.Name,
  brand: dbItem.brand_c,
  image: dbItem.image_c ? (Array.isArray(dbItem.image_c) ? dbItem.image_c[0]?.url : dbItem.image_c) : null,
  size: dbItem.size_c,
  color: dbItem.color_c,
  quantity: dbItem.quantity_c,
  price: dbItem.price_c,
  discountPrice: dbItem.discount_price_c
});

export const getAll = async () => {
  try {
    const apperClient = getApperClient();
    const response = await apperClient.fetchRecords('cart_items_c', {
      fields: [
        {"field": {"Name": "Name"}},
        {"field": {"Name": "product_id_c"}},
        {"field": {"Name": "brand_c"}},
        {"field": {"Name": "image_c"}},
        {"field": {"Name": "size_c"}},
        {"field": {"Name": "color_c"}},
        {"field": {"Name": "quantity_c"}},
        {"field": {"Name": "price_c"}},
        {"field": {"Name": "discount_price_c"}}
      ]
    });

    if (!response.success) {
      console.error("Error fetching cart items:", response.message);
      return [];
    }

    return response.data?.map(mapCartItemFromDatabase) || [];
  } catch (error) {
    console.error("Error fetching cart items:", error?.response?.data?.message || error);
    return [];
  }
};

export const create = async (cartItem) => {
  try {
    const apperClient = getApperClient();
    const dbItem = mapCartItemToDatabase(cartItem);
    
    const response = await apperClient.createRecord('cart_items_c', {
      records: [dbItem]
    });

    if (!response.success) {
      console.error("Error creating cart item:", response.message);
      return null;
    }

    if (response.results && response.results.length > 0) {
      const result = response.results[0];
      if (result.success) {
        return mapCartItemFromDatabase(result.data);
      }
    }

    return null;
  } catch (error) {
    console.error("Error creating cart item:", error?.response?.data?.message || error);
    return null;
  }
};

export const update = async (id, updates) => {
  try {
    const apperClient = getApperClient();
    const dbUpdates = {
      Id: parseInt(id),
      ...mapCartItemToDatabase(updates)
    };
    
    const response = await apperClient.updateRecord('cart_items_c', {
      records: [dbUpdates]
    });

    if (!response.success) {
      console.error("Error updating cart item:", response.message);
      return null;
    }

    if (response.results && response.results.length > 0) {
      const result = response.results[0];
      if (result.success) {
        return mapCartItemFromDatabase(result.data);
      }
    }

    return null;
  } catch (error) {
    console.error("Error updating cart item:", error?.response?.data?.message || error);
    return null;
  }
};

export const deleteItem = async (id) => {
  try {
    const apperClient = getApperClient();
    const response = await apperClient.deleteRecord('cart_items_c', {
      RecordIds: [parseInt(id)]
    });

    if (!response.success) {
      console.error("Error deleting cart item:", response.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting cart item:", error?.response?.data?.message || error);
    return false;
  }
};

export const findByProductAndOptions = async (productId, size, color) => {
  try {
    const apperClient = getApperClient();
    const response = await apperClient.fetchRecords('cart_items_c', {
      fields: [
        {"field": {"Name": "Name"}},
        {"field": {"Name": "product_id_c"}},
        {"field": {"Name": "brand_c"}},
        {"field": {"Name": "image_c"}},
        {"field": {"Name": "size_c"}},
        {"field": {"Name": "color_c"}},
        {"field": {"Name": "quantity_c"}},
        {"field": {"Name": "price_c"}},
        {"field": {"Name": "discount_price_c"}}
      ],
      where: [
        {
          "FieldName": "product_id_c",
          "Operator": "EqualTo",
          "Values": [parseInt(productId)],
          "Include": true
        },
        {
          "FieldName": "size_c",
          "Operator": "EqualTo",
          "Values": [size],
          "Include": true
        },
        {
          "FieldName": "color_c",
          "Operator": "EqualTo",
          "Values": [color],
          "Include": true
        }
      ]
    });

    if (!response.success) {
      console.error("Error finding cart item:", response.message);
      return null;
    }

    const items = response.data?.map(mapCartItemFromDatabase) || [];
    return items.length > 0 ? items[0] : null;
  } catch (error) {
    console.error("Error finding cart item:", error?.response?.data?.message || error);
    return null;
  }
};
import { getApperClient } from "@/services/apperClient";

// Map cart item to database format
const mapCartItemToDatabase = (item) => ({
  Name: item.name || item.Name,
  product_id_c: parseInt(item.productId) || item.product_id_c,
  brand_c: item.brand || item.brand_c,
  size_c: item.size || item.size_c,
  color_c: item.color || item.color_c,
  quantity_c: item.quantity || item.quantity_c,
  price_c: item.price || item.price_c,
  discount_price_c: item.discountPrice || item.discount_price_c,
  // image_c handled by ApperFileFieldComponent
});

// Map database cart item to display format
const mapCartItemFromDatabase = (dbItem) => ({
  Id: dbItem.Id,
  productId: dbItem.product_id_c?.Id || dbItem.product_id_c,
  name: dbItem.Name,
  brand: dbItem.brand_c,
  image: dbItem.image_c ? (Array.isArray(dbItem.image_c) ? dbItem.image_c[0]?.url : dbItem.image_c) : null,
  size: dbItem.size_c,
  color: dbItem.color_c,
  quantity: dbItem.quantity_c,
  price: dbItem.price_c,
  discountPrice: dbItem.discount_price_c
});

export const getAll = async () => {
  try {
    const apperClient = getApperClient();
    const response = await apperClient.fetchRecords('cart_items_c', {
      fields: [
        {"field": {"Name": "Name"}},
        {"field": {"Name": "product_id_c"}},
        {"field": {"Name": "brand_c"}},
        {"field": {"Name": "image_c"}},
        {"field": {"Name": "size_c"}},
        {"field": {"Name": "color_c"}},
        {"field": {"Name": "quantity_c"}},
        {"field": {"Name": "price_c"}},
        {"field": {"Name": "discount_price_c"}}
      ]
    });

    if (!response.success) {
      console.error("Error fetching cart items:", response.message);
      return [];
    }

    return response.data?.map(mapCartItemFromDatabase) || [];
  } catch (error) {
    console.error("Error fetching cart items:", error?.response?.data?.message || error);
    return [];
  }
};

export const create = async (cartItem) => {
  try {
    const apperClient = getApperClient();
    const dbItem = mapCartItemToDatabase(cartItem);
    
    const response = await apperClient.createRecord('cart_items_c', {
      records: [dbItem]
    });

    if (!response.success) {
      console.error("Error creating cart item:", response.message);
      return null;
    }

    if (response.results && response.results.length > 0) {
      const result = response.results[0];
      if (result.success) {
        return mapCartItemFromDatabase(result.data);
      }
    }

    return null;
  } catch (error) {
    console.error("Error creating cart item:", error?.response?.data?.message || error);
    return null;
  }
};

export const update = async (id, updates) => {
  try {
    const apperClient = getApperClient();
    const dbUpdates = {
      Id: parseInt(id),
      ...mapCartItemToDatabase(updates)
    };
    
    const response = await apperClient.updateRecord('cart_items_c', {
      records: [dbUpdates]
    });

    if (!response.success) {
      console.error("Error updating cart item:", response.message);
      return null;
    }

    if (response.results && response.results.length > 0) {
      const result = response.results[0];
      if (result.success) {
        return mapCartItemFromDatabase(result.data);
      }
    }

    return null;
  } catch (error) {
    console.error("Error updating cart item:", error?.response?.data?.message || error);
    return null;
  }
};

export const deleteItem = async (id) => {
  try {
    const apperClient = getApperClient();
    const response = await apperClient.deleteRecord('cart_items_c', {
      RecordIds: [parseInt(id)]
    });

    if (!response.success) {
      console.error("Error deleting cart item:", response.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting cart item:", error?.response?.data?.message || error);
    return false;
  }
};

export const findByProductAndOptions = async (productId, size, color) => {
  try {
    const apperClient = getApperClient();
    const response = await apperClient.fetchRecords('cart_items_c', {
      fields: [
        {"field": {"Name": "Name"}},
        {"field": {"Name": "product_id_c"}},
        {"field": {"Name": "brand_c"}},
        {"field": {"Name": "image_c"}},
        {"field": {"Name": "size_c"}},
        {"field": {"Name": "color_c"}},
        {"field": {"Name": "quantity_c"}},
        {"field": {"Name": "price_c"}},
        {"field": {"Name": "discount_price_c"}}
      ],
      where: [
        {
          "FieldName": "product_id_c",
          "Operator": "EqualTo",
          "Values": [parseInt(productId)],
          "Include": true
        },
        {
          "FieldName": "size_c",
          "Operator": "EqualTo",
          "Values": [size],
          "Include": true
        },
        {
          "FieldName": "color_c",
          "Operator": "EqualTo",
          "Values": [color],
          "Include": true
        }
      ]
    });

    if (!response.success) {
      console.error("Error finding cart item:", response.message);
      return null;
    }

    const items = response.data?.map(mapCartItemFromDatabase) || [];
    return items.length > 0 ? items[0] : null;
  } catch (error) {
    console.error("Error finding cart item:", error?.response?.data?.message || error);
    return null;
  }
};