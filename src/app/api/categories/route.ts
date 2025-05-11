import { NextResponse, NextRequest } from "next/server";

import { connectToDatabase, getCollection } from '@/database/mongodbClient'; // Your MongoDB client
import { StatusCodes } from 'http-status-codes';

// Handler function for the GET request
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Connect to the database
      await connectToDatabase();

      // Fetch all categories from the "Categories" collection
      const categoriesCollection = await getCollection('Categories');
      const categories = await categoriesCollection.find({}).toArray();

      // If no categories found, send a 404 response
      if (!categories || categories.length === 0) {
        return res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: 'No categories found',
          data: null,
        });
      }

      // Return the categories in the response
      return res.status(StatusCodes.OK).json({
        success: true,
        message: 'Categories fetched successfully',
        data: categories,
      });
    } catch (error) {
      // Log the error and return a 500 response
      console.error('Error fetching categories:', error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error fetching categories',
        data: null,
      });
    }
  } else {
    // If the method is not GET, return a 405 Method Not Allowed response
    return res.status(StatusCodes.METHOD_NOT_ALLOWED).json({
      success: false,
      message: 'Method Not Allowed',
      data: null,
    });
  }
}
