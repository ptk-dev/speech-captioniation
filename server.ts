import { execSync } from 'child_process';
import fs from 'fs';
import express from 'express';
import { transcribeAudio } from './transcribe';
import cors from 'cors';
import { Render } from './render';
function download(url: string) {

    const process = execSync('yt-dlp  -x --audio-format wav --output "public/%(id)s.%(ext)s" https://youtube.com/watch?v=' + url);
    console.log(process.toString('utf-8'));
    const fileName = url + ".wav";
    return fileName
}


const app = express();
app.use(express.static('public'));
app.use(cors())


app.get('/download', (req, res) => {
    console.log("downloading & sending", req.query.url)
    if (fs.existsSync(__dirname + "/public/" + req.query.url + ".wav")) {
        res.send(req.query.url + ".wav")
        return 0
    }
    res.send(download(req.query.url));
})

app.get('/transcribe', async (req, res) => {
    console.log("transcribing the", req.query.id)
    const id = req.query.id as string;

    if (fs.existsSync(__dirname + "/public/" + req.query.id + ".json")) {
        res.json(fs.readFileSync(__dirname + "/public/" + req.query.id + ".json", "utf-8"))
        return 0
    }

    const captions = await transcribeAudio({
        audioPath: __dirname + "/public/" + id + ".wav",
        speechStartsAtSecond: 0,
    })

    fs.writeFileSync(__dirname + "/public/" + id + ".json", JSON.stringify(captions), "utf-8")

    res.json(captions);
})




const ids = process.argv.slice(2)

app.listen(4000,
    async (err) => {
        console.log(err ?? "listening")
        try {
            for (const id of ids) {
                console.log("Rendering:", id)
                await Render(id);
            }
            process.exit(0)
        } catch(e) {
            console.log(e)
            process.exit(1)
        }
    }

)