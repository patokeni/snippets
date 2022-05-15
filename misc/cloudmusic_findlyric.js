const cm = require('NeteaseCloudMusicApi')
const readline = require('readline-sync')
const path = require('node:path')
const os = require('node:os')
const fs = require('node:fs')

const listId = **your list here**;
const from = **from**;
const to = **to**;
const lyricDir = **save dir**;

var cookie = undefined;

async function login() {
    var key = (await cm.login_qr_key({})).body.data.unikey;
    var qrimg = (await cm.login_qr_create({key, qrimg: true})).body.data.qrimg;
    var qrcodeFile = path.join(os.tmpdir(), key + "-ncm.png");
    fs.writeFileSync(qrcodeFile, Buffer.from(qrimg.substring(22), "base64"));

    console.log("QR code generated", qrcodeFile)
    while (true) {
        readline.keyInPause("Press any key after scanned the QR code.");
        var result = await cm.login_qr_check({key});
        console.log(result.body);
        switch (result.body.code) {
            case 800:
                console.error("Code expired, reloading.");
                return await login();
            case 801:
                console.error("Code not scanned.");
                break;
            case 803:
                console.log("Success.");
                cookie = result.body.cookie;
                return cookie;
        }
    }
}

(async () => {
    try {
        await login();
        // cookie = ""; // or cookie from last login
        
        if (!cookie) {
            console.error("Failed to login.");
            return;
        }

        var list = (await cm.playlist_track_all({
            id: listId,
            offset: from,
            limit: to - from,
            cookie
        })).body.songs;

        var actualTo = Math.min(to, list.length);

        if (actualTo != to) {
            console.error("'to' is truncated to", actualTo);
        }

        for (var i = from; i < actualTo; i++) {
            var song = list[i];
            var targetName = "";
            var artists = [];
            song.ar.forEach(artist => {
                artists.push(artist.name);
            });

            targetName += artists.join(",");
            targetName += " - ";
            targetName += song.name;
            var name = targetName + ".lrc";

            var lyric = (await cm.lyric({id: song.id})).body;

            if (lyric.code != 200) {
                console.error("Unable to fetch lyric for", targetName, lyric);
                continue;
            }

            try {
                fs.writeFileSync(path.join(lyricDir, name), lyric.lrc.lyric);
            } catch (e) {
                console.error("Unable to save lyric for", name, e);
                continue;
            }
            console.log(targetName, "saved");
        }
    } catch (e) {
        console.error("Error occurred", e)
    }
})();

