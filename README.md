## Shoukaku

> A stable and updated wrapper around Lavalink

> Tyzen

### Features

✅ Stable

✅ Documented

✅ Updated

✅ Extendable

✅ ESM & CommonJS supported

✅ Very cute (Very Important)

### Supported Libraries

Refer to [/src/connectors](https://github.comsikey-dev/tyzen/tree/master/src/connectors) for list of supported libraries + how to support other libraries

### Installation

*   Stable (3.x.x) | Needs Lavalink Versions: `"3.5.x" < "3.9.x" >`

> `npm install tyzen`

*   Dev (4.0.0-dev) | Needs Lavalink Versions: `"4.x.x <"`

> `npm install https://github.com/sikey-dev/tyzen.git`

> Lavalink v4 support is currently deployed on master branch, do `npm install https://github.com/sikey-dev/tyzen.git`

> Dev versions are not guaranteed to stay the same api wise, and even with last known stable, I won't say it's 100% stable

### Small code snippet examples

> Initializing the library (Using Connector Discord.JS)
```js
const { Client } = require('discord.js');
const { Tyzen, Connectors } = require('tyzen');
const Nodes = [{
    name: 'sikku', // example
    url: 'sikku:890', // example
    auth: 'sikku202838' // example
}];
const client = new Client();
const tyzen = new Tyzen(new Connectors.DiscordJS(client), Nodes);
// ALWAYS handle error, logging it will do
tyzen.on('error', (_, error) => console.error(error));
client.login('token');
// If you want tyzen to be available on client, then bind it to it, here is one example of it
client.tyzen = tyzen;
```

> Never initialize Shoukaku like this, or else she will never initialize, start tyzen before you call `client.login()`
```js
// NEVER DO THIS, OR TYZEN WILL NEVER INITIALIZE
client.on('ready', () => {
    client.tyzen = new Tyzen(new Connectors.DiscordJS(client), Nodes);
});
```

> Join a voice channel, search for a track, play the track, then disconnect after 30 seconds
```js
const player = await tyzen.joinVoiceChannel({
    guildId: 'your_guild_id',
    channelId: 'your_channel_id',
    shardId: 0 // if unsharded it will always be zero (depending on your library implementation)
});
// player is created, now search for a track
const result = await player.node.rest.resolve('scsearch:snowhalation');
if (!result?.tracks.length) return;
const metadata = result.tracks.shift();
// play the searched track
await player.playTrack({ track: metadata.encoded });
// disconnect after 30 seconds
setTimeout(() => tyzen.leaveVoiceChannel(player.guildId), 30000).unref();
```

> Playing a track and changing a playback option (in this example, volume)
```js
await player.playTrack({ track: metadata.encoded });
await player.setGlobalVolume(50);
```

> Updating the whole player if you don\'t want to use my helper functions
```js
await player.update({ ...playerOptions });
```

> Setting a custom get node ideal function
```js
const player = await tyzen.joinVoiceChannel({
    guildId: 'your_guild_id',
    channelId: 'your_channel_id',
    shardId: 0,
    getNode: (nodes, connection) => { 
        nodes = [ ...nodes.values() ];
        return nodes.find(node => node.group === connection.region);
    }
});
```

### Updating from V3 -> V4 (notable changes)

> The way of joining and leaving voice channels is now different
```js
const { Client } = require('discord.js');
const { Tyzen, Connectors } = require('tyzen');
const Nodes = [{
    name: 'sikku', // example
    url: 'sikku:890', // example
    auth: 'sikku202838' // example
}];
const client = new Client();
const tyzen = new Tyzen(new Connectors.DiscordJS(client), Nodes);
tyzen.on('error', (_, error) => console.error(error));
client.login('token');
client.once('ready', async () => {
    // get a node with least load to resolve a track
    const node = tyzen.getIdealNode();
    const result = await node.rest.resolve('scsearch:snowhalation');
    if (!result?.tracks.length) return;
    // we now have a track metadata, we can use this to play tracks
    const metadata = result.tracks.shift();
    // you now join a voice channel by querying the main tyzen class, not on the node anymore
    const player = await tyzen.joinVoiceChannel({
        guildId: 'your_guild_id',
        channelId: 'your_channel_id',
        shardId: 0 // if unsharded it will always be zero (depending on your library implementation)
    });
    // if you want you can also use the player.node property after it connects to resolve tracks
    const result_2 = await player.node.rest.resolve('scsearch:snowhalation');
    console.log(result_2.tracks.shift());
    // now we can play the track
    await player.playTrack({ track: metadata.encoded });
    setTimeout(async () => {
        // simulate a timeout event, after specific amount of time, we leave the voice channel
        // you now destroy players / leave voice channels by calling leaveVoiceChannel in main shoukaku class
        await tyzen.leaveVoiceChannel(player.guildId);
    }, 30000);
})
```

> Usual player methods now return promises
```js
await player.playTrack(...data);
await player.stopTrack();
```

> There are 2 kinds of volumes you can set, global and filter
```js
// global volume accepts 0-1000 as it's values
await player.setGlobalVolume(100);
// to check the current global volume
console.log(player.volume);
// filter volume accepts 0.0-5.0 as it's values
await player.setFilterVolume(1.0);
// to check the current filter volume (filters.volume can be undefined)
console.log(player.filters.volume)
```

> There are other internal changes like 
```js
// new variable in tyzen class, which handles the "connection data" of discord only
console.log(tyzen.connections);
// getNode() is removed in favor of joinVoiceChannel custom get node function, example:
const player = await tyzen.joinVoiceChannel({
    guildId: 'your_guild_id',
    channelId: 'your_channel_id',
    shardId: 0,
    getNode: (nodes, connection) => {
        nodes = [ ...nodes.values() ];
        return nodes.find(node => node.group === connection.region);
    }
});
// you can still get the least loaded node to resolve tracks via getIdealNode();
console.log(tyzen.getIdealNode());
// and other changes I'm not able to document(?);
```