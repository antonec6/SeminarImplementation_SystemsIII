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

export { pool };

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

export const getUserById = async (id: number): Promise<any[]> => {
  const query = `
    SELECT 
      u.*,
      IFNULL(AVG(r.score), 0) AS rating_avg
    FROM user u
    LEFT JOIN rating r ON u.id = r.to_user_id
    WHERE u.id = ?
    GROUP BY u.id
  `;
  const [rows] = await pool.query(query, [id]);
  return rows as any[];
};

export const deleteUser = async (id: number): Promise<ResultSetHeader> => {
  const query = "DELETE FROM user WHERE id = ?";
  const [result] = await pool.query<ResultSetHeader>(query, [id]);
  return result;
};

export const updateUser = async (firstName: string, lastName: string, email: string, userId: number): Promise<any> => {
  const query = `
    UPDATE user 
    SET first_name = ?, last_name = ?, email = ? 
    WHERE id = ?
  `;
  const [result] = await pool.query(query, [firstName, lastName, email, userId]);
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
  const query = `
    SELECT 
      fl.*, 
      u.first_name, 
      u.last_name,
      r.id AS request_id,
      IFNULL(avg_rating.avg_score, 0) AS user_rating_avg
    FROM food_listing fl
    JOIN user u ON fl.user_id = u.id
    LEFT JOIN request r ON fl.id = r.food_listing_id AND r.status != 'rejected'
    LEFT JOIN (
      SELECT to_user_id, AVG(score) AS avg_score 
      FROM rating 
      GROUP BY to_user_id
    ) avg_rating ON fl.user_id = avg_rating.to_user_id
    ORDER BY fl.id DESC
  `;
  const [rows] = await pool.query<FoodListingRow[]>(query);
  return rows;
};

export const getAllFoodListingsWithRequests = async (): Promise<any[]> => {
  const query = `
    SELECT 
      fl.*,
      r.id AS request_id,
      r.user_id AS requester_user_id
    FROM food_listing fl
    LEFT JOIN request r ON fl.id = r.food_listing_id AND r.status != 'rejected'
    ORDER BY fl.created_at DESC
  `;
  
  const [rows] = await pool.query(query);
  return rows as any[];
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
  const deleteRequestsQuery = "DELETE FROM request WHERE food_listing_id = ?";
  await pool.query(deleteRequestsQuery, [listingId]);

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
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  created_at: string;
  user_id: number;
  food_listing_id: number;
  title?: string;      
  image_url?: string;  
}

export const createRequest = async (
  userId: number,
  foodListingId: number
): Promise<ResultSetHeader> => {
  const insertRequestQuery = `
    INSERT INTO request (user_id, food_listing_id, status, created_at) 
    VALUES (?, ?, 'pending', NOW())
  `;
  await pool.query(insertRequestQuery, [userId, foodListingId]);

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
      f.image_url,
      f.status AS food_status,
      f.user_id AS owner_id,
      IF(rat.id IS NOT NULL, 1, 0) AS already_rated
    FROM request r
    INNER JOIN food_listing f ON r.food_listing_id = f.id
    LEFT JOIN rating rat ON r.food_listing_id = rat.food_listing_id AND r.user_id = rat.from_user_id
    ORDER BY r.created_at DESC
  `;
  const [rows] = await pool.query<RequestRow[]>(query);
  return rows;
};

export const acceptRequestTransaction = async (
  requestId: number,
  foodListingId: number
): Promise<void> => {
  await pool.query("UPDATE request SET status = 'accepted' WHERE id = ?", [requestId]);
  await pool.query("UPDATE food_listing SET status = 'reserved' WHERE id = ?", [foodListingId]);
};

export const rejectRequestTransaction = async (
  requestId: number,
  foodListingId: number
): Promise<void> => {
  await pool.query("UPDATE request SET status = 'rejected' WHERE id = ?", [requestId]);
  await pool.query("UPDATE food_listing SET status = 'available' WHERE id = ?", [foodListingId]);
};

export const completeRequestTransaction = async (requestId: number, foodListingId: number): Promise<void> => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query("UPDATE food_listing SET status = 'completed' WHERE id = ?", [foodListingId]);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const getRequestersByListing = async (listingId: number): Promise<any[]> => {
  const query = `
    SELECT DISTINCT m.user_id AS buyer_id, u.first_name, u.last_name
    FROM message m
    JOIN user u ON m.user_id = u.id
    JOIN food_listing fl ON m.food_listing_id = fl.id
    WHERE m.food_listing_id = ? 
      AND m.user_id != fl.user_id 
  `;
  const [rows] = await pool.query(query, [listingId]);
  return rows as any[];
};

// ========================================================
// 5. MESSAGES
// ========================================================

export interface MessageRow extends RowDataPacket {
  id: number;
  content: string;
  sent_at: Date;
  user_id: number;
  food_listing_id: number;
  first_name?: string; 
}

export const getPrivateMessages = async (listingId: number, buyerId: number): Promise<any[]> => {
  const query = `
    SELECT m.*, u.first_name, u.last_name 
    FROM message m
    JOIN user u ON m.user_id = u.id
    JOIN food_listing fl ON m.food_listing_id = fl.id
    WHERE m.food_listing_id = ? 
      AND (m.user_id = ? OR m.user_id = fl.user_id) 
    ORDER BY m.sent_at ASC
  `;
  const [rows] = await pool.query(query, [listingId, buyerId]);
  return rows as any[];
};

export const createMessage = async (content: string, userId: number, listingId: number): Promise<void> => {
  const query = `
    INSERT INTO message (content, user_id, food_listing_id, sent_at) 
    VALUES (?, ?, ?, NOW())
  `;
  await pool.query(query, [content, userId, listingId]);
};

export const getMessagesByListing = async (
  foodListingId: number
): Promise<MessageRow[]> => {
  const query = `
    SELECT 
      m.*, 
      u.first_name, 
      u.last_name
    FROM message m
    JOIN user u ON m.user_id = u.id
    WHERE m.food_listing_id = ?
    ORDER BY m.sent_at ASC
  `;
  const [rows] = await pool.query(query, [foodListingId]);
  return rows as MessageRow[];
};

/* =========================================================
   6. RATINGS
   ========================================================= */

export const createRating = async (
  score: number,
  comment: string | null,
  foodListingId: number,
  fromUserId: number,
  toUserId: number
): Promise<any> => {
  const query = `
    INSERT INTO rating (score, comment, food_listing_id, from_user_id, to_user_id)
    VALUES (?, ?, ?, ?, ?)
  `;
  const [result] = await pool.query(query, [score, comment, foodListingId, fromUserId, toUserId]);
  return result;
};

export const checkAlreadyRated = async (foodListingId: number, fromUserId: number): Promise<boolean> => {
  const query = `SELECT id FROM rating WHERE food_listing_id = ? AND from_user_id = ?`;
  const [rows]: any = await pool.query(query, [foodListingId, fromUserId]);
  return rows.length > 0;
};

export const getReviewsByUserId = async (userId: number): Promise<any[]> => {
  const query = "SELECT score, comment FROM rating WHERE to_user_id = ? ORDER BY id DESC";
  const [rows] = await pool.query(query, [userId]);
  return rows as any[];
};