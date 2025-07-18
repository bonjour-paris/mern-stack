import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';

// Extend Request type to include user property
declare module 'express' {
  interface Request {
    user?: {
      id: string;
      role: 'seller' | 'customer' | 'admin';
      adminRole?: 'superadmin' | 'useradmin';
      email: string;
      iat?: number;
      exp?: number;
    };
  }
}

// Configure Mailtrap transporter globally
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.EMAIL_PORT || '2525'),
  auth: {
    user: process.env.EMAIL_USER || '4260d5f9e4c5b6',
    pass: process.env.EMAIL_PASS || '88e29e88fc4226',
  },
});

// Helper to check if email exists
const isEmailTaken = async (email: string) => {
  const user = await User.findOne({ email });
  return !!user;
};

// Seller Registration
export const registerSeller = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log('Received request at /register/seller:', {
      body: req.body,
      file: req.file,
      headers: req.headers,
    });

    const { companyName, email, contactNumber, originCountry } = req.body;
    const logoUrl = req.file?.filename ? `http://localhost:5000/uploads/${req.file.filename}` : null;

    console.log('Parsed data:', { companyName, email, contactNumber, originCountry, logoUrl });

    if (!companyName || !email || !contactNumber || !originCountry || !logoUrl) {
      console.log('Validation failed - Missing fields:', { companyName, email, contactNumber, originCountry, logoUrl });
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    if (!req.file || !['image/jpeg', 'image/png'].includes(req.file.mimetype)) {
      console.log('Validation failed - Invalid file type:', req.file);
      res.status(400).json({ message: 'Only JPG or PNG images allowed' });
      return;
    }

    // Allow multiple sellers with the same base email by appending a unique suffix
    const uniqueEmail = `${email}_${Date.now()}_${uuidv4().slice(0, 8)}`; // Unique email for new record
    const sellerId = uuidv4();
    const seller = new User({
      companyName,
      email: uniqueEmail,
      contactNumber,
      originCountry,
      logoUrl,
      role: 'seller',
      status: 'pending',
      sellerId,
    });

    await seller.save();
    console.log('New seller saved to DB with unique email and logoUrl:', seller.toObject());
    res.status(201).json({ message: 'Seller registered successfully, pending admin approval' });
  } catch (error: any) {
    console.error('Registration error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      file: req.file,
    });
    if (error.name === 'MongoError' && error.code === 11000) {
      res.status(409).json({ message: 'Duplicate sellerId conflict. Please try again.', error: error.message });
    } else if (error.name === 'ValidationError') {
      res.status(400).json({ message: 'Validation error', details: error.errors });
    } else {
      res.status(500).json({ message: 'Registration failed. Please try again.', error: error.message });
    }
    next(error);
  }
};

// Customer Registration
export const registerCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log('Request body:', req.body);
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      console.log('Validation failed - Missing fields:', { name, email, password, confirmPassword });
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    if (password.length < 6) {
      console.log('Validation failed - Password too short:', password);
      res.status(400).json({ message: 'Password must be at least 6 characters' });
      return;
    }

    if (password !== confirmPassword) {
      console.log('Validation failed - Passwords do not match');
      res.status(400).json({ message: 'Passwords do not match' });
      return;
    }

    if (await isEmailTaken(email)) {
      console.log('Validation failed - Email already taken:', email);
      res.status(409).json({ message: 'Email already registered. Please login.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const customer = new User({
      name,
      email,
      password: hashedPassword,
      role: 'customer',
    });

    await customer.save();
    console.log('Customer saved successfully:', customer._id);

    res.status(201).json({ message: 'Customer registered successfully' });
  } catch (error: any) {
    console.error('Customer registration error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
    });
    if (error.name === 'MongoError' && error.code === 11000) {
      res.status(409).json({ message: 'Email conflict. Please use a different email.', error: error.message });
    } else if (error.name === 'ValidationError') {
      res.status(400).json({ message: 'Validation error', details: error.errors });
    } else {
      res.status(500).json({ message: 'Registration failed. Please try again.', error: error.message });
    }
    next(error);
  }
};

// Admin Registration
export const registerAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log('Request body:', req.body);
    const { name, email, role, password, confirmPassword } = req.body;

    if (!name || !email || !role || !password || !confirmPassword) {
      console.log('Validation failed - Missing fields:', { name, email, role, password, confirmPassword });
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    if (!['superadmin', 'useradmin'].includes(role)) {
      console.log('Validation failed - Invalid admin role:', role);
      res.status(400).json({ message: 'Invalid admin role' });
      return;
    }

    if (password !== confirmPassword) {
      console.log('Validation failed - Passwords do not match');
      res.status(400).json({ message: 'Passwords do not match' });
      return;
    }

    if (await isEmailTaken(email)) {
      console.log('Validation failed - Email already taken:', email);
      res.status(409).json({ message: 'Email already registered. Please login.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new User({
      name,
      email,
      adminRole: role,
      password: hashedPassword,
      role: 'admin',
    });

    await admin.save();
    console.log('Admin saved successfully:', admin._id);

    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (error: any) {
    console.error('Admin registration error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
    });
    if (error.name === 'MongoError' && error.code === 11000) {
      res.status(409).json({ message: 'Email conflict. Please use a different email.', error: error.message });
    } else if (error.name === 'ValidationError') {
      res.status(400).json({ message: 'Validation error', details: error.errors });
    } else {
      res.status(500).json({ message: 'Registration failed. Please try again.', error: error.message });
    }
    next(error);
  }
};

// Login
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log('Request body:', req.body);
    const { email, password, role, adminRole } = req.body;

    if (!email || !password || !role) {
      console.log('Validation failed - Missing fields:', { email, password, role });
      res.status(400).json({ message: 'Email, password, and role are required' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log('Validation failed - Invalid email:', email);
      res.status(401).json({ message: 'Invalid email' });
      return;
    }

    if (user.role !== role) {
      console.log('Validation failed - Role mismatch:', { requestedRole: role, userRole: user.role });
      res.status(403).json({ message: `Role does not match. Use "${user.role}" role for this account.` });
      return;
    }

    if (user.role === 'admin' && !adminRole) {
      console.log('Validation failed - Admin role required:', { role });
      res.status(400).json({ message: 'Admin role is required' });
      return;
    }

    if (user.role === 'admin' && adminRole) {
      if (!user.adminRole || user.adminRole !== adminRole || !['useradmin', 'superadmin'].includes(adminRole)) {
        console.log('Validation failed - Invalid admin role:', { adminRole, userAdminRole: user.adminRole });
        res.status(403).json({ message: 'Invalid admin role' });
        return;
      }
    }

    if (user.role === 'seller' && user.status !== 'approved') {
      console.log('Validation failed - Seller not approved:', { email, status: user.status });
      res.status(403).json({ message: 'Seller account not approved. Please wait for admin approval.' });
      return;
    }

    const isValid = await bcrypt.compare(password, user.password || '');
    if (!isValid) {
      console.log('Validation failed - Invalid password for:', email);
      res.status(401).json({ message: 'Invalid password' });
      return;
    }

    const payload = {
      id: user._id,
      email: user.email,
      role: user.role,
      ...(user.role === 'admin' && { adminRole: user.adminRole }),
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '7d' });

    console.log('Login successful for:', email);
    res.json({ 
      token, 
      message: 'Login successful',
      redirect: user.role === 'seller' ? '/seller/dashboard' : user.role === 'admin' ? '/useradmin' : '/customer'
    });
  } catch (error: any) {
    console.error('Login error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
    });
    res.status(500).json({ message: 'Login failed. Please try again.', error: error.message });
    next(error);
  }
};

// Get Pending Sellers
export const getPendingSellers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log('Fetching pending sellers...', { user: req.user });
    const sellers = await User.find({ role: 'seller', status: 'pending' })
      .sort({ createdAt: -1 }) // Latest first
      .select('_id companyName email contactNumber originCountry logoUrl status sellerId');
    console.log('Pending sellers found in DB:', sellers.map(s => ({ _id: s._id, email: s.email, status: s.status })));
    if (sellers.length === 0) {
      console.log('No pending sellers found in database');
    }
    res.json(sellers);
  } catch (error: any) {
    console.error('Error fetching pending sellers:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
    });
    res.status(500).json({ message: 'Failed to fetch pending sellers.', error: error.message });
    next(error);
  }
};

// Seller Approval
export const approveSeller = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log('Approval request:', { params: req.params, body: req.body });
    const { id } = req.params;
    const { approve } = req.body;

    const seller = await User.findById(id);
    if (!seller || seller.role !== 'seller') {
      console.log('Seller not found or invalid role:', { id, role: seller?.role });
      res.status(404).json({ message: 'Seller not found' });
      return;
    }

    seller.status = approve ? 'approved' : 'rejected';
    await seller.save();
    console.log('Seller status updated:', { id, status: seller.status });

    if (approve) {
      const tempPassword = Math.random().toString(36).slice(-8);
      seller.password = await bcrypt.hash(tempPassword, 10);
      await seller.save();
      console.log('Temporary password generated:', tempPassword);

      const mailOptions = {
        from: 'admin@yourdomain.com', // Update with a valid email or use .env
        to: seller.email,
        subject: 'Seller Account Approved - Temporary Password',
        text: `Hello ${seller.companyName},\n\nYour seller account has been approved. Use the temporary password below to log in to your dashboard:\n\nTemporary Password: ${tempPassword}\n\nPlease change your password after logging in.\n\nBest,\nYour Admin Team`,
      };

      await transporter.sendMail(mailOptions);
      console.log('Approval email sent to:', seller.email);
    }

    res.json({ message: approve ? 'Seller approved and email sent' : 'Seller rejected' });
  } catch (error: any) {
    console.error('Error approving seller:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
    });
    res.status(500).json({ message: 'Failed to update seller status.', error: error.message });
    next(error);
  }
};

// Change Password
export const changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const user = await User.findById((req as any).user.id);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const isValid = await bcrypt.compare(currentPassword, user.password || '');
    if (!isValid) {
      res.status(401).json({ message: 'Current password is incorrect' });
      return;
    }

    if (newPassword !== confirmPassword) {
      res.status(400).json({ message: 'New passwords do not match' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ message: 'New password must be at least 6 characters' });
      return;
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to change password.', error: error.message });
    next(error);
  }
};