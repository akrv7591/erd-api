import {internalErrorHandler} from "../../../utils/errorHandler";
import {PostRequest} from "../../../types/types";
import {logToApi} from "../../../api/logTo";
import dayjs from "dayjs";
import {createId} from "@paralleldrive/cuid2";
import config from "../../../config/config";
import {TeamInvitationResponse} from "../../../types/team-invitation";

export interface InviteUserBody {
  invitee: string
  teamId: string
  teamName: string
  roleId: string
}

export const inviteUser: PostRequest<{}, InviteUserBody> = async (req, res) => {
  try {
    const {invitee, teamId: organizationId, roleId, teamName} = req.body
    const {sub: inviterId} = req.authorization
    const invitationData = {
      inviterId,
      invitee,
      organizationId,
      expiresAt: dayjs().add(7, "days").toDate().getTime(),
      organizationRoleIds: [
        roleId
      ]
    }

    const invitation = await logToApi.post<TeamInvitationResponse>(`/api/organization-invitations`, invitationData)
      .then(res => res.data)


    try {
      const link = `${config.client.url}/team-invitations/${invitation.id}/join`;
      const unsubscribeLink = `${config.client.url}/unsubscribe`;
      const messagePayload = {
        code: createId(),
        key: "team-invitation",
        link,
        teamName,
        invitee,
        unsubscribeLink
      }
      await logToApi.post(`/api/organization-invitations/${invitation.id}/message`, messagePayload)
      res.sendStatus(204)
    } catch (e) {
      console.error("Failed to send invitation", e)
      return internalErrorHandler(res, e)
    }

  } catch (e) {
    console.error("Failed to create invitation", e)
    return internalErrorHandler(res, e)
  }
}
