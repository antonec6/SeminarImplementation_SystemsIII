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

export const deleteUser = async (id: number): Promise<ResultSetHeader> => {
  const query = "DELETE FROM user WHERE id = ?";
  const [result] = await pool.query<ResultSetHeader>(query, [id]);
  return result;
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
  // CRITICAL JOIN: We fetch r.id as 'request_id' so the owner knows exactly 
  // which request record to accept or reject from the MyFood interface
  const query = `
    SELECT 
      fl.*, 
      u.first_name, 
      u.last_name,
      r.id AS request_id
    FROM food_listing fl
    JOIN user u ON fl.user_id = u.id
    LEFT JOIN request r ON fl.id = r.food_listing_id AND r.status = 'pending'
    ORDER BY fl.id DESC
  `;
  const [rows] = await pool.query(query);
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
  imageUrl: string,
  userId: number
): Promise<ResultSetHeader> => {
  const query = `
    INSERT INTO food_listing (title, description, dietary_details, quantity, expiration_date, status, image_url, user_id) 
    VALUES (?, ?, ?, ?, ?, 'available',?, ?)
  `;
  
  const [result] = await pool.query<ResultSetHeader>(query, [
    title,
    description,
    dietaryDetails,
    quantity,
    expirationDate,
    imageUrl,
    userId
  ]);
  return result;

};

export const deleteFoodListing = async (
  listingId: number
): Promise<ResultSetHeader> => {
  // 1. First, delete any dependent request entries linked to this specific listing
  const deleteRequestsQuery = "DELETE FROM request WHERE food_listing_id = ?";
  await pool.query(deleteRequestsQuery, [listingId]);

  // 2. Now it is completely safe to remove the main food listing without violating integrity constraints
  const deleteListingQuery = "DELETE FROM food_listing WHERE id = ?";
  const [result] = await pool.query<ResultSetHeader>(deleteListingQuery, [listingId]);
  
  return result;
};

export const updateFoodListing = async (
  id: number,
  title: string,
  description: string,
  dietaryDetails: string,
  quantity: number,
  expirationDate: string,
  imageUrl: string
): Promise<ResultSetHeader> => {
  const query = `
    UPDATE food_listing 
    SET title = ?, description = ?, dietary_details = ?, quantity = ?, expiration_date = ?, image_url = ?
    WHERE id = ?
  `;
  
  const [result] = await pool.query<ResultSetHeader>(query, [
    title,
    description,
    dietaryDetails,
    quantity,
    expirationDate,
    imageUrl,
    id
  ]);
  return result;
};

// ========================================================
// 4. REQUESTS
// ========================================================

export interface RequestRow extends RowDataPacket {
  id: number;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  user_id: number;
  food_listing_id: number;
  title?: string;      // Dynamic property injected via INNER JOIN
  image_url?: string;  // Dynamic property injected via INNER JOIN
}

export const createRequest = async (
  userId: number,
  foodListingId: number
): Promise<ResultSetHeader> => {
  // First, we insert the request entry as 'pending'
  const insertRequestQuery = `
    INSERT INTO request (user_id, food_listing_id, status, created_at) 
    VALUES (?, ?, 'pending', NOW())
  `;
  await pool.query(insertRequestQuery, [userId, foodListingId]);

  // CRITICAL STEP: Automatically update the food listing status to 'requested'
  // This instantly hides it from FoodNearMe based on the client filter
  const updateListingQuery = `
    UPDATE food_listing 
    SET status = 'requested' 
    WHERE id = ?
  `;
  const [result] = await pool.query<ResultSetHeader>(updateListingQuery, [foodListingId]);
  return result;
};

export const allRequestsWithFoodDetails = async (): Promise<RequestRow[]> => {
  const query = `
    SELECT 
      r.id, 
      r.status, 
      r.created_at, 
      r.user_id, 
      r.food_listing_id,
      f.title,
      f.image_url
    FROM request r
    INNER JOIN food_listing f ON r.food_listing_id = f.id
    ORDER BY r.created_at DESC
  `;
  const [rows] = await pool.query<RequestRow[]>(query);
  return rows;
};

export const acceptRequestTransaction = async (
  requestId: number,
  foodListingId: number
): Promise<void> => {
  // 1. Update the status of the request inside the intermediate table
  await pool.query("UPDATE request SET status = 'accepted' WHERE id = ?", [requestId]);
  
  // 2. Lock the food listing by changing its status parameter to 'reserved'
  await pool.query("UPDATE food_listing SET status = 'reserved' WHERE id = ?", [foodListingId]);
};

export const rejectRequestTransaction = async (
  requestId: number,
  foodListingId: number
): Promise<void> => {
  // 1. Mark request status as rejected inside the database table
  await pool.query("UPDATE request SET status = 'rejected' WHERE id = ?", [requestId]);
  
  // 2. Set the listing back to 'available' so other users can see and claim it
  await pool.query("UPDATE food_listing SET status = 'available' WHERE id = ?", [foodListingId]);
};