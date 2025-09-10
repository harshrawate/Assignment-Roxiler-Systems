const Store = require("../models/Store")

class StoreController {
  static async getAllStores(req, res) {
    try {
      const { name, email, address, sortBy, sortOrder } = req.query

      const filters = {
        name,
        email,
        address,
        sortBy,
        sortOrder,
      }

      const stores = await Store.findAll(filters)

      res.json({
        success: true,
        data: stores,
      })
    } catch (error) {
      console.error("Error fetching stores:", error)
      res.status(500).json({
        success: false,
        message: "Error fetching stores",
        error: error.message,
      })
    }
  }

static async createStore(req, res) {
  try {
    let { name, email, address, owner_id } = req.body

    // Fix: if owner_id is empty string, set it to NULL
    if (!owner_id || owner_id === "") {
      owner_id = null
    }

    const store = await Store.create({
      name,
      email,
      address,
      owner_id,
    })

    res.status(201).json({
      success: true,
      message: "Store created successfully",
      data: store,
    })
  } catch (error) {
    console.error("Error creating store:", error)
    res.status(500).json({
      success: false,
      message: "Error creating store",
      error: error.message,
    })
  }
}


  static async getStoreById(req, res) {
  try {
    const { storeId } = req.params;
    const { email } = req.query; // Accept email as query parameter

    // First try to find store by ID
    let store = await Store.findOne({ where: { id: storeId } });

    // If not found by ID and email provided, try to find by email
    if (!store && email) {
      store = await Store.findOne({ where: { email } });
    }

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    res.json({
      success: true,
      data: store,
    });
  } catch (error) {
    console.error("Error fetching store:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching store",
      error: error.message,
    });
  }
}


  static async getStoreRaters(req, res) {
    try {
      const { storeId } = req.params

      const raters = await Store.getStoreRaters(storeId)

      res.json({
        success: true,
        data: raters,
      })
    } catch (error) {
      console.error("Error fetching store raters:", error)
      res.status(500).json({
        success: false,
        message: "Error fetching store raters",
        error: error.message,
      })
    }
  }
}

module.exports = StoreController
