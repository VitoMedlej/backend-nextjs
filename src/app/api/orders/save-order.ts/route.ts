// File: src/app/api/orders/save/route.ts

import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { OrderData } from "@/common/models/orderModel";
import { getCollection, connectToDatabase } from "@/app/database/mongodbClient";
import { StatusCodes } from "http-status-codes";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const order: OrderData = body;

    if (!order || !order.customerName || !order.items || order.items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Missing required fields.", data: null },
        { status: StatusCodes.BAD_REQUEST }
      );
    }

    const ordersCollection = await getCollection("Orders");

    const documentToInsert = {
      ...order,
      _id: new ObjectId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    delete (documentToInsert as any).id;

    const result = await ordersCollection.insertOne(documentToInsert);

    if (!result.acknowledged) {
      return NextResponse.json(
        { success: false, message: "Failed to save the order.", data: null },
        { status: StatusCodes.INTERNAL_SERVER_ERROR }
      );
    }

    const savedOrder: OrderData = {
      ...order,
      id: documentToInsert._id.toString(),
    };

    return NextResponse.json(
      { success: true, message: "Order saved successfully.", data: savedOrder },
      { status: StatusCodes.CREATED }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while saving the order.",
        data: null,
      },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}
