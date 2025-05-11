// 📄 File: src/app/api/categories/route.ts

import { NextResponse, NextRequest } from "next/server";
import { connectToDatabase, getCollection } from "@/app/database/mongodbClient";
import { StatusCodes } from "http-status-codes";

export async function GET(_req: NextRequest) {
  try {
    await connectToDatabase();
    const categoriesCollection = await getCollection("Categories");

    const categories = await categoriesCollection.find({}).toArray();

    return NextResponse.json(
      { success: true, message: "Categories fetched successfully.", data: categories },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch categories.", data: null },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}
