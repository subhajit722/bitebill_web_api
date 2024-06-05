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
        FOREIGN KEY (admin_item_id) REFERENCES admin(id),
        FOREIGN KEY (bill_no_id) REFERENCES bill(id),
        FOREIGN KEY (item_id) REFERENCES item(id)
    )`;

    db.query(createBillListTableQuery, (err) => {
        if (err) {
            console.error("Error creating billlist table:", err);
        }
    });
};

export const postBillList = (req, res) => {
    createBillList()
    console.log(req.body)
    const { billNoId, itemId, quantity, price, gst } = req.body;
    const adminItemId = req.user.id;
    const totalprice = calculateTotalPrice(price, gst,quantity);
    // Insert a new bill list entry into the database
    const insertBillListQuery = "INSERT INTO billlist (admin_item_id, bill_no_id, item_id, quantity, totalprice) VALUES (?, ?, ?, ?, ?)";
    db.query(insertBillListQuery, [adminItemId, billNoId, itemId, quantity, totalprice], (err, result) => {
        if (err) {
            console.error("Error inserting bill list entry:", err);
            return res.status(500).json({ error: "Failed to insert bill list entry", details: err });
        }
        return res.status(201).json({ message: "Bill list entry created successfully", billListId: result.insertId });
    });
};


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
