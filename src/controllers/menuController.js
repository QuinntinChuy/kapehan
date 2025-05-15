const { pool, columnExists } = require('../config/database');

exports.getAllItems = async (req, res) => {
  try {
    const [columns] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'menu_items'
    `, [process.env.DB_NAME || 'coffee_shop_db']);

    const availableColumns = columns.map(col => col.COLUMN_NAME);

    const selectFields = [
      availableColumns.includes('id') ? 'id' : null,
      availableColumns.includes('name') ? 'name' : null,
      availableColumns.includes('description') ? 'description' : null,
      availableColumns.includes('price') ? 'FORMAT(price, 2) as price' : null,
      availableColumns.includes('is_available') ? 'is_available' : null,
      availableColumns.includes('category') ? 'category' : null,
      availableColumns.includes('image_url') ? 'image_url' : null,
      availableColumns.includes('created_at') ? "DATE_FORMAT(created_at, '%Y-%m-%dT%H:%i:%s.0002') as created_at" : null
    ].filter(Boolean);

    if (selectFields.length === 0) {
      return res.status(200).json([]);
    }

    const orderBy = [];
    if (availableColumns.includes('category')) orderBy.push('category');
    if (availableColumns.includes('name')) orderBy.push('name');
    const orderByClause = orderBy.length > 0 ? `ORDER BY ${orderBy.join(', ')}` : '';

    const [rows] = await pool.query(`
      SELECT ${selectFields.join(', ')}
      FROM menu_items
      ${orderByClause}
    `);

    res.status(200).json({
      success: true,
      items: rows
    });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error when fetching menu items' 
    });
  }
};

exports.getItemsByCategory = async (req, res) => {
  const category = req.params.category;

  if (!category || !['hot', 'cold'].includes(category)) {
    return res.status(400).json({ 
      success: false,
      message: 'Invalid category. Use "hot" or "cold".' 
    });
  }

  try {
    if (!(await columnExists('menu_items', 'category'))) {
      return res.status(400).json({ 
        success: false,
        message: 'Category filtering not available' 
      });
    }

    const [rows] = await pool.query(`
      SELECT 
        id,
        name,
        description,
        FORMAT(price, 2) as price,
        ${await columnExists('menu_items', 'is_available') ? 'is_available,' : ''}
        category,
        ${await columnExists('menu_items', 'image_url') ? 'image_url,' : ''}
        ${await columnExists('menu_items', 'created_at') ? "DATE_FORMAT(created_at, '%Y-%m-%dT%H:%i:%s.0002') as created_at" : ''}
      FROM menu_items 
      WHERE category = ? 
      ORDER BY name
    `, [category]);

    res.json({
      success: true,
      items: rows
    });
  } catch (error) {
    console.error('Error fetching menu items by category:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error when fetching menu items by category' 
    });
  }
};

exports.getItemById = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        id,
        name,
        description,
        FORMAT(price, 2) as price,
        ${await columnExists('menu_items', 'is_available') ? 'is_available,' : ''}
        ${await columnExists('menu_items', 'category') ? 'category,' : ''}
        ${await columnExists('menu_items', 'image_url') ? 'image_url,' : ''}
        ${await columnExists('menu_items', 'created_at') ? "DATE_FORMAT(created_at, '%Y-%m-%dT%H:%i:%s.0002') as created_at" : ''}
      FROM menu_items 
      WHERE id = ?`, 
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Menu item not found' 
      });
    }

    res.json({
      success: true,
      item: rows[0]
    });
  } catch (error) {
    console.error('Error fetching menu item:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error when fetching menu item' 
    });
  }
};

exports.createItem = async (req, res) => {
  const { name, description, price, is_available, category, image_url } = req.body;

  if (!name || !price) {
    return res.status(400).json({ 
      success: false,
      message: 'Name and price are required' 
    });
  }

  try {
    const columns = ['name', 'description', 'price'];
    const values = [name, description || null, price];

    if (await columnExists('menu_items', 'is_available')) {
      columns.push('is_available');
      values.push(is_available !== undefined ? is_available : true);
    }

    if (await columnExists('menu_items', 'category')) {
      if (category && !['hot', 'cold'].includes(category)) {
        return res.status(400).json({ 
          success: false,
          message: 'Category must be either "hot" or "cold"' 
        });
      }
      columns.push('category');
      values.push(category || 'hot');
    }

    if (await columnExists('menu_items', 'image_url')) {
      columns.push('image_url');
      values.push(image_url || null);
    }

    const [result] = await pool.query(
      `INSERT INTO menu_items (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`,
      values
    );

    const [newItem] = await pool.query('SELECT * FROM menu_items WHERE id = ?', [result.insertId]);
    
    res.status(201).json({
      success: true,
      item: newItem[0]
    });
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error when creating menu item', 
      error: error.message 
    });
  }
};

exports.updateItem = async (req, res) => {
  const { name, description, price, is_available, category, image_url } = req.body;
  const id = req.params.id;

  try {
    const updates = [];
    const values = [];

    if (name !== undefined) { updates.push('name = ?'); values.push(name); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }
    if (price !== undefined) { updates.push('price = ?'); values.push(price); }

    if (await columnExists('menu_items', 'is_available') && is_available !== undefined) {
      updates.push('is_available = ?');
      values.push(is_available);
    }

    if (await columnExists('menu_items', 'category') && category !== undefined) {
      if (!['hot', 'cold'].includes(category)) {
        return res.status(400).json({ 
          success: false,
          message: 'Category must be either "hot" or "cold"' 
        });
      }
      updates.push('category = ?');
      values.push(category);
    }

    if (await columnExists('menu_items', 'image_url') && image_url !== undefined) {
      updates.push('image_url = ?');
      values.push(image_url);
    }

    if (updates.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'No valid fields to update' 
      });
    }

    values.push(id);

    const [result] = await pool.query(
      `UPDATE menu_items SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Menu item not found' 
      });
    }

    const [updatedItem] = await pool.query('SELECT * FROM menu_items WHERE id = ?', [id]);
    
    res.json({
      success: true,
      item: updatedItem[0]
    });
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error when updating menu item', 
      error: error.message 
    });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM menu_items WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Menu item not found' 
      });
    }

    res.json({ 
      success: true,
      message: 'Menu item deleted successfully', 
      id: req.params.id 
    });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error when deleting menu item', 
      error: error.message 
    });
  }
};