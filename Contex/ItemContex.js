import db from '../conncet.js'
export const PostItem = (req, res) => {
    const { itemname, category, price, gst, itemcode, stock } = req.body;
    const adminId = req.user.id; // Assuming you have user authentication middleware setting req.user

    // Create item table if not exists
    const createItemTableQuery = `CREATE TABLE IF NOT EXISTS item (
        id INT AUTO_INCREMENT PRIMARY KEY,
        admin_id INT,
        itemname VARCHAR(255) NOT NULL,
        itemcode INT,
        category VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        gst DECIMAL(5, 2) NOT NULL,
        totalprice DECIMAL(10, 2),
        stock INT,
        FOREIGN KEY (admin_id) REFERENCES admin(id) ON DELETE CASCADE
    )`; // Removed extra closing parenthesis here

    db.query(createItemTableQuery, (err) => {
        if (err) {
            console.error("Error creating item table:", err);
            return res.status(500).json({ error: "Failed to create item table", details: err });
        }

        // Insert item into the database
        const insertItemQuery = "INSERT INTO item (admin_id, itemname, itemcode, category, price, gst, totalprice, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        const totalprice = calculateTotalPrice(price, gst);
        const values = [adminId, itemname, itemcode, category, price, gst, totalprice, stock]; // Added stock here

        db.query(insertItemQuery, values, (err) => {
            if (err) {
                console.error("Error inserting item:", err);
                return res.status(500).json({ error: "Failed to insert item", details: err });
            }
            return res.status(200).json({ message: "Item added successfully" });
        });
    });
};



export const GetItem = (req, res) => {
    const adminId = req.user.id; // Assuming you have user authentication middleware setting req.user

    // Get all items for the admin from the database
    const getItemQuery = "SELECT * FROM item WHERE admin_id = ?";
    db.query(getItemQuery, [adminId], (err, results) => {
        if (err) {
            console.error("Error getting items:", err);
            return res.status(500).json({ error: "Failed to get items", details: err });
        }
        return res.status(200).json(results);
    });
};

// Function to calculate total price including GST
const calculateTotalPrice = (price, gst) => {
    const totalPrice = parseFloat(price) + (parseFloat(price) * parseFloat(gst) / 100);
    return totalPrice.toFixed(2);
};







export const EditItem = (req, res) => {
    const {id } = req.params
    const {  itemname, category, price, gst, itemcode } = req.body;
    console.log(req.body)
    const adminId = req.user.id; // Assuming you have user authentication middleware setting req.user
console.log(req.body)
    // Calculate total price including GST
    const totalPrice = parseFloat(price) + (parseFloat(price) * parseFloat(gst) / 100);

    // Update item in the database
    const updateItemQuery = "UPDATE item SET itemname = ?, category = ?, price = ?, gst = ?, itemcode = ?, totalprice = ? WHERE id = ? AND admin_id = ?";
    const values = [itemname, category, price, gst, itemcode, totalPrice.toFixed(2), id, adminId];

    db.query(updateItemQuery, values, (err) => {
        if (err) {
            console.error("Error updating item:", err);
            return res.status(500).json({ error: "Failed to update item", details: err });
        }
        return res.status(200).json({ message: "Item updated successfully" });
    });
};

export const DeleteItem = (req, res) => {
    console.log('hey')
    const { id } = req.params;
    const adminId = req.user.id; // Assuming you have user authentication middleware setting req.user
    console.log(id)

    const deleteItemQuery = "DELETE FROM item WHERE id = ? AND admin_id = ?";
    db.query(deleteItemQuery, [id, adminId], (err) => {
        if (err) {
            console.error("Error deleting item:", err);
            return res.status(500).json({ error: "Failed to delete item", details: err });
        }
        return res.status(200).json({ message: "Item deleted successfully" });
    });
};
