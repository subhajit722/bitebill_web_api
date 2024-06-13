import db from '../conncet.js'

export const createBillList = () => {
    // Create billlist table if not exists
    const createBillListTableQuery = `CREATE TABLE IF NOT EXISTS billlist (
        id INT AUTO_INCREMENT PRIMARY KEY,
        admin_item_id INT,
        bill_no_id INT,
        item_id INT,
        quantity INT,
        totalprice DECIMAL(10, 2),
        FOREIGN KEY (admin_item_id) REFERENCES admin(id) ON DELETE CASCADE,
        FOREIGN KEY (bill_no_id) REFERENCES bill(id) ON DELETE CASCADE,
        FOREIGN KEY (item_id) REFERENCES item(id) ON DELETE CASCADE
    )`;
    



    db.query(createBillListTableQuery, (err) => {
        if (err) {
            console.error("Error creating billlist table:", err);
        }
    });
};



export const postBillList = (req, res) => {
    createBillList();
    console.log(req.body);
    const { billNoId, itemId, quantity, price, gst } = req.body;
    const adminItemId = req.user.id;
    const totalprice = calculateTotalPrice(price, gst, quantity);
    const updateStockQuery = "UPDATE item SET stock = stock - ? WHERE id = ?";
    const deleteItemQuery = "DELETE FROM item WHERE id = ?";

    // Insert a new bill list entry into the database
    const insertBillListQuery = "INSERT INTO billlist (admin_item_id, bill_no_id, item_id, quantity, totalprice) VALUES (?, ?, ?, ?, ?)";
    db.query(insertBillListQuery, [adminItemId, billNoId, itemId, quantity, totalprice], (err, result) => {
        if (err) {
            console.error("Error inserting bill list entry:", err);
            return res.status(500).json({ error: "Failed to insert bill list entry", details: err });
        }

        // Update the stock in the item table
        db.query(updateStockQuery, [quantity, itemId], (err) => {
            if (err) {
                console.error("Error updating stock:", err);
                return res.status(500).json({ error: "Failed to update stock", details: err });
            }

            // Check if stock is 0
            db.query("SELECT stock FROM item WHERE id = ?", [itemId], (err, result) => {
                if (err) {
                    console.error("Error checking stock:", err);
                    return res.status(500).json({ error: "Failed to check stock", details: err });
                }

                const stock = result[0].stock;
                if (stock === 0) {
                    // If stock is 0, send a message indicating item is out of stock
                    return res.status(400).json({ error: "Item is out of stock" });
                }

                // If stock is not 0, continue with the response indicating successful creation of bill list entry
                return res.status(201).json({ message: "Bill list entry created successfully", billListId: result.insertId });
            });
        });
    });
};


// export const postBillList = (req, res) => {
//     createBillList();
//     console.log(req.body);
//     const { billNoId, itemId, quantity, price, gst } = req.body;
//     const adminItemId = req.user.id;
//     const totalprice = calculateTotalPrice(price, gst, quantity);
//     const updateStockQuery = "UPDATE item SET stock = stock - ? WHERE id = ?";
//     const deleteItemQuery = "DELETE FROM item WHERE id = ?";

//     // Insert a new bill list entry into the database
//     const insertBillListQuery = "INSERT INTO billlist (admin_item_id, bill_no_id, item_id, quantity, totalprice) VALUES (?, ?, ?, ?, ?)";
//     db.query(insertBillListQuery, [adminItemId, billNoId, itemId, quantity, totalprice], (err, result) => {
//         if (err) {
//             console.error("Error inserting bill list entry:", err);
//             return res.status(500).json({ error: "Failed to insert bill list entry", details: err });
//         }

//         // Update the stock in the item table
//         db.query(updateStockQuery, [quantity, itemId], (err) => {
//             if (err) {
//                 console.error("Error updating stock:", err);
//                 return res.status(500).json({ error: "Failed to update stock", details: err });
//             }

//             // Check if stock is 0 and delete item if necessary
//             db.query("SELECT stock FROM item WHERE id = ?", [itemId], (err, result) => {
//                 if (err) {
//                     console.error("Error checking stock:", err);
//                     return res.status(500).json({ error: "Failed to check stock", details: err });
//                 }

//                 const stock = result[0].stock;
//                 if (stock === 0) {
//                     // If stock is 0, delete the item
//                     db.query(deleteItemQuery, [itemId], (err) => {
//                         if (err) {
//                             console.error("Error deleting item:", err);
//                             return res.status(500).json({ error: "Failed to delete item", details: err });
//                         }
//                         console.log("Item deleted successfully");
//                     });
//                 }
//             });

//             return res.status(201).json({ message: "Bill list entry created successfully", billListId: result.insertId });
//         });
//     });
// };



export const getBillList = (req, res) => {
    const { billNoId } = req.params;
const adminItemId = req.user.id
    // Get all billlist entries for the specified admin item and bill from the database
    const getBillListQuery = `
        SELECT 
            billlist.id AS billlist_id, 
            item.id AS item_id, 
            item.itemname, 
            item.category,
            quantity AS quantity,
            item.price, 
            item.gst 
        FROM 
            billlist 
        INNER JOIN 
            item ON billlist.item_id = item.id 
        WHERE 
            billlist.admin_item_id = ? AND 
            billlist.bill_no_id = ?`;
    
    db.query(getBillListQuery, [adminItemId, billNoId], (err, results) => {
        if (err) {
            console.error("Error getting bill list:", err);
            return res.status(500).json({ error: "Failed to get bill list", details: err });
        }
        return res.status(200).json(results);
    });
};

const calculateTotalPrice = (price, gst, quantity) => {
    const totalPricePerItem = parseFloat(price) + (parseFloat(price) * parseFloat(gst) / 100);
    const totalPrice = totalPricePerItem * parseInt(quantity);
    return totalPrice.toFixed(2);
};
