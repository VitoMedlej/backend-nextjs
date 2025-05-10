// GET /api/products/recommended

import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase, getCollection } from "@/app/database/mongodbClient";
import { StatusCodes } from "http-status-codes";

export async function GET(req: NextRequest) {
  const limit = req.nextUrl.searchParams.get("limit") || "12"; // Fix for limit query parameter

  try {
    await connectToDatabase();
    const productsCollection = await getCollection("Products");
    const rawProducts = await productsCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .toArray();

    if (!rawProducts || rawProducts.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No recommended products found.",
          data: null,
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    const result = {
      products: rawProducts.map((product) => ({
        id: product._id.toString(),
        ...product,
      })),
    };

    return NextResponse.json(
      {
        success: true,
        message: "Recommended products fetched successfully.",
        data: result,
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.log('error: ', error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while retrieving recommended products.",
        data: null,
      },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}
