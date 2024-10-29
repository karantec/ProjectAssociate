const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // Import the crypto module
const User = require('../models/User');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../config/email');
const { validationResult } = require('express-validator');

// Generate a random verification code
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate a random reset token
const generateResetToken = () => {
    return crypto.randomBytes(32).toString('hex'); // 32 bytes, returns a hex string
};

// Signup function
const signup = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, dob, phone, password, address } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationCode = generateVerificationCode();

        const user = new User({
            name,
            email,
            dob,
            phone,
            password: hashedPassword,
            address,
            verificationCode
        });

        await user.save();
        await sendVerificationEmail(email, name, phone, verificationCode);

        res.status(201).json({ 
            message: 'User registered successfully. Awaiting verification.' 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get users function
const getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password -verificationCode'); // Exclude sensitive information
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Verify function
const verify = async (req, res) => {
    try {
        const { email, verificationCode } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.verificationCode !== verificationCode) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }

        user.isVerified = true;
        user.verificationCode = undefined;
        await user.save();

        res.json({ message: 'User verified successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Forgot password function
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'No user found with this email' });
        }

        const resetToken = generateResetToken(); // Call the generateResetToken function
        const resetTokenExpiry = new Date(Date.now() + 3600000); // Token valid for 1 hour

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetTokenExpiry;
        await user.save();

        const emailSent = await sendPasswordResetEmail(email, resetToken);

        if (!emailSent) {
            return res.status(500).json({ 
                message: 'Error sending password reset email' 
            });
        }

        res.json({ 
            message: 'Password reset link has been sent to your email' 
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Login function
const login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.isVerified) {
            return res.status(401).json({ 
                message: 'Please verify your email first' 
            });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '24h'
        });

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Reset password function
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ 
                message: 'Token and new password are required' 
            });
        }

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ 
                message: 'Password reset token is invalid or has expired' 
            });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Update user's password and clear reset token fields
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: 'Password has been reset successfully' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, dob, phone, address } = req.body;

        // Find the user by ID
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update fields if provided in request body
        if (name) user.name = name;
        if (dob) user.dob = dob;
        if (phone) user.phone = phone;
        if (address) user.address = address;

        await user.save();

        res.json({
            message: 'User updated successfully',
            user: {
                id: user._id,
                name: user.name,
                dob: user.dob,
                phone: user.phone,
                address: user.address,
                email: user.email,
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete user function
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await user.remove();

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


module.exports = {
    signup,
    verify,
    login,
    forgotPassword,
    resetPassword,
    getUsers,
    updateUser,
    deleteUser,
};
