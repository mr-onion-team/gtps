import { Command } from "../Command";
import { Base } from "../../core/Base";
import { Peer } from "../../core/Peer";
import { ROLE } from "@growserver/const";
import { Variant } from "growtopia.js";

export default class Unban extends Command {
  constructor(
    public base: Base,
    public peer: Peer,
    public text: string,
    public args: string[],
  ) {
    super(base, peer, text, args);
    this.opt = {
      command: ["unban"],
      description: "Unban a player.",
      cooldown: 0,
      ratelimit: 1,
      category: "`cModeration",
      usage: "/unban <growid>",
      example: ["/unban playername"],
      permission: [ROLE.DEVELOPER],
    };
  }

  public async execute(): Promise<void> {
    if (this.args.length < 1) {
      this.peer.send(
        Variant.from("OnConsoleMessage", "`4Usage: /unban <growid>``"),
      );
      return;
    }

    await this.base.database.bans.unban(this.args[0]);
    this.peer.send(
      Variant.from(
        "OnConsoleMessage",
        `\`2Unbanned \`o${this.args[0]}\`2.\`\``,
      ),
    );
  }
}
