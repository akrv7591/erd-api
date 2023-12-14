import express from "express";
import {errorHandler} from "../../../middleware/errorHandler";
import axios from "axios";
import httpStatus from "http-status";
import {Transaction} from "sequelize";
import {erdSequelize} from "../../../sequelize-models/erd-api";
import {User} from "../../../sequelize-models/erd-api/User.model";
import {Account} from "../../../sequelize-models/erd-api/Account.model";
import dayjs from "dayjs";
import {SocialLogin} from "../../../constants/auth";
import handleAuthTokens from "../../../utils/handleAuthTokens";

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
    try {
      const {data} = await googleApi.get<GoogleUserInfo>("/oauth2/v1/userinfo?alt=json")
      transaction = await erdSequelize.transaction()

        // Check if user exists
        let user = await User.findOne({
          where: {
            email: data.email
          }
        })

        // If user doesn't exist create user and continue
        if (!user) {
          user = await User.create({
            email: data.email,
            name: data.name,
            emailVerified: data.verified_email? new Date(): null
          }, { transaction })
        }

        if (!user.emailVerified) {
          user.emailVerified = data.verified_email? new Date(): null
        }

        await Account.upsert({
          userId: user.id,
          type: SocialLogin.GOOGLE,
          provider: SocialLogin.GOOGLE,
          accessToken: oathData.access_token,
          providerAccountId: data.id,
          expiresAt: dayjs().add(oathData.expires_in, 'seconds').toDate(),
          scope: oathData.scope,
          tokenType: oathData.token_type
        }, {
          transaction
        })

        const accessToken = await handleAuthTokens(req, res, user, transaction)

        await transaction.commit()
        return res.json({accessToken});


    } catch (e) {
      await transaction?.rollback()
      console.warn("Google login error\n ", e)
      res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR)
    }

  } catch (e) {
    errorHandler(e, req, res)
    console.warn("Google login error\n ", e)
    res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR)

  }
}
