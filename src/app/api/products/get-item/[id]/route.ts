// GET /api/products/get-item/[id]

import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { StatusCodes } from "http-status-codes";
import { connectToDatabase, getCollection } from "@/app/database/mongodbClient";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const productId = params.id;

  if (!productId || !ObjectId.isValid(productId)) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid product ID.",
        data: null,
      },
      { status: StatusCodes.BAD_REQUEST }
    );
  }

  try {
    await connectToDatabase();
    const productsCollection = await getCollection("Products");
    const product = await productsCollection.findOne({ _id: new ObjectId(productId) });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found.",
          data: null,
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Product fetched successfully.",
        data: { id: product._id.toString(), ...product },
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while fetching the product.",
        data: null,
      },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}
