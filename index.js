const express = require('express')
const path = require("path");
const multer = require("multer");
const fs = require('fs');
const crypto = require('crypto')
const colors = require('colors')
const moment = require('moment')

var authTokens = [];

colors.setTheme({
    input: 'grey',
    verbose: 'cyan',
    prompt: 'grey',
    info: 'green',
    data: 'grey',
    help: 'cyan',
    warn: 'yellow',
    debug: 'blue',
    error: 'red',
    plain: 'white'
});

const logTypes = {
    error: 'err',
    warning: 'warn',
    info: 'info',
    ok: 'ok',
    debug: 'debug'
}

function outputLog(logLevel, message) {
    var combinedString = '';
    var dateString = moment().format("MM/DD/YYYY HH:mm:ss")
    switch (logLevel) {
        case 'warn':
            combinedString += colors.warn(`${dateString} [WARN] `)
            combinedString += colors.plain(message)
            console.log(combinedString)
            break;
        case 'info':
            combinedString += colors.data(`${dateString} [INFO] `)
            combinedString += colors.plain(message)
            console.log(combinedString)
            break;
        case 'ok':
            combinedString += colors.info(`${dateString} [DONE] `)
            combinedString += colors.plain(message)
            console.log(combinedString)
            break;
        case 'error':
            combinedString += colors.error(`${dateString} [ERR] `)
            combinedString += colors.plain(message)
            console.log(combinedString)
            break;
        case 'debug':
            combinedString += colors.debug(`${dateString} [DEBUG]`)
            combinedString += colors.plain(message)
            console.log(combinedString)
            break;
        default:
            combinedString += colors.verbose(`${dateString} [UNKNOWN] `)
            combinedString += colors.plain(message)
            console.log(combinedString);
            break;
    }
}


if (fs.existsSync('./auth_keys.json')) {
    outputLog(logTypes.info, "Loaded allowed users from disk.")
    authTokens = JSON.parse(fs.readFileSync('./auth_keys.json', 'utf8'));
    updateEmptyTokens();
} else {
    if (process.env.AUTH_REQ == true) {
        authTokens = [{ "display_name": "Eager Beaver", "email": "me@example.com", "user_id": "user", "role": "ADMIN", "api_token": "", "api_token_type": "Bearer" }]
        outputLog(logTypes.warning, "No authfile found, generating one.")
        fs.writeFileSync("./auth_keys.json", JSON.stringify(authTokens), (err) => {
            if (err)
                outputLog(logTypes.error, "Error creating auth file on local disk:\n" + err)
            else {
                outputLog(logTypes.ok, "Auth file successfully created!")
                updateEmptyTokens();
            }
        });
    }
}

if (fs.existsSync(`./${process.env.IMG_UPLOAD_DIR}`)) {
    outputLog(logTypes.info, "Album art folder exists.")
} else {
    outputLog(logTypes.info, "Creating album art folder for Multer...")
    fs.mkdirSync(`./${process.env.IMG_UPLOAD_DIR}`, (err) => {
        if (err) {
            outputLog(logTypes.error, `Could not create directory. Specific reason: ${err}`)
            process.exit();
        } else
            outputLog(logTypes.ok, "Album art folder created!")
    });
}

async function updateEmptyTokens() {
    authTokens.forEach((object) => {
        if (object.api_token === "" && object.role === "ADMIN") {
            object.api_token = crypto.randomBytes(24).toString('hex');
            fs.writeFileSync("auth_keys.json", JSON.stringify(authTokens), (err) => {
                if (err)
                    outputLog(logTypes.error, "Error updating auth file on local disk:\n" + err)
                else {
                    outputLog(logTypes.info, `Updated API key for admin user ${object.display_name}`)
                }
            });
        }
    })
}

const app = express()
app.use(express.json())
app.use('/art', express.static(__dirname + "/" + process.env.IMG_UPLOAD_DIR))

const storage = multer.diskStorage({
    onFileUploadStart: function (file) {
        console.log(file.originalname + ' is starting ...')
    },
    destination: function (req, file, cb) {
        cb(null, __dirname + "/" + process.env.IMG_UPLOAD_DIR)
    },
    filename: function (req, file, cb) {
        cb(null, makeFileID(12) + ".jpg");
    }
})

const upload = multer({ storage: storage })

app.post('/image', upload.single('file'), (req, res) => {
    if (process.env.AUTH_REQ === "true") {
        authTokens.forEach(object => {
            if (req.headers.authorization.split(' ')[1] === object.api_token) {
                outputLog(logTypes.info, `Received authenticated request from user ${object.display_name}`)
                if (!req.file) {
                    outputLog(logTypes.info, "No file received from client.");
                    res.send({
                        "success": false
                    });
                } else {
                    outputLog(logTypes.info, 'New image received from client.');
                    var formattedLink = `https://api.prolix.live/art/${res.req.file.filename}`
                    outputLog(logTypes.ok, "Response with URL sent.")
                    res.status(200).json({
                        "success": true,
                        "link": "" + formattedLink
                    })
                }
            } else {
                res.status(401).json({
                    "success": false,
                    "message": "Unauthorized. Please send your API token with this request."
                })
            }
        })
    } else {
        outputLog(logTypes.info, `Received unauthenticated request.`)
        if (!req.file) {
            outputLog(logTypes.info, "No file received from client.");
            res.send({
                "success": false
            });
        } else {
            outputLog(logTypes.info, 'New image received from client.');
            var formattedLink = `https://cdn.prolix.live/img/${res.req.file.filename}`
            outputLog(logTypes.ok, "Response with URL sent.")
            res.status(200).json({
                "success": true,
                "link": "" + formattedLink
            })
        }
    }

})

app.get('/image', (req, res) => {
    res.send({ 'why': 'Are you here?', 'status': 'wtf' })
    res.status(200)
})

app.listen(process.env.SERVER_PORT, () => {
    outputLog(logTypes.ok, `Image API listening on port ${process.env.SERVER_PORT}`);
    updateEmptyTokens();
})

function makeFileID(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}
