import { MongoClient, Db, WithId, Admin } from "mongodb";
import { User } from "../models/userModel";
import { Product } from "../models/productModel";
import { OrderData } from "../models/orderModel";


type Models = {
  Products: Product;
  Users: User;
  Admins: Admin;
  Orders: OrderData;
  Categories : Category;
};

type Doc<T> = WithId<Document> & Partial<Record<keyof T, any>>;

let client: MongoClient | null = null;
let database: Db | null = null;

export async function connectToDatabase(): Promise<Db> {
  if (!client) {
    const uri = process.env.MONGODB_CONNECTION!;
    console.time("DB-start");
    client = new MongoClient(uri, { maxPoolSize: 100, minPoolSize: 1 });
    await client.connect();
    database = client.db(process.env.MONGO_DB_NAME);
    console.timeEnd("DB-start");
  }
  return database!;
}

export function getCollection<K extends keyof Models>(name: K) {
  if (!database) throw new Error("DB not connected");
  return database.collection<Doc<Models[K]>>(name);
}
