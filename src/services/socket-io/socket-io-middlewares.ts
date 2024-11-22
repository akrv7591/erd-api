import {Socket} from "../../types/socket-io";
import {ExtendedError} from "socket.io";
import {isCuid} from "@paralleldrive/cuid2";
import randomcolor from "randomcolor"

/**
 * Define a type for the middleware function.
 */
type MiddleWareFn = (socket: Socket, next: (err?: ExtendedError) => void) => Promise<void>

/**
 * Handle authentication middleware for socket.IO.
 */
const handleAuth: MiddleWareFn = async (socket, next) => {
  // TODO: Add logic to authenticate the user
  next()
}

/**
 * Validate query parameters in the incoming request.
 */
const handleQueryValidation: MiddleWareFn = async (socket, next) => {
  const {roomId, userId} = socket.handshake.query

  /**
   * Initialize an error object if any validation fails.
   */
  let error: ExtendedError | undefined = undefined

  // Validate roomId
  if (!roomId) {
    error = {
      name: "",
      message: "roomId is not available"
    }
  } else if (typeof roomId !== "string") {
    error = {
      name: "",
      message: "roomId should be cuid2 string"
    }
  } else if(!isCuid(roomId)) {
    error = {
      name: "",
      message: "roomId is not valid cuid"
    }
  } else {
    socket.data.roomId = roomId
  }

  // Validate userId
  if (!userId) {
    error = {
      name: "",
      message: "userId is not available"
    }
  } else if (typeof userId !== "string") {
    error = {
      name: "",
      message: "userId should be cuid2 string"
    }
  } else if(!isCuid(userId)) {
    error = {
      name: "",
      message: "userId is not valid cuid"
    }
  } else {
    socket.data.userId = userId
  }

  // Set the id of the socket to its current id.
  socket.data.id = socket.id
  socket.data.color = randomcolor()

  next(error)
}

export const socketIoMiddlewares = {
  handleAuth,
  handleQueryValidation
}
