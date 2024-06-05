import db from '../conncet.js'
export const generateBill = () => {
    // Create bill table if not exists
    const createBillTableQuery = `CREATE TABLE IF NOT EXISTS bill (
        id INT AUTO_INCREMENT PRIMARY KEY,
        admin_bill_id INT,
        bill_no VARCHAR(50) NOT NULL,
        bill_name VARCHAR(255) NOT NULL,
        create_datetime DATETIME,
        FOREIGN KEY (admin_bill_id) REFERENCES admin(id)
    )`;

    db.query(createBillTableQuery, (err) => {
        if (err) {
            console.error("Error creating bill table:", err);
        }
    });
};



export const postBill = (req, res) => {
    generateBill()
    const { billNo, billName } = req.body;

    console.log(req.body)
    const adminBillId = req.user.id; // Assuming you have user authentication middleware setting req.user

    // Insert the new bill into the database
    const insertBillQuery = "INSERT INTO bill (admin_bill_id, bill_no, bill_name, create_datetime) VALUES (?, ?, ?, NOW())";
    db.query(insertBillQuery, [adminBillId, billNo, billName], (err, result) => {
        if (err) {
            console.error("Error inserting bill:", err);
            return res.status(500).json({ error: "Failed to insert bill", details: err });
        }
        return res.status(201).json({ message: "Bill created successfully", billId: result.insertId });
    });
};

export const getLastBill = (req, res) => {
    generateBill(); // Ensure the bill table is created
    const adminBillId = req.user.id; // Assuming you have user authentication middleware setting req.user

    // Get the last bill for the admin from the database based on the maximum bill number
    const getLastBillQuery = "SELECT * FROM bill WHERE admin_bill_id = ? ORDER BY CAST(SUBSTRING_INDEX(bill_no, ' ', -1) AS UNSIGNED) DESC LIMIT 1";
    db.query(getLastBillQuery, [adminBillId], (err, result) => {
        if (err) {
            console.error("Error getting last bill:", err);
            return res.status(500).json({ error: "Failed to get last bill", details: err });
        }

        if (result.length > 0) {
            console.log("Last bill retrieved:", result[0]);
            return res.status(200).json(result[0]); // Assuming there's only one last bill, so returning the first result
        } else {
            console.log("No previous bill found for admin ID:", adminBillId);
            return res.status(200).json({ bill_no: undefined }); // Handle the case where no previous bill is found
        }
    });
};
export const getBill = (req, res) => {
    generateBill(); // Call the function to ensure the bill table is created
    const adminBillId = req.user.id; // Assuming you have user authentication middleware setting req.user

    // Get all bills for the admin from the database
    const getBillQuery = "SELECT * FROM bill WHERE admin_bill_id = ?";
    db.query(getBillQuery, [adminBillId], (err, results) => {
        if (err) {
            console.error("Error getting bills:", err);
            return res.status(500).json({ error: "Failed to get bills", details: err });
        }
        return res.status(200).json(results);
    });
};