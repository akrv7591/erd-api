import {internalErrorHandler} from "../../../utils/errorHandler";
import {ListRequest} from "../../../types/types";
import {logToApi} from "../../../api/logTo";
import {TeamInvitationResponse} from "../../../types/team-invitation";
import {ParsedQs} from "qs";
import {TEAM_INVITATION} from "../../../constants/team-invitation";

export interface InvitationListQueries extends ParsedQs{
  teamId: string
}

export const invitationList: ListRequest<{}, {}, InvitationListQueries> = async (req, res) => {
  try {
    const {teamId: organizationId} = req.query
    const invitations = await logToApi.get<TeamInvitationResponse[]>(`/api/organization-invitations`, {
      params: {
        organizationId
      }
    })
      .then(res => res.data)

    const allowedStatuses = [TEAM_INVITATION.STATUS.PENDING, TEAM_INVITATION.STATUS.EXPIRED]

    res.json(invitations.filter(invitation => allowedStatuses.includes(invitation.status)))
  } catch (e) {
    console.error("Failed to fetch invitations", e)
    return internalErrorHandler(res, e)
  }

}
