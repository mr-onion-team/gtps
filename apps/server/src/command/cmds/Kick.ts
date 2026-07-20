import { Command } from "../Command";
import { Base } from "../../core/Base";
import { Peer } from "../../core/Peer";
import { ROLE } from "@growserver/const";
import { Variant } from "growtopia.js";

export default class Kick extends Command {
  constructor(
    public base: Base,
    public peer: Peer,
    public text: string,
    public args: string[],
  ) {
    super(base, peer, text, args);
    this.opt = {
      command: ["kick"],
      description: "Kick a player from the server.",
      cooldown: 0,
      ratelimit: 1,
      category: "`cModeration",
      usage: "/kick <growid> [reason]",
      example: ["/kick playername", "/kick playername spamming"],
      permission: [ROLE.DEVELOPER],
    };
  }

  public async execute(): Promise<void> {
    if (this.args.length < 1) {
      this.peer.send(
        Variant.from("OnConsoleMessage", "`4Usage: /kick <growid> [reason]``"),
      );
      return;
    }

    const targetName = this.args[0];
    const reason = this.args.slice(1).join(" ") || "No reason specified";

    const targetEntry = this.base.cache.peers.find(
      (p: any) => p.name?.toLowerCase() === targetName.toLowerCase(),
    );

    if (!targetEntry) {
      this.peer.send(
        Variant.from("OnConsoleMessage", "`4Player not found or offline.``"),
      );
      return;
    }

    const targetPeer = new Peer(this.base, targetEntry.netID);
    targetPeer.send(
      Variant.from("OnConsoleMessage", `\`4You have been kicked: ${reason}\`\``),
    );
    targetPeer.disconnect();

    this.peer.send(
      Variant.from(
        "OnConsoleMessage",
        `\`2Kicked \`o${targetName}\`2. Reason: ${reason}\`\``,
      ),
    );
  }
}
