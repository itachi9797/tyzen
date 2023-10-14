import { NodeOption, Tyzen } from '../Tyzen';
import { NodeDefaults } from '../Constants';
import { mergeDefault } from '../Utils';

export interface ConnectorMethods {
    sendPacket: any;
    getId: any;
}

export const AllowedPackets = [ 'VOICE_STATE_UPDATE', 'VOICE_SERVER_UPDATE' ];

export abstract class Connector {
    protected readonly client: any;
    protected manager: Tyzen|null;
    constructor(client: any) {
        this.client = client;
        this.manager = null;
    }

    public set(manager: Tyzen): Connector {
        this.manager = manager;
        return this;
    }

    protected ready(nodes: NodeOption[]): void {
        this.manager!.id = this.getId();
        for (const node of nodes) this.manager!.addNode(mergeDefault(NodeDefaults, node));
    }

    protected raw(packet: any): void {
        if (!AllowedPackets.includes(packet.t)) return;
        const guildId = packet.d.guild_id;
        const connection = this.manager!.connections.get(guildId);
        if (!connection) return;
        if (packet.t === 'VOICE_SERVER_UPDATE') {
            connection.setServerUpdate(packet.d);
            if (!connection.established) return;
            const player = this.manager!.players.get(guildId);
            if (!player) return;
            player.sendServerUpdate()
                .catch(error => this.manager!.on('error', error));
            return;
        }
        const userId = packet.d.user_id;
        if (userId !== this.manager!.id) return;
        connection.setStateUpdate(packet.d);
    }

    abstract getId(): string;

    abstract sendPacket(shardId: number, payload: any, important: boolean): void;

    abstract listen(nodes: NodeOption[]): void;
}
