import {Socket} from "../../types/socket-io";
import {ExtendedError} from "socket.io";
import {isCuid} from "@paralleldrive/cuid2";

type MiddleWareFn = (socket: Socket, next: (err?: ExtendedError) => void) => Promise<void>

const handleAuth: MiddleWareFn = async (socket, next) => {
  next()
}

const handleQueryValidation: MiddleWareFn = async (socket, next) => {
  const {roomId, peerId, userId} = socket.handshake.query
  let error: ExtendedError | undefined = undefined

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

  if (!peerId) {
    error = {
      name: "",
      message: "peerId is not available"
    }
  } else if (typeof peerId !== "string") {
    error = {
      name: "",
      message: "peerId should be cuid2 string"
    }
  } else if(!isCuid(peerId)) {
    error = {
      name: "",
      message: "peerId is not valid cuid"
    }
  } else {
    socket.data.peerId = peerId
  }

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

  socket.data.socketId = socket.id

  next(error)
}

export const socketIoMiddlewares = {
  handleAuth,
  handleQueryValidation
}
