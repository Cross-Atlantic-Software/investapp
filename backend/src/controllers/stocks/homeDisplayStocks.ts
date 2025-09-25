import { Request, Response } from "express";
import { db } from "../../utils/database";
import { Op } from "sequelize";

// Get stocks that are set to display on home page
export const getHomeDisplayStocks = async (req: Request, res: Response) => {
  try {
    console.log("Fetching home display stocks...");
    
    const stocks = await db.Product.findAll({
      where: {
        homeDisplay: 'yes'
      },
      order: [['createdAt', 'DESC']]
    });

    console.log(`Found ${stocks.length} stocks with homeDisplay='yes'`);

    return res.status(200).json({
      success: true,
      data: {
        stocks,
        totalCount: stocks.length
      }
    });
  } catch (error) {
    console.error("Error fetching home display stocks:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error details:", errorMessage);
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + errorMessage
    });
  }
};
