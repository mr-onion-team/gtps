import { Command } from "../Command";
import { Base } from "../../core/Base";
import { Peer } from "../../core/Peer";
import { ROLE } from "@growserver/const";
import { Variant } from "growtopia.js";

export default class Mute extends Command {
  constructor(
    public base: Base,
    public peer: Peer,
    public text: string,
    public args: string[],
  ) {
    super(base, peer, text, args);
    this.opt = {
      command: ["mute"],
      description: "Mute a player.",
      cooldown: 0,
      ratelimit: 1,
      category: "`cModeration",
      usage: "/mute <growid> [duration_minutes] [reason]",
      example: ["/mute playername", "/mute playername 30 spamming"],
      permission: [ROLE.DEVELOPER],
    };
  }

  public async execute(): Promise<void> {
    if (this.args.length < 1) {
      this.peer.send(
        Variant.from(
          "OnConsoleMessage",
          "`4Usage: /mute <growid> [duration_minutes] [reason]``",
        ),
      );
      return;
    }

    const targetName = this.args[0];
    let durationMinutes = 0;
    let reasonIdx = 1;

    if (this.args.length > 1 && !isNaN(Number(this.args[1]))) {
      durationMinutes = parseInt(this.args[1]);
      reasonIdx = 2;
    }

    const reason = this.args.slice(reasonIdx).join(" ") || "Muted by moderator";

    await this.base.database.bans.mute(
      targetName,
      reason,
      this.peer.data.name,
      durationMinutes > 0 ? durationMinutes * 60 : undefined,
    );

    const targetEntry = this.base.cache.peers.find(
      (p: any) => p.name?.toLowerCase() === targetName.toLowerCase(),
    );
    if (targetEntry) {
      const targetPeer = new Peer(this.base, targetEntry.netID);
      targetPeer.send(
        Variant.from(
          "OnConsoleMessage",
          `\`4You have been muted: ${reason}\`\``,
        ),
      );
    }

    const durationStr =
      durationMinutes > 0 ? ` for ${durationMinutes}m` : " permanently";
    this.peer.send(
      Variant.from(
        "OnConsoleMessage",
        `\`2Muted \`o${targetName}\`2${durationStr}. Reason: ${reason}\`\``,
      ),
    );
  }
}
