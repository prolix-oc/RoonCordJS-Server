# 🎧 RoonCordJS-Server - Extensify RoonCordJS with your own image backend!
#### Imgur's whack, and MusicBrainz is way too slow huh? Got your own VPS and a hankering to configure?

## ✅ What it does:

- Acts as an API endpoint to upload album art covers for RoonCordJS

- Serves the images as static files, and responds to RoonCordJS with the link

- Offers optional Bearer token authentication to protect your endpoint

## ❌ What it does NOT do:

- Do the things RoonCordJS can do

- Enhance the album art in any way

- Let others listen to your music alongside you

- Break any Terms of Service provided by Discord or Roon Labs.

## 📜 Requirements:

- NodeJS 20 LTS (latest release preferred)

- npm (should come with NodeJS)

- The ability for your server to be reached via the web

- (<i>Optional</i>) A reverse proxy for SSL and domain names


## ▶️ How to run:

1. Clone the repo: 

    `git clone https://github.com/prolix-oc/RoonCordJS-Server`

2. Install all dependencies:
    
    `npm install`

3. Run it!
    - On Windows, double click or run in Command Prompt/Terminal: 
    
        `launch.bat`

    - On Linux, first 
        
        `chmod +x ./launch.sh`, then run 
        
        `./launch.sh`

    - Or if you prefer the manual, platform-agnostic way: 
    
        `node --env-file=app.env index`

The server will automatically create a generic user with a randomly generated Bearer token. There might be a few things you want to configure though, so read on to the next step.

## 🔧 Configuration

In `app.env`, you'll find a few important things.

- `AUTH_REQ` - <i>Defaults to `true`.</i> Enables Bearer token authorization for all API calls made to the server. Can be disabled if you're feeling risky.

- `AUTH_TYPE` - <i>Defaults to `json`, unused at the moment.</i> In the future, this will specify how Express checks for tokens and where.

- `SERVER_BASE_URL` - <i>Defaults to `http://127.0.0.1:3249`.</i> This is what the server will use in the response to RoonCord as a image URL for caching. <b>Make sure this URL is publicly accessible. `localhost` and `127.0.0.1` will not work.</b>

- `IMG_UPLOAD_DIR` - <i>Defaults to `artfiles`.</i> Specify where Multer will store uploads, and where Express will serve the album art from.

- `SERVER_PORT` - <i>Defaults to `3429`.</i> The port that Express will listen for requests on.

## ❗ Got an issue? 

Feel free to report it in the [repository issues](https://github.com/prolix-oc/RoonCordJS/issues), and I'll see what went wrong for you! 

## ⚠️ Known Issues:

- None at the moment.