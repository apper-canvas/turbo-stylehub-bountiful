import { getApperClient } from "@/services/apperClient";

// Map wishlist item to database format
const mapWishlistItemToDatabase = (item) => ({
  Name: item.name || item.Name,
  product_id_c: parseInt(item.productId) || item.product_id_c,
  brand_c: item.brand || item.brand_c,
  price_c: item.price || item.price_c,
  discount_price_c: item.discountPrice || item.discount_price_c,
  in_stock_c: item.inStock !== undefined ? item.inStock : item.in_stock_c,
  // image_c handled by ApperFileFieldComponent
});

// Map database wishlist item to display format
const mapWishlistItemFromDatabase = (dbItem) => ({
  Id: dbItem.Id,
  productId: dbItem.product_id_c?.Id || dbItem.product_id_c,
  name: dbItem.Name,
  brand: dbItem.brand_c,
  image: dbItem.image_c ? (Array.isArray(dbItem.image_c) ? dbItem.image_c[0]?.url : dbItem.image_c) : null,
  price: dbItem.price_c,
  discountPrice: dbItem.discount_price_c,
  inStock: dbItem.in_stock_c
});

export const getAll = async () => {
  try {
    const apperClient = getApperClient();
    const response = await apperClient.fetchRecords('wishlist_items_c', {
      fields: [
        {"field": {"Name": "Name"}},
        {"field": {"Name": "product_id_c"}},
        {"field": {"Name": "brand_c"}},
        {"field": {"Name": "image_c"}},
        {"field": {"Name": "price_c"}},
        {"field": {"Name": "discount_price_c"}},
        {"field": {"Name": "in_stock_c"}}
      ]
    });

    if (!response.success) {
      console.error("Error fetching wishlist items:", response.message);
      return [];
    }

    return response.data?.map(mapWishlistItemFromDatabase) || [];
  } catch (error) {
    console.error("Error fetching wishlist items:", error?.response?.data?.message || error);
    return [];
  }
};

export const create = async (wishlistItem) => {
  try {
    const apperClient = getApperClient();
    const dbItem = mapWishlistItemToDatabase(wishlistItem);
    
    const response = await apperClient.createRecord('wishlist_items_c', {
      records: [dbItem]
    });

    if (!response.success) {
      console.error("Error creating wishlist item:", response.message);
      return null;
    }

    if (response.results && response.results.length > 0) {
      const result = response.results[0];
      if (result.success) {
        return mapWishlistItemFromDatabase(result.data);
      }
    }

    return null;
  } catch (error) {
    console.error("Error creating wishlist item:", error?.response?.data?.message || error);
    return null;
  }
};

export const deleteByProductId = async (productId) => {
  try {
    const apperClient = getApperClient();
    
    // First find the wishlist item by product ID
    const findResponse = await apperClient.fetchRecords('wishlist_items_c', {
      fields: [{"field": {"Name": "Id"}}],
      where: [{
        "FieldName": "product_id_c",
        "Operator": "EqualTo",
        "Values": [parseInt(productId)],
        "Include": true
      }]
    });

    if (!findResponse.success || !findResponse.data?.length) {
      console.error("Wishlist item not found for product:", productId);
      return false;
    }

    const itemId = findResponse.data[0].Id;
    const response = await apperClient.deleteRecord('wishlist_items_c', {
      RecordIds: [itemId]
    });

    if (!response.success) {
      console.error("Error deleting wishlist item:", response.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting wishlist item:", error?.response?.data?.message || error);
    return false;
  }
};

export const findByProductId = async (productId) => {
  try {
    const apperClient = getApperClient();
    const response = await apperClient.fetchRecords('wishlist_items_c', {
      fields: [
        {"field": {"Name": "Name"}},
        {"field": {"Name": "product_id_c"}},
        {"field": {"Name": "brand_c"}},
        {"field": {"Name": "image_c"}},
        {"field": {"Name": "price_c"}},
        {"field": {"Name": "discount_price_c"}},
        {"field": {"Name": "in_stock_c"}}
      ],
      where: [{
        "FieldName": "product_id_c",
        "Operator": "EqualTo",
        "Values": [parseInt(productId)],
        "Include": true
      }]
    });

    if (!response.success) {
      console.error("Error finding wishlist item:", response.message);
      return null;
    }

    const items = response.data?.map(mapWishlistItemFromDatabase) || [];
    return items.length > 0 ? items[0] : null;
  } catch (error) {
    console.error("Error finding wishlist item:", error?.response?.data?.message || error);
    return null;
  }
};
import { getApperClient } from "@/services/apperClient";

// Map wishlist item to database format
const mapWishlistItemToDatabase = (item) => ({
  Name: item.name || item.Name,
  product_id_c: parseInt(item.productId) || item.product_id_c,
  brand_c: item.brand || item.brand_c,
  price_c: item.price || item.price_c,
  discount_price_c: item.discountPrice || item.discount_price_c,
  in_stock_c: item.inStock !== undefined ? item.inStock : item.in_stock_c,
  // image_c handled by ApperFileFieldComponent
});

// Map database wishlist item to display format
const mapWishlistItemFromDatabase = (dbItem) => ({
  Id: dbItem.Id,
  productId: dbItem.product_id_c?.Id || dbItem.product_id_c,
  name: dbItem.Name,
  brand: dbItem.brand_c,
  image: dbItem.image_c ? (Array.isArray(dbItem.image_c) ? dbItem.image_c[0]?.url : dbItem.image_c) : null,
  price: dbItem.price_c,
  discountPrice: dbItem.discount_price_c,
  inStock: dbItem.in_stock_c
});

export const getAll = async () => {
  try {
    const apperClient = getApperClient();
    const response = await apperClient.fetchRecords('wishlist_items_c', {
      fields: [
        {"field": {"Name": "Name"}},
        {"field": {"Name": "product_id_c"}},
        {"field": {"Name": "brand_c"}},
        {"field": {"Name": "image_c"}},
        {"field": {"Name": "price_c"}},
        {"field": {"Name": "discount_price_c"}},
        {"field": {"Name": "in_stock_c"}}
      ]
    });

    if (!response.success) {
      console.error("Error fetching wishlist items:", response.message);
      return [];
    }

    return response.data?.map(mapWishlistItemFromDatabase) || [];
  } catch (error) {
    console.error("Error fetching wishlist items:", error?.response?.data?.message || error);
    return [];
  }
};

export const create = async (wishlistItem) => {
  try {
    const apperClient = getApperClient();
    const dbItem = mapWishlistItemToDatabase(wishlistItem);
    
    const response = await apperClient.createRecord('wishlist_items_c', {
      records: [dbItem]
    });

    if (!response.success) {
      console.error("Error creating wishlist item:", response.message);
      return null;
    }

    if (response.results && response.results.length > 0) {
      const result = response.results[0];
      if (result.success) {
        return mapWishlistItemFromDatabase(result.data);
      }
    }

    return null;
  } catch (error) {
    console.error("Error creating wishlist item:", error?.response?.data?.message || error);
    return null;
  }
};

export const deleteByProductId = async (productId) => {
  try {
    const apperClient = getApperClient();
    
    // First find the wishlist item by product ID
    const findResponse = await apperClient.fetchRecords('wishlist_items_c', {
      fields: [{"field": {"Name": "Id"}}],
      where: [{
        "FieldName": "product_id_c",
        "Operator": "EqualTo",
        "Values": [parseInt(productId)],
        "Include": true
      }]
    });

    if (!findResponse.success || !findResponse.data?.length) {
      console.error("Wishlist item not found for product:", productId);
      return false;
    }

    const itemId = findResponse.data[0].Id;
    const response = await apperClient.deleteRecord('wishlist_items_c', {
      RecordIds: [itemId]
    });

    if (!response.success) {
      console.error("Error deleting wishlist item:", response.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting wishlist item:", error?.response?.data?.message || error);
    return false;
  }
};

export const findByProductId = async (productId) => {
  try {
    const apperClient = getApperClient();
    const response = await apperClient.fetchRecords('wishlist_items_c', {
      fields: [
        {"field": {"Name": "Name"}},
        {"field": {"Name": "product_id_c"}},
        {"field": {"Name": "brand_c"}},
        {"field": {"Name": "image_c"}},
        {"field": {"Name": "price_c"}},
        {"field": {"Name": "discount_price_c"}},
        {"field": {"Name": "in_stock_c"}}
      ],
      where: [{
        "FieldName": "product_id_c",
        "Operator": "EqualTo",
        "Values": [parseInt(productId)],
        "Include": true
      }]
    });

    if (!response.success) {
      console.error("Error finding wishlist item:", response.message);
      return null;
    }

    const items = response.data?.map(mapWishlistItemFromDatabase) || [];
    return items.length > 0 ? items[0] : null;
  } catch (error) {
    console.error("Error finding wishlist item:", error?.response?.data?.message || error);
    return null;
  }
};