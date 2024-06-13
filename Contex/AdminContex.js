import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import db from "../conncet.js";
import nodemailer from 'nodemailer';

// Email configuration (configure this with your email service provider)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'subhajitncvt@gmail.com',
        pass: 'ofkl wdyz tzlg lbky'
    }
});

// Function to generate a reset password token
const generateResetPasswordToken = () => {
    return jwt.sign({}, "reset_password_secret", { expiresIn: '10m' });
};

// Function to hash the password
const hashPassword = async (password) => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
};

// Function to create admin table if not exists
const createAdminTable = () => {
    const createTableQuery = `CREATE TABLE IF NOT EXISTS admin (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        username VARCHAR(255)
    )`;
    db.query(createTableQuery, (err) => {
        if (err) {
            console.error("Error creating admin table:", err);
        }
    });
};

// Register function with forgot password integration
// Register function with forgot password integration
export const register = (req, res) => {
    createAdminTable();
    const { email, username, password } = req.body;

    // Check if the email already exists in the database
    const checkEmailQuery = "SELECT * FROM admin WHERE email = ?";
    db.query(checkEmailQuery, [email], (err, results) => {
        if (err) {
            console.error("Error checking email:", err);
            return res.status(500).json({ error: "Database error", details: err });
        }
        
        if (results.length > 0) {
            // Email already exists, return an error response
            return res.status(400).json({ error: "Email already exists" });
        }

        // Email does not exist, proceed with registration
        const otp = generateOTP(); // Generate OTP
        const token = generateOTPToken(otp); // Generate OTP token

        // Send OTP to user's email
        transporter.sendMail({
            from: 'subhajitncvt@gmail.com',
            to: email,
            subject: 'Registration OTP',
            text: `Your OTP for registration is: ${otp}`
        }, (err) => {
            if (err) {
                console.error("Error occurred while sending email:", err);
                return res.status(500).json({ error: "Failed to send OTP email", details: err });
            }

            console.log("Email sent successfully");
            return res.status(200).json({ message: "OTP sent successfully", token });
        });
    });
};


// Verify OTP and register user
export const verifyOTPAndRegister = (req, res) => {
   
    const { otpToken, otp, email, username, password } = req.body;

    // Verify OTP token
    jwt.verify(otpToken, "otp_secret", (err, decoded) => {
        if (err) {
            console.error('Error verifying OTP token or OTP mismatch:', err);
            return res.status(400).json({ error: "Invalid OTP or expired OTP token" });
        }
    
    
    

        // Hash the password
   bcrypt.hash(password, 8, (err, hashedPassword) => {
            console.log(hashedPassword)
            if (err) {
                return res.status(500).json({ error: "Failed to hash password" });
            }

            // Proceed with registration
            const insertQuery = "INSERT INTO admin (email, password, username) VALUES (?, ?, ?)";
            const values = [email, hashedPassword, username];

            db.query(insertQuery, values, (err) => {
                if (err) {
                    return res.status(500).json({ error: "Failed to register user", details: err });
                }
                return res.status(200).json({ message: "User registered successfully" });
            });
        });
    });
};

// Login function
export const login = (req, res) => {
    const { email, password } = req.body;
    console.log(req.body)
    const query = "SELECT * FROM admin WHERE email = ?";
    db.query(query, [email], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Database error" });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const user = results[0];
        bcrypt.compare(password, user.password, (err, result) => {
            if (err || !result) {
                return res.status(401).json({ error: "Invalid credentials" });
            }
            const token = jwt.sign({ id: user.id }, "secretkey", { expiresIn: '1h' });
            return res.status(200).json({ token });
        });
    });
};

// Forgot password function
export const forgotPassword = (req, res) => {
    const { email } = req.body;
    const resetToken = generateResetPasswordToken();

    // Save reset token in the database
    const updateQuery = "UPDATE admin SET reset_token = ? WHERE email = ?";
    db.query(updateQuery, [resetToken, email], (err) => {
        if (err) {
            console.error("Error updating reset token:", err);
            return res.status(500).json({ error: "Failed to update reset token", details: err });
        }

        // Send reset password email with token
        transporter.sendMail({
            from: 'subhajitncvt@gmail.com',
            to: email,
            subject: 'Reset Password',
            text: `Click on the following link to reset your password: http://yourdomain/reset-password?token=${resetToken}`
        }, (err) => {
            if (err) {
                console.error("Error occurred while sending email:", err);
                return res.status(500).json({ error: "Failed to send reset password email", details: err });
            }

            console.log("Reset password email sent successfully");
            return res.status(200).json({ message: "Reset password email sent successfully" });
        });
    });
};

// Reset password function
export const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    // Verify reset password token
    jwt.verify(token, "reset_password_secret", async (err) => {
        if (err) {
            return res.status(400).json({ error: "Invalid or expired reset password token" });
        }

        try {
            // Hash the new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Update user's password in the database
            const updateQuery = "UPDATE admin SET password = ?, reset_token = NULL WHERE reset_token = ?";
            db.query(updateQuery, [hashedPassword, token], (err) => {
                if (err) {
                    return res.status(500).json({ error: "Failed to reset password", details: err });
                }

                return res.status(200).json({ message: "Password reset successfully" });
            });
        } catch (error) {
            console.error("Error occurred while hashing password:", error);
            return res.status(500).json({ error: "Failed to reset password", details: error });
        }
    });
};

// Logout function
export const logout = (req, res) => {
    res.clearCookie("accessToken").status(200).json({ message: "User is logged out" });
};


const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000); // Generates a random 4-digit number
};

// Function to generate JWT token containing the OTP payload
const generateOTPToken = (otp) => {


    return jwt.sign({ otp }, "otp_secret", { expiresIn: '10m' }); 
    // Token expires in 10 minutes
};
