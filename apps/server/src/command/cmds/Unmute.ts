import { Command } from "../Command";
import { Base } from "../../core/Base";
import { Peer } from "../../core/Peer";
import { ROLE } from "@growserver/const";
import { Variant } from "growtopia.js";

export default class Unmute extends Command {
  constructor(
    public base: Base,
    public peer: Peer,
    public text: string,
    public args: string[],
  ) {
    super(base, peer, text, args);
    this.opt = {
      command: ["unmute"],
      description: "Unmute a player.",
      cooldown: 0,
      ratelimit: 1,
      category: "`cModeration",
      usage: "/unmute <growid>",
      example: ["/unmute playername"],
      permission: [ROLE.DEVELOPER],
    };
  }

  public async execute(): Promise<void> {
    if (this.args.length < 1) {
      this.peer.send(
        Variant.from("OnConsoleMessage", "`4Usage: /unmute <growid>``"),
      );
      return;
    }

    await this.base.database.bans.unmute(this.args[0]);
    this.peer.send(
      Variant.from(
        "OnConsoleMessage",
        `\`2Unmuted \`o${this.args[0]}\`2.\`\``,
      ),
    );
  }
}
