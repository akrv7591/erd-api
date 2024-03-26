import express from "express";
import {errorHandler, internalErrorHandler} from "../../../middleware/internalErrorHandler";
import axios, {HttpStatusCode} from "axios";
import {Transaction} from "sequelize";
import {erdSequelize} from "../../../sequelize-models/erd-api";
import {User} from "../../../sequelize-models/erd-api/User.model";
import {Account} from "../../../sequelize-models/erd-api/Account.model";
import dayjs from "dayjs";
import handleAuthTokens from "../../../utils/handleAuthTokens";
import {Auth} from "../../../constants/auth";

interface GoogleOauthData {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  authuser: string;
  prompt: string;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

export const google: express.RequestHandler = async (req, res) => {
  const oathData: GoogleOauthData = req.body
  try {
    const googleApi = axios.create({
      baseURL: "https://www.googleapis.com",
      headers: {
        Authorization: `${oathData.token_type} ${oathData.access_token}`
      }
    })


    let transaction: Transaction | null = null
    let googleData: GoogleUserInfo
    try {
      const res = await googleApi.get<GoogleUserInfo>("/oauth2/v1/userinfo?alt=json")
      googleData = res.data
    } catch (e) {
      return errorHandler(req, res, HttpStatusCode.Unauthorized, Auth.ApiErrors.GOOGLE_LOGIN_UNAUTHORIZED)
    }
    transaction = await erdSequelize.transaction()

    // Check if user exists
    let user = await User.findOne({
      where: {
        email: googleData.email
      }
    })

    // If user doesn't exist create user and continue
    if (!user) {
      user = await User.create({
        email: googleData.email,
        name: googleData.name,
        emailVerified: new Date(),
        isPasswordSet: false,
      }, {transaction})
    }

    if (!user.emailVerified) {
      user.emailVerified = new Date()
    }

    if (!user.name) {
      user.name = googleData.name
    }

    await Account.upsert({
      userId: user.id,
      type: Auth.SocialLogins.GOOGLE,
      provider: Auth.SocialLogins.GOOGLE,
      accessToken: oathData.access_token,
      providerAccountId: googleData.id,
      expiresAt: dayjs().add(oathData.expires_in, 'seconds').toDate(),
      scope: oathData.scope,
      tokenType: oathData.token_type
    }, {
      transaction
    })

    await user.save({transaction})

    const accessToken = await handleAuthTokens(req, res, user, transaction)

    await transaction.commit()
    return res.json({accessToken});

  } catch (e) {
    internalErrorHandler(e, req, res)
    console.warn("Google login error\n ", e)
  }
}
