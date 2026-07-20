import { Tank, TankPacket, Variant } from "growtopia.js";
import { Base } from "../../core/Base";
import { Peer } from "../../core/Peer";
import { World } from "../../core/World";
import { TileData } from "@growserver/types";
import {
  ActionTypes,
  BlockFlags,
  LOCKS,
  ROLE,
  TankTypes,
} from "@growserver/const";
import { ItemDefinition } from "grow-items";
import { tileFrom } from "../../world/tiles";

export class TileChangeReq {
  private pos: number;
  private block: TileData;
  private itemMeta: ItemDefinition;
  private unbreakableBlocks = [8, 6, 3760, 7372];

  constructor(
    public base: Base,
    public peer: Peer,
    public tank: TankPacket,
    public world: World,
  ) {
    this.pos =
      (this.tank.data?.xPunch as number) +
      (this.tank.data?.yPunch as number) * this.world.data.width;
    this.block = this.world.data.blocks[this.pos];
    this.itemMeta = this.base.items.metadata.items.get(
      (this.block.fg || this.block.bg).toString(),
    )!;
  }

  public async execute() {
    if (
      !this.tank.data ||
      this.tank.data.xPunch == undefined ||
      this.tank.data.yPunch == undefined ||
      this.tank.data.info == undefined
    )
      return;
    this.tank.data!.netID = this.peer.data?.netID;

    const tileData =
      this.world.data.blocks[
        this.tank.data.xPunch + this.tank.data.yPunch * this.world.data.width
      ];

    if (this.tank.data?.info === 18) {
      await tileFrom(this.base, this.world, tileData).onPunch(this.peer);
    } else if (this.tank.data?.info === 32) {
      await tileFrom(this.base, this.world, tileData).onWrench(this.peer);
    } else {
      const itemMeta = this.base.items.metadata.items.get(
        this.tank.data?.info.toString(),
      );

      if (!itemMeta) return;

      if (itemMeta.type == ActionTypes.BACKGROUND) {
        await tileFrom(this.base, this.world, tileData).onPlaceBackground(
          this.peer,
          itemMeta,
        );
      } else if (tileData.fg == 0) {
        await tileFrom(
          this.base,
          this.world,
          tileData,
          itemMeta.type!,
        ).onPlaceForeground(this.peer, itemMeta);
      } else {
        await tileFrom(this.base, this.world, tileData).onItemPlace(
          this.peer,
          itemMeta,
        );
      }
    }
    await this.world.saveToCache();
    await this.world.saveToDatabase();
  }
}
