import {PostRequest} from "../../../types/types";
import {logToApi} from "../../../api/logTo";
import {TeamInvitationResponse} from "../../../types/team-invitation";
import {axiosErrorHandler} from "../../../utils/errorHandler";
import {TeamResponse} from "../../../types/team";

export interface InvitationJoinParams {
  teamInvitationId: string
}

export const invitationJoin: PostRequest<InvitationJoinParams> = async (req, res) => {
  const {teamInvitationId} = req.params

  try {
    const teamInvitation = await logToApi.put<TeamInvitationResponse>(`/api/organization-invitations/${teamInvitationId}/status`, {
      acceptedUserId: req.authorization.sub,
      status: "Accepted"
    }).then(res => res.data)

    const team = await logToApi.get<TeamResponse>(`/api/organizations/${teamInvitation.organizationId}`)
      .then(res => res.data)

    res.json(team)

  } catch (error) {
    axiosErrorHandler(res, error)
  }
}
