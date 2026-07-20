import { Command } from "../Command";
import { Base } from "../../core/Base";
import { Peer } from "../../core/Peer";
import { ROLE } from "@growserver/const";
import { Variant } from "growtopia.js";

export default class Ban extends Command {
  constructor(
    public base: Base,
    public peer: Peer,
    public text: string,
    public args: string[],
  ) {
    super(base, peer, text, args);
    this.opt = {
      command: ["ban"],
      description: "Ban a player from the server.",
      cooldown: 0,
      ratelimit: 1,
      category: "`cModeration",
      usage: "/ban <growid> [duration_hours] [reason]",
      example: ["/ban playername", "/ban playername 24 spamming"],
      permission: [ROLE.DEVELOPER],
    };
  }

  public async execute(): Promise<void> {
    if (this.args.length < 1) {
      this.peer.send(
        Variant.from(
          "OnConsoleMessage",
          "`4Usage: /ban <growid> [duration_hours] [reason]``",
        ),
      );
      return;
    }

    const targetName = this.args[0];
    let durationHours = 0;
    let reasonIdx = 1;

    if (this.args.length > 1 && !isNaN(Number(this.args[1]))) {
      durationHours = parseInt(this.args[1]);
      reasonIdx = 2;
    }

    const reason = this.args.slice(reasonIdx).join(" ") || "Banned by moderator";

    await this.base.database.bans.ban(
      targetName,
      reason,
      this.peer.data.name,
      durationHours > 0 ? durationHours * 3600 : undefined,
    );

    const targetEntry = this.base.cache.peers.find(
      (p: any) => p.name?.toLowerCase() === targetName.toLowerCase(),
    );
    if (targetEntry) {
      const targetPeer = new Peer(this.base, targetEntry.netID);
      targetPeer.send(
        Variant.from(
          "OnConsoleMessage",
          `\`4You have been banned: ${reason}\`\``,
        ),
      );
      targetPeer.disconnect();
    }

    const durationStr =
      durationHours > 0 ? ` for ${durationHours}h` : " permanently";
    this.peer.send(
      Variant.from(
        "OnConsoleMessage",
        `\`2Banned \`o${targetName}\`2${durationStr}. Reason: ${reason}\`\``,
      ),
    );
  }
}
