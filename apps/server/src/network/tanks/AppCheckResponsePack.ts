import { TankPacket } from "growtopia.js";
import { Base } from "../../core/Base";
import { Peer } from "../../core/Peer";
import { World } from "../../core/World";
import logger from "@growserver/logger";

export class AppCheckResponsePack {
  constructor(
    public base: Base,
    public peer: Peer,
    public tank: TankPacket,
    public world: World,
  ) {}

  public async execute() {
    if (this.tank.data?.type === 24) {
      logger.info("Valid APP_CHECK_RESPONSE packet received.");
      if (this.peer.isValid()) {
        logger.info("Peer is valid.");
      } else {
        logger.warn("Peer is invalid. Disconnecting...");
        this.peer.disconnect();
      }
    } else {
      logger.warn("Invalid APP_CHECK_RESPONSE packet received.");
    }
  }
}
