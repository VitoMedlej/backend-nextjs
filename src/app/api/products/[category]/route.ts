// FILE: app/api/products/[category]/route.ts
// TYPE: API route

import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase, getCollection } from "@/app/database/mongodbClient";
import { StatusCodes } from "http-status-codes";
import { handleFilters } from "@/common/utils/handleFilters";
import { handleSortQuery } from "@/common/utils/handleSortQuery";

export async function GET(req: NextRequest, { params }: { params: { category: string } }) {
  try {
    const category = decodeURIComponent(params.category || "");
    const { search, subcategory, skip = 0, limit = 12, sort, size, color } = await req.json();
    await connectToDatabase();
    const productsCollection = await getCollection("Products");
    let query: any = {};

    if (search && `${search}`.trim().length > 2) {
      query.$text = { $search: decodeURIComponent(search) };
    }

    switch (category) {
      case "new-arrivals":
        query.createdAt = { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
        break;
      case "best-sellers":
        query.bestSeller = true;
        break;
      case "all":
      case "collection":
      case "products":
      case "collections":
        break;
      default:
        query.category = category;
    }

    if (subcategory && subcategory !== "undefined") {
      query.subcategory = subcategory;
    }

    if (sort === "onSale") {
      query.onSale = true;
    }

    query = handleFilters(query, { size, color });
    const sortQuery = handleSortQuery({ sort, size, color });
    query.disabled = { $ne: true };

    const count = await productsCollection.countDocuments(query);
    const raw = await productsCollection
      .find(query)
      .sort(sortQuery)
      .skip(Number(skip))
      .limit(Number(limit))
      .toArray();

    if (!raw || raw.length === 0) {
      return NextResponse.json(
        { success: false, message: "No products found", data: null },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    const result = {
      products: raw.map(p => ({ id: p._id.toString(), ...p })),
      title:
        category === "products" || category === "collections" ? "Latest Products" :
        category === "new-arrivals" ? "New Arrivals" :
        category === "best-sellers" ? "Best Sellers" :
        category || "All Products",
      count,
    };

    return NextResponse.json(
      { success: true, message: "Products fetched successfully", data: result },
      { status: StatusCodes.OK }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "Error retrieving products", data: null },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}
