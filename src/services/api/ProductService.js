import { getApperClient } from "@/services/apperClient";

// Field mappings from mock data to database fields
const mapProductToDatabase = (product) => ({
  Name: product.name || product.Name,
  description_c: product.description || product.description_c,
  brand_c: product.brand || product.brand_c,
  category_c: product.category || product.category_c,
  subcategory_c: product.subcategory || product.subcategory_c,
  sizes_c: Array.isArray(product.sizes) ? product.sizes.join(',') : product.sizes_c,
  colors_c: Array.isArray(product.colors) ? product.colors.join(',') : product.colors_c,
  price_c: product.price || product.price_c,
  discount_price_c: product.discountPrice || product.discount_price_c,
  discount_percent_c: product.discountPercent || product.discount_percent_c,
  rating_c: product.rating || product.rating_c,
  review_count_c: product.reviewCount || product.review_count_c,
  in_stock_c: product.inStock !== undefined ? product.inStock : product.in_stock_c,
  // images_c handled separately by ApperFileFieldComponent
});

// Map database product to display format
const mapProductFromDatabase = (dbProduct) => ({
  Id: dbProduct.Id,
  name: dbProduct.Name,
  description: dbProduct.description_c,
  brand: dbProduct.brand_c,
  category: dbProduct.category_c,
  subcategory: dbProduct.subcategory_c,
  sizes: dbProduct.sizes_c ? dbProduct.sizes_c.split(',').map(s => s.trim()) : [],
  colors: dbProduct.colors_c ? dbProduct.colors_c.split(',').map(c => c.trim()) : [],
  price: dbProduct.price_c,
  discountPrice: dbProduct.discount_price_c,
  discountPercent: dbProduct.discount_percent_c,
  rating: dbProduct.rating_c,
  reviewCount: dbProduct.review_count_c,
  inStock: dbProduct.in_stock_c,
  images: dbProduct.images_c ? 
    (Array.isArray(dbProduct.images_c) ? dbProduct.images_c.map(img => img.url || img) : [dbProduct.images_c]) :
    ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop"] // fallback
});

export const getAll = async () => {
  try {
    const apperClient = getApperClient();
    const response = await apperClient.fetchRecords('products_c', {
      fields: [
        {"field": {"Name": "Name"}},
        {"field": {"Name": "description_c"}},
        {"field": {"Name": "brand_c"}},
        {"field": {"Name": "category_c"}},
        {"field": {"Name": "subcategory_c"}},
        {"field": {"Name": "sizes_c"}},
        {"field": {"Name": "colors_c"}},
        {"field": {"Name": "price_c"}},
        {"field": {"Name": "discount_price_c"}},
        {"field": {"Name": "discount_percent_c"}},
        {"field": {"Name": "rating_c"}},
        {"field": {"Name": "review_count_c"}},
        {"field": {"Name": "in_stock_c"}},
        {"field": {"Name": "images_c"}}
      ]
    });

    if (!response.success) {
      console.error("Error fetching products:", response.message);
      return [];
    }

    return response.data?.map(mapProductFromDatabase) || [];
  } catch (error) {
    console.error("Error fetching products:", error?.response?.data?.message || error);
    return [];
  }
};

export const getById = async (id) => {
  try {
    const apperClient = getApperClient();
    const response = await apperClient.getRecordById('products_c', parseInt(id), {
      fields: [
        {"field": {"Name": "Name"}},
        {"field": {"Name": "description_c"}},
        {"field": {"Name": "brand_c"}},
        {"field": {"Name": "category_c"}},
        {"field": {"Name": "subcategory_c"}},
        {"field": {"Name": "sizes_c"}},
        {"field": {"Name": "colors_c"}},
        {"field": {"Name": "price_c"}},
        {"field": {"Name": "discount_price_c"}},
        {"field": {"Name": "discount_percent_c"}},
        {"field": {"Name": "rating_c"}},
        {"field": {"Name": "review_count_c"}},
        {"field": {"Name": "in_stock_c"}},
        {"field": {"Name": "images_c"}}
      ]
    });

    if (!response.success) {
      console.error("Error fetching product:", response.message);
      throw new Error(`Product with ID ${id} not found`);
    }

    if (!response.data) {
      throw new Error(`Product with ID ${id} not found`);
    }

    return mapProductFromDatabase(response.data);
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error?.response?.data?.message || error);
    throw error;
  }
};

export const getByCategory = async (category) => {
  try {
    const apperClient = getApperClient();
    const response = await apperClient.fetchRecords('products_c', {
      fields: [
        {"field": {"Name": "Name"}},
        {"field": {"Name": "description_c"}},
        {"field": {"Name": "brand_c"}},
        {"field": {"Name": "category_c"}},
        {"field": {"Name": "subcategory_c"}},
        {"field": {"Name": "sizes_c"}},
        {"field": {"Name": "colors_c"}},
        {"field": {"Name": "price_c"}},
        {"field": {"Name": "discount_price_c"}},
        {"field": {"Name": "discount_percent_c"}},
        {"field": {"Name": "rating_c"}},
        {"field": {"Name": "review_count_c"}},
        {"field": {"Name": "in_stock_c"}},
        {"field": {"Name": "images_c"}}
      ],
      where: [{
        "FieldName": "category_c",
        "Operator": "EqualTo",
        "Values": [category],
        "Include": true
      }]
    });

    if (!response.success) {
      console.error("Error fetching products by category:", response.message);
      return [];
    }

    return response.data?.map(mapProductFromDatabase) || [];
  } catch (error) {
    console.error("Error fetching products by category:", error?.response?.data?.message || error);
    return [];
  }
};

export const getFilteredProducts = async (filters = {}) => {
  try {
    const apperClient = getApperClient();
    const whereConditions = [];

    // Category filter
    if (filters.categories && filters.categories.length > 0) {
      whereConditions.push({
        "FieldName": "category_c",
        "Operator": "ExactMatch",
        "Values": filters.categories,
        "Include": true
      });
    }

    // Brand filter
    if (filters.brands && filters.brands.length > 0) {
      whereConditions.push({
        "FieldName": "brand_c",
        "Operator": "ExactMatch",
        "Values": filters.brands,
        "Include": true
      });
    }

    // Price range filter
    if (filters.priceRange) {
      const { min, max } = filters.priceRange;
      whereConditions.push({
        "FieldName": "price_c",
        "Operator": "GreaterThanOrEqualTo",
        "Values": [min],
        "Include": true
      });
      whereConditions.push({
        "FieldName": "price_c",
        "Operator": "LessThanOrEqualTo",
        "Values": [max],
        "Include": true
      });
    }

    // Build sort order
    let orderBy = [];
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'price-low':
          orderBy.push({"fieldName": "price_c", "sorttype": "ASC"});
          break;
        case 'price-high':
          orderBy.push({"fieldName": "price_c", "sorttype": "DESC"});
          break;
        case 'newest':
          orderBy.push({"fieldName": "Id", "sorttype": "DESC"});
          break;
        case 'rating':
          orderBy.push({"fieldName": "rating_c", "sorttype": "DESC"});
          break;
        case 'discount':
          orderBy.push({"fieldName": "discount_percent_c", "sorttype": "DESC"});
          break;
        default:
          orderBy.push({"fieldName": "Id", "sorttype": "DESC"});
      }
    }

    const response = await apperClient.fetchRecords('products_c', {
      fields: [
        {"field": {"Name": "Name"}},
        {"field": {"Name": "description_c"}},
        {"field": {"Name": "brand_c"}},
        {"field": {"Name": "category_c"}},
        {"field": {"Name": "subcategory_c"}},
        {"field": {"Name": "sizes_c"}},
        {"field": {"Name": "colors_c"}},
        {"field": {"Name": "price_c"}},
        {"field": {"Name": "discount_price_c"}},
        {"field": {"Name": "discount_percent_c"}},
        {"field": {"Name": "rating_c"}},
        {"field": {"Name": "review_count_c"}},
        {"field": {"Name": "in_stock_c"}},
        {"field": {"Name": "images_c"}}
      ],
      where: whereConditions,
      orderBy: orderBy
    });

    if (!response.success) {
      console.error("Error fetching filtered products:", response.message);
      return [];
    }

    let products = response.data?.map(mapProductFromDatabase) || [];

    // Client-side filters for sizes and colors (multi-select fields)
    if (filters.sizes && filters.sizes.length > 0) {
      products = products.filter(p => 
        filters.sizes.some(size => p.sizes.includes(size))
      );
    }

    if (filters.colors && filters.colors.length > 0) {
      products = products.filter(p => 
        filters.colors.some(color => p.colors.includes(color))
      );
    }

    return products;
  } catch (error) {
    console.error("Error fetching filtered products:", error?.response?.data?.message || error);
    return [];
  }
};

export const searchProducts = async (query) => {
  try {
    if (!query || !query.trim()) return [];

    const apperClient = getApperClient();
    const searchTerm = query.toLowerCase().trim();
    
    const response = await apperClient.fetchRecords('products_c', {
      fields: [
        {"field": {"Name": "Name"}},
        {"field": {"Name": "description_c"}},
        {"field": {"Name": "brand_c"}},
        {"field": {"Name": "category_c"}},
        {"field": {"Name": "subcategory_c"}},
        {"field": {"Name": "sizes_c"}},
        {"field": {"Name": "colors_c"}},
        {"field": {"Name": "price_c"}},
        {"field": {"Name": "discount_price_c"}},
        {"field": {"Name": "discount_percent_c"}},
        {"field": {"Name": "rating_c"}},
        {"field": {"Name": "review_count_c"}},
        {"field": {"Name": "in_stock_c"}},
        {"field": {"Name": "images_c"}}
      ],
      whereGroups: [{
        "operator": "OR",
        "subGroups": [
          {
            "conditions": [
              {"fieldName": "Name", "operator": "Contains", "values": [searchTerm]},
              {"fieldName": "brand_c", "operator": "Contains", "values": [searchTerm]},
              {"fieldName": "category_c", "operator": "Contains", "values": [searchTerm]},
              {"fieldName": "description_c", "operator": "Contains", "values": [searchTerm]}
            ],
            "operator": "OR"
          }
        ]
      }]
    });

    if (!response.success) {
      console.error("Error searching products:", response.message);
      return [];
    }

    return response.data?.map(mapProductFromDatabase) || [];
  } catch (error) {
    console.error("Error searching products:", error?.response?.data?.message || error);
    return [];
  }
};

export const getFeaturedProducts = async () => {
  try {
    const apperClient = getApperClient();
    const response = await apperClient.fetchRecords('products_c', {
      fields: [
        {"field": {"Name": "Name"}},
        {"field": {"Name": "description_c"}},
        {"field": {"Name": "brand_c"}},
        {"field": {"Name": "category_c"}},
        {"field": {"Name": "subcategory_c"}},
        {"field": {"Name": "sizes_c"}},
        {"field": {"Name": "colors_c"}},
        {"field": {"Name": "price_c"}},
        {"field": {"Name": "discount_price_c"}},
        {"field": {"Name": "discount_percent_c"}},
        {"field": {"Name": "rating_c"}},
        {"field": {"Name": "review_count_c"}},
        {"field": {"Name": "in_stock_c"}},
        {"field": {"Name": "images_c"}}
      ],
      where: [{
        "FieldName": "rating_c",
        "Operator": "GreaterThanOrEqualTo",
        "Values": [4.5],
        "Include": true
      }],
      orderBy: [{"fieldName": "rating_c", "sorttype": "DESC"}],
      pagingInfo: {"limit": 8, "offset": 0}
    });

    if (!response.success) {
      console.error("Error fetching featured products:", response.message);
      return [];
    }

    return response.data?.map(mapProductFromDatabase) || [];
  } catch (error) {
    console.error("Error fetching featured products:", error?.response?.data?.message || error);
    return [];
  }
};

export const getSimilarProducts = async (productId, category) => {
  try {
    const apperClient = getApperClient();
    const response = await apperClient.fetchRecords('products_c', {
      fields: [
        {"field": {"Name": "Name"}},
        {"field": {"Name": "description_c"}},
        {"field": {"Name": "brand_c"}},
        {"field": {"Name": "category_c"}},
        {"field": {"Name": "subcategory_c"}},
        {"field": {"Name": "sizes_c"}},
        {"field": {"Name": "colors_c"}},
        {"field": {"Name": "price_c"}},
        {"field": {"Name": "discount_price_c"}},
        {"field": {"Name": "discount_percent_c"}},
        {"field": {"Name": "rating_c"}},
        {"field": {"Name": "review_count_c"}},
        {"field": {"Name": "in_stock_c"}},
        {"field": {"Name": "images_c"}}
      ],
      where: [
        {
          "FieldName": "category_c",
          "Operator": "EqualTo",
          "Values": [category],
          "Include": true
        },
        {
          "FieldName": "Id",
          "Operator": "NotEqualTo",
          "Values": [parseInt(productId)],
          "Include": true
        }
      ],
      pagingInfo: {"limit": 4, "offset": 0}
    });

    if (!response.success) {
      console.error("Error fetching similar products:", response.message);
      return [];
    }

    return response.data?.map(mapProductFromDatabase) || [];
  } catch (error) {
    console.error("Error fetching similar products:", error?.response?.data?.message || error);
    return [];
  }
};

export const getAllBrands = async () => {
  try {
    const apperClient = getApperClient();
    const response = await apperClient.fetchRecords('products_c', {
      fields: [{"field": {"Name": "brand_c"}}],
      groupBy: ["brand_c"],
      orderBy: [{"fieldName": "brand_c", "sorttype": "ASC"}]
    });

    if (!response.success) {
      console.error("Error fetching brands:", response.message);
      return [];
    }

    return response.data?.map(item => item.brand_c).filter(Boolean) || [];
  } catch (error) {
    console.error("Error fetching brands:", error?.response?.data?.message || error);
    return [];
  }
};

export const getAllCategories = async () => {
  try {
    const apperClient = getApperClient();
    const response = await apperClient.fetchRecords('products_c', {
      fields: [{"field": {"Name": "category_c"}}, {"field": {"Name": "subcategory_c"}}],
      groupBy: ["category_c", "subcategory_c"],
      orderBy: [{"fieldName": "category_c", "sorttype": "ASC"}]
    });

    if (!response.success) {
      console.error("Error fetching categories:", response.message);
      return [];
    }

    const categories = new Set();
    response.data?.forEach(item => {
      if (item.category_c) categories.add(item.category_c);
      if (item.subcategory_c) categories.add(item.subcategory_c);
    });

    return Array.from(categories).sort();
  } catch (error) {
    console.error("Error fetching categories:", error?.response?.data?.message || error);
    return [];
  }
};

// Create new product
export const create = async (productData) => {
  try {
    const apperClient = getApperClient();
    const dbProduct = mapProductToDatabase(productData);
    
    const response = await apperClient.createRecord('products_c', {
      records: [dbProduct]
    });

    if (!response.success) {
      console.error("Error creating product:", response.message);
      return null;
    }

    if (response.results && response.results.length > 0) {
      const result = response.results[0];
      if (result.success) {
        return mapProductFromDatabase(result.data);
      }
    }

    return null;
  } catch (error) {
    console.error("Error creating product:", error?.response?.data?.message || error);
    return null;
  }
};

// Update product
export const update = async (id, productData) => {
  try {
    const apperClient = getApperClient();
    const dbProduct = mapProductToDatabase(productData);
    dbProduct.Id = parseInt(id);
    
    const response = await apperClient.updateRecord('products_c', {
      records: [dbProduct]
    });

    if (!response.success) {
      console.error("Error updating product:", response.message);
      return null;
    }

    if (response.results && response.results.length > 0) {
      const result = response.results[0];
      if (result.success) {
        return mapProductFromDatabase(result.data);
      }
    }

    return null;
  } catch (error) {
    console.error("Error updating product:", error?.response?.data?.message || error);
    return null;
  }
};

// Delete product
export const deleteProduct = async (id) => {
  try {
    const apperClient = getApperClient();
    const response = await apperClient.deleteRecord('products_c', {
      RecordIds: [parseInt(id)]
    });

    if (!response.success) {
      console.error("Error deleting product:", response.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting product:", error?.response?.data?.message || error);
    return false;
  }
};
import { getApperClient } from "@/services/apperClient";

// Field mappings from mock data to database fields
const mapProductToDatabase = (product) => ({
  Name: product.name || product.Name,
  description_c: product.description || product.description_c,
  brand_c: product.brand || product.brand_c,
  category_c: product.category || product.category_c,
  subcategory_c: product.subcategory || product.subcategory_c,
  sizes_c: Array.isArray(product.sizes) ? product.sizes.join(',') : product.sizes_c,
  colors_c: Array.isArray(product.colors) ? product.colors.join(',') : product.colors_c,
  price_c: product.price || product.price_c,
  discount_price_c: product.discountPrice || product.discount_price_c,
  discount_percent_c: product.discountPercent || product.discount_percent_c,
  rating_c: product.rating || product.rating_c,
  review_count_c: product.reviewCount || product.review_count_c,
  in_stock_c: product.inStock !== undefined ? product.inStock : product.in_stock_c,
  // images_c handled separately by ApperFileFieldComponent
});

// Map database product to display format
const mapProductFromDatabase = (dbProduct) => ({
  Id: dbProduct.Id,
  name: dbProduct.Name,
  description: dbProduct.description_c,
  brand: dbProduct.brand_c,
  category: dbProduct.category_c,
  subcategory: dbProduct.subcategory_c,
  sizes: dbProduct.sizes_c ? dbProduct.sizes_c.split(',').map(s => s.trim()) : [],
  colors: dbProduct.colors_c ? dbProduct.colors_c.split(',').map(c => c.trim()) : [],
  price: dbProduct.price_c,
  discountPrice: dbProduct.discount_price_c,
  discountPercent: dbProduct.discount_percent_c,
  rating: dbProduct.rating_c,
  reviewCount: dbProduct.review_count_c,
  inStock: dbProduct.in_stock_c,
  images: dbProduct.images_c ? 
    (Array.isArray(dbProduct.images_c) ? dbProduct.images_c.map(img => img.url || img) : [dbProduct.images_c]) :
    ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop"] // fallback
});

export const getAll = async () => {
  try {
    const apperClient = getApperClient();
    const response = await apperClient.fetchRecords('products_c', {
      fields: [
        {"field": {"Name": "Name"}},
        {"field": {"Name": "description_c"}},
        {"field": {"Name": "brand_c"}},
        {"field": {"Name": "category_c"}},
        {"field": {"Name": "subcategory_c"}},
        {"field": {"Name": "sizes_c"}},
        {"field": {"Name": "colors_c"}},
        {"field": {"Name": "price_c"}},
        {"field": {"Name": "discount_price_c"}},
        {"field": {"Name": "discount_percent_c"}},
        {"field": {"Name": "rating_c"}},
        {"field": {"Name": "review_count_c"}},
        {"field": {"Name": "in_stock_c"}},
        {"field": {"Name": "images_c"}}
      ]
    });

    if (!response.success) {
      console.error("Error fetching products:", response.message);
      return [];
    }

    return response.data?.map(mapProductFromDatabase) || [];
  } catch (error) {
    console.error("Error fetching products:", error?.response?.data?.message || error);
    return [];
  }
};

export const getById = async (id) => {
  try {
    const apperClient = getApperClient();
    const response = await apperClient.getRecordById('products_c', parseInt(id), {
      fields: [
        {"field": {"Name": "Name"}},
        {"field": {"Name": "description_c"}},
        {"field": {"Name": "brand_c"}},
        {"field": {"Name": "category_c"}},
        {"field": {"Name": "subcategory_c"}},
        {"field": {"Name": "sizes_c"}},
        {"field": {"Name": "colors_c"}},
        {"field": {"Name": "price_c"}},
        {"field": {"Name": "discount_price_c"}},
        {"field": {"Name": "discount_percent_c"}},
        {"field": {"Name": "rating_c"}},
        {"field": {"Name": "review_count_c"}},
        {"field": {"Name": "in_stock_c"}},
        {"field": {"Name": "images_c"}}
      ]
    });

    if (!response.success) {
      console.error("Error fetching product:", response.message);
      throw new Error(`Product with ID ${id} not found`);
    }

    if (!response.data) {
      throw new Error(`Product with ID ${id} not found`);
    }

    return mapProductFromDatabase(response.data);
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error?.response?.data?.message || error);
    throw error;
  }
};

export const getByCategory = async (category) => {
  try {
    const apperClient = getApperClient();
    const response = await apperClient.fetchRecords('products_c', {
      fields: [
        {"field": {"Name": "Name"}},
        {"field": {"Name": "description_c"}},
        {"field": {"Name": "brand_c"}},
        {"field": {"Name": "category_c"}},
        {"field": {"Name": "subcategory_c"}},
        {"field": {"Name": "sizes_c"}},
        {"field": {"Name": "colors_c"}},
        {"field": {"Name": "price_c"}},
        {"field": {"Name": "discount_price_c"}},
        {"field": {"Name": "discount_percent_c"}},
        {"field": {"Name": "rating_c"}},
        {"field": {"Name": "review_count_c"}},
        {"field": {"Name": "in_stock_c"}},
        {"field": {"Name": "images_c"}}
      ],
      where: [{
        "FieldName": "category_c",
        "Operator": "EqualTo",
        "Values": [category],
        "Include": true
      }]
    });

    if (!response.success) {
      console.error("Error fetching products by category:", response.message);
      return [];
    }

    return response.data?.map(mapProductFromDatabase) || [];
  } catch (error) {
    console.error("Error fetching products by category:", error?.response?.data?.message || error);
    return [];
  }
};

export const getFilteredProducts = async (filters = {}) => {
  try {
    const apperClient = getApperClient();
    const whereConditions = [];

    // Category filter
    if (filters.categories && filters.categories.length > 0) {
      whereConditions.push({
        "FieldName": "category_c",
        "Operator": "ExactMatch",
        "Values": filters.categories,
        "Include": true
      });
    }

    // Brand filter
    if (filters.brands && filters.brands.length > 0) {
      whereConditions.push({
        "FieldName": "brand_c",
        "Operator": "ExactMatch",
        "Values": filters.brands,
        "Include": true
      });
    }

    // Price range filter
    if (filters.priceRange) {
      const { min, max } = filters.priceRange;
      whereConditions.push({
        "FieldName": "price_c",
        "Operator": "GreaterThanOrEqualTo",
        "Values": [min],
        "Include": true
      });
      whereConditions.push({
        "FieldName": "price_c",
        "Operator": "LessThanOrEqualTo",
        "Values": [max],
        "Include": true
      });
    }

    // Build sort order
    let orderBy = [];
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'price-low':
          orderBy.push({"fieldName": "price_c", "sorttype": "ASC"});
          break;
        case 'price-high':
          orderBy.push({"fieldName": "price_c", "sorttype": "DESC"});
          break;
        case 'newest':
          orderBy.push({"fieldName": "Id", "sorttype": "DESC"});
          break;
        case 'rating':
          orderBy.push({"fieldName": "rating_c", "sorttype": "DESC"});
          break;
        case 'discount':
          orderBy.push({"fieldName": "discount_percent_c", "sorttype": "DESC"});
          break;
        default:
          orderBy.push({"fieldName": "Id", "sorttype": "DESC"});
      }
    }

    const response = await apperClient.fetchRecords('products_c', {
      fields: [
        {"field": {"Name": "Name"}},
        {"field": {"Name": "description_c"}},
        {"field": {"Name": "brand_c"}},
        {"field": {"Name": "category_c"}},
        {"field": {"Name": "subcategory_c"}},
        {"field": {"Name": "sizes_c"}},
        {"field": {"Name": "colors_c"}},
        {"field": {"Name": "price_c"}},
        {"field": {"Name": "discount_price_c"}},
        {"field": {"Name": "discount_percent_c"}},
        {"field": {"Name": "rating_c"}},
        {"field": {"Name": "review_count_c"}},
        {"field": {"Name": "in_stock_c"}},
        {"field": {"Name": "images_c"}}
      ],
      where: whereConditions,
      orderBy: orderBy
    });

    if (!response.success) {
      console.error("Error fetching filtered products:", response.message);
      return [];
    }

    let products = response.data?.map(mapProductFromDatabase) || [];

    // Client-side filters for sizes and colors (multi-select fields)
    if (filters.sizes && filters.sizes.length > 0) {
      products = products.filter(p => 
        filters.sizes.some(size => p.sizes.includes(size))
      );
    }

    if (filters.colors && filters.colors.length > 0) {
      products = products.filter(p => 
        filters.colors.some(color => p.colors.includes(color))
      );
    }

    return products;
  } catch (error) {
    console.error("Error fetching filtered products:", error?.response?.data?.message || error);
    return [];
  }
};

export const searchProducts = async (query) => {
  try {
    if (!query || !query.trim()) return [];

    const apperClient = getApperClient();
    const searchTerm = query.toLowerCase().trim();
    
    const response = await apperClient.fetchRecords('products_c', {
      fields: [
        {"field": {"Name": "Name"}},
        {"field": {"Name": "description_c"}},
        {"field": {"Name": "brand_c"}},
        {"field": {"Name": "category_c"}},
        {"field": {"Name": "subcategory_c"}},
        {"field": {"Name": "sizes_c"}},
        {"field": {"Name": "colors_c"}},
        {"field": {"Name": "price_c"}},
        {"field": {"Name": "discount_price_c"}},
        {"field": {"Name": "discount_percent_c"}},
        {"field": {"Name": "rating_c"}},
        {"field": {"Name": "review_count_c"}},
        {"field": {"Name": "in_stock_c"}},
        {"field": {"Name": "images_c"}}
      ],
      whereGroups: [{
        "operator": "OR",
        "subGroups": [
          {
            "conditions": [
              {"fieldName": "Name", "operator": "Contains", "values": [searchTerm]},
              {"fieldName": "brand_c", "operator": "Contains", "values": [searchTerm]},
              {"fieldName": "category_c", "operator": "Contains", "values": [searchTerm]},
              {"fieldName": "description_c", "operator": "Contains", "values": [searchTerm]}
            ],
            "operator": "OR"
          }
        ]
      }]
    });

    if (!response.success) {
      console.error("Error searching products:", response.message);
      return [];
    }

    return response.data?.map(mapProductFromDatabase) || [];
  } catch (error) {
    console.error("Error searching products:", error?.response?.data?.message || error);
    return [];
  }
};

export const getFeaturedProducts = async () => {
  try {
    const apperClient = getApperClient();
    const response = await apperClient.fetchRecords('products_c', {
      fields: [
        {"field": {"Name": "Name"}},
        {"field": {"Name": "description_c"}},
        {"field": {"Name": "brand_c"}},
        {"field": {"Name": "category_c"}},
        {"field": {"Name": "subcategory_c"}},
        {"field": {"Name": "sizes_c"}},
        {"field": {"Name": "colors_c"}},
        {"field": {"Name": "price_c"}},
        {"field": {"Name": "discount_price_c"}},
        {"field": {"Name": "discount_percent_c"}},
        {"field": {"Name": "rating_c"}},
        {"field": {"Name": "review_count_c"}},
        {"field": {"Name": "in_stock_c"}},
        {"field": {"Name": "images_c"}}
      ],
      where: [{
        "FieldName": "rating_c",
        "Operator": "GreaterThanOrEqualTo",
        "Values": [4.5],
        "Include": true
      }],
      orderBy: [{"fieldName": "rating_c", "sorttype": "DESC"}],
      pagingInfo: {"limit": 8, "offset": 0}
    });

    if (!response.success) {
      console.error("Error fetching featured products:", response.message);
      return [];
    }

    return response.data?.map(mapProductFromDatabase) || [];
  } catch (error) {
    console.error("Error fetching featured products:", error?.response?.data?.message || error);
    return [];
  }
};

export const getSimilarProducts = async (productId, category) => {
  try {
    const apperClient = getApperClient();
    const response = await apperClient.fetchRecords('products_c', {
      fields: [
        {"field": {"Name": "Name"}},
        {"field": {"Name": "description_c"}},
        {"field": {"Name": "brand_c"}},
        {"field": {"Name": "category_c"}},
        {"field": {"Name": "subcategory_c"}},
        {"field": {"Name": "sizes_c"}},
        {"field": {"Name": "colors_c"}},
        {"field": {"Name": "price_c"}},
        {"field": {"Name": "discount_price_c"}},
        {"field": {"Name": "discount_percent_c"}},
        {"field": {"Name": "rating_c"}},
        {"field": {"Name": "review_count_c"}},
        {"field": {"Name": "in_stock_c"}},
        {"field": {"Name": "images_c"}}
      ],
      where: [
        {
          "FieldName": "category_c",
          "Operator": "EqualTo",
          "Values": [category],
          "Include": true
        },
        {
          "FieldName": "Id",
          "Operator": "NotEqualTo",
          "Values": [parseInt(productId)],
          "Include": true
        }
      ],
      pagingInfo: {"limit": 4, "offset": 0}
    });

    if (!response.success) {
      console.error("Error fetching similar products:", response.message);
      return [];
    }

    return response.data?.map(mapProductFromDatabase) || [];
  } catch (error) {
    console.error("Error fetching similar products:", error?.response?.data?.message || error);
    return [];
  }
};

export const getAllBrands = async () => {
  try {
    const apperClient = getApperClient();
    const response = await apperClient.fetchRecords('products_c', {
      fields: [{"field": {"Name": "brand_c"}}],
      groupBy: ["brand_c"],
      orderBy: [{"fieldName": "brand_c", "sorttype": "ASC"}]
    });

    if (!response.success) {
      console.error("Error fetching brands:", response.message);
      return [];
    }

    return response.data?.map(item => item.brand_c).filter(Boolean) || [];
  } catch (error) {
    console.error("Error fetching brands:", error?.response?.data?.message || error);
    return [];
  }
};

export const getAllCategories = async () => {
  try {
    const apperClient = getApperClient();
    const response = await apperClient.fetchRecords('products_c', {
      fields: [{"field": {"Name": "category_c"}}, {"field": {"Name": "subcategory_c"}}],
      groupBy: ["category_c", "subcategory_c"],
      orderBy: [{"fieldName": "category_c", "sorttype": "ASC"}]
    });

    if (!response.success) {
      console.error("Error fetching categories:", response.message);
      return [];
    }

    const categories = new Set();
    response.data?.forEach(item => {
      if (item.category_c) categories.add(item.category_c);
      if (item.subcategory_c) categories.add(item.subcategory_c);
    });

    return Array.from(categories).sort();
  } catch (error) {
    console.error("Error fetching categories:", error?.response?.data?.message || error);
    return [];
  }
};

// Create new product
export const create = async (productData) => {
  try {
    const apperClient = getApperClient();
    const dbProduct = mapProductToDatabase(productData);
    
    const response = await apperClient.createRecord('products_c', {
      records: [dbProduct]
    });

    if (!response.success) {
      console.error("Error creating product:", response.message);
      return null;
    }

    if (response.results && response.results.length > 0) {
      const result = response.results[0];
      if (result.success) {
        return mapProductFromDatabase(result.data);
      }
    }

    return null;
  } catch (error) {
    console.error("Error creating product:", error?.response?.data?.message || error);
    return null;
  }
};

// Update product
export const update = async (id, productData) => {
  try {
    const apperClient = getApperClient();
    const dbProduct = mapProductToDatabase(productData);
    dbProduct.Id = parseInt(id);
    
    const response = await apperClient.updateRecord('products_c', {
      records: [dbProduct]
    });

    if (!response.success) {
      console.error("Error updating product:", response.message);
      return null;
    }

    if (response.results && response.results.length > 0) {
      const result = response.results[0];
      if (result.success) {
        return mapProductFromDatabase(result.data);
      }
    }

    return null;
  } catch (error) {
    console.error("Error updating product:", error?.response?.data?.message || error);
    return null;
  }
};

// Delete product
export const deleteProduct = async (id) => {
  try {
    const apperClient = getApperClient();
    const response = await apperClient.deleteRecord('products_c', {
      RecordIds: [parseInt(id)]
    });

    if (!response.success) {
      console.error("Error deleting product:", response.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting product:", error?.response?.data?.message || error);
    return false;
  }
};