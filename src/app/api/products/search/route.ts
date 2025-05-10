// FILE: app/api/products/search/route.ts
// HANDLES: GET /api/products/search

import { NextRequest, NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { connectToDatabase, getCollection } from "@/app/database/mongodbClient";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const searchQuery = searchParams.get("q") || "";

  if (searchQuery.length < 2) {
    return NextResponse.json(
      { message: "Query must be at least 2 characters long.", data: [] },
      { status: StatusCodes.BAD_REQUEST }
    );
  }

  try {
    await connectToDatabase();
    const productsCollection = await getCollection("Products");

    const results = await productsCollection
      .find({
        $or: [
          { title: { $regex: searchQuery, $options: "i" } },
          { tags: { $regex: searchQuery, $options: "i" } },
          { description: { $regex: searchQuery, $options: "i" } },
        ],
      })
      .limit(4)
      .toArray();

    return NextResponse.json(
      {
        message: "Products found",
        data: results.map((p: any) => ({ id: p._id.toString(), ...p })),
      },
      { status: StatusCodes.OK }
    );
  } catch (error: any) {
    console.error(`Error searching products: ${error.message}`);
    return NextResponse.json(
      {
        message: "An error occurred while searching for products.",
        data: [],
      },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}
