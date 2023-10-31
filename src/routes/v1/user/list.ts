import express from "express";
import httpStatus from 'http-status'
import prisma from "../../../config/prisma";

const router = express.Router()

router.get("", async (_, res) => {
  try {
    const data = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true
      }
    })

    res.json(data)
  } catch (e) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR);
  }
})

export default router
