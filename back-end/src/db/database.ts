import mysql, { ResultSetHeader, RowDataPacket } from "mysql2/promise";

// ========================================================
// 1. DATABASE CONNECTION
// ========================================================
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS, 
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ========================================================
// 2. USERS
// ========================================================

export interface UserLogin extends RowDataPacket {
  id: number;
  first_name: string | null;
  last_name: string | null;
  email: string;
  password: string;
  location: string | null;
  profile_picture_url: string | null;
  role: "user" | "admin";
  created_at: string;
}

export const authUser = async (email: string): Promise<UserLogin[]> => {
  const query = "SELECT * FROM user WHERE email = ?"; 
  const [rows] = await pool.query<UserLogin[]>(query, [email]);
  return rows;
};

export const createUser = async (
  firstName: string,
  lastName: string,
  email: string,
  passwordHash: string
): Promise<ResultSetHeader> => {
  const query = "INSERT INTO user (first_name, last_name, email, password) VALUES (?, ?, ?, ?)";
  const [result] = await pool.query<ResultSetHeader>(query, [
    firstName,
    lastName,
    email,
    passwordHash,
  ]);
  return result;
};

export const getUserById = async (id: number): Promise<UserLogin[]> => {
  const query = "SELECT * FROM user WHERE id = ?"; 
  const [rows] = await pool.query<UserLogin[]>(query, [id]);
  return rows;
};

// ========================================================
// 3. FOOD LISTING
// ========================================================

export interface FoodListingRow extends RowDataPacket {
  id: number;
  title: string | null;
  description: string | null;
  dietary_details: string | null;
  quantity: number;
  expiration_date: string | null;
  status: 'available' | 'requested' | 'reserved' | 'completed';
  image_url: string | null;
  created_at: string;
  user_id: number;
}

export const allFoodListings = async (): Promise<FoodListingRow[]> => {
  const query = "SELECT * FROM food_listing WHERE status = 'available' ORDER BY created_at DESC";
  const [rows] = await pool.query<FoodListingRow[]>(query);
  return rows;
};

export const foodListingById = async (id: number): Promise<FoodListingRow[]> => {
  const query = "SELECT * FROM food_listing WHERE id = ?";
  const [rows] = await pool.query<FoodListingRow[]>(query, [id]);
  return rows;
};

export const createFoodListing = async (
  title: string,
  description: string,
  dietaryDetails: string,
  quantity: number,
  expirationDate: string,
  userId: number
): Promise<ResultSetHeader> => {
  const query = `
    INSERT INTO food_listing (title, description, dietary_details, quantity, expiration_date, status, user_id) 
    VALUES (?, ?, ?, ?, ?, 'available', ?)
  `;
  
  const [result] = await pool.query<ResultSetHeader>(query, [
    title,
    description,
    dietaryDetails,
    quantity,
    expirationDate,
    userId
  ]);
  return result;
};