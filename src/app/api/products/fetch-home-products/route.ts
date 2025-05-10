import { connectToDatabase, getCollection } from "@/app/database/mongodbClient";
import { StatusCodes } from "http-status-codes";
import { NextRequest, NextResponse } from "next/server";

export async function fetchHomeProducts(req: NextRequest) {
  try {
    // Parse the request body as JSON
    const { filterTypes }: { filterTypes: { filterBy: string; value: string | null }[] } = await req.json();

    if (!filterTypes || filterTypes.length === 0) {
      console.error('No sections provided');
      return NextResponse.json(
        { success: false, message: "No sections provided", data: null },
        { status: StatusCodes.BAD_REQUEST }
      );
    }
    await connectToDatabase();
    const productsCollection = await getCollection("Products");
    const results: any[] = [];

    for (const section of filterTypes) {
      let query: any = {};

      switch (section.filterBy) {
        case 'new-arrivals':
          query = {}; // New arrivals filter (you can customize it if needed)
          break;
        case 'category':
          if (section.value) {
            query = { category: section.value }; // Category filter
          }
          break;
        default:
          break;
      }

      const rawProducts = await productsCollection.find(query).sort({ _id: -1 }).toArray();

      if (rawProducts.length > 0) {
        results.push({
          SectionType: section.filterBy,
          data: rawProducts.map((product) => ({
            id: product._id.toString(),
            ...product,
          })),
          _id: `section-${results.length + 1}`,
          title: section.filterBy === 'new-arrivals' ? 'New Arrivals' : section.value,
        });
      }
    }

    if (!results.length) {
      return NextResponse.json(
        { success: false, message: "No products found", data: null },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    return NextResponse.json(
      { success: true, message: "Products found", data: results },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error(`Received body: ${JSON.stringify(req.body)}`);
    const errorMessage = `Error fetching products: ${(error as Error).message}`;
    console.error(errorMessage);
    return NextResponse.json(
      { success: false, message: "An error occurred while retrieving home products.", data: null },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}
