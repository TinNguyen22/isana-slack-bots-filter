const { App } = require('@slack/bolt');
const { WebClient, LogLevel } = require("@slack/web-api");

var pendingMessages = [];
var channelId = "";
var isSend = false;

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET
});

const client = new WebClient(process.env.SLACK_BOT_TOKEN, {
    // LogLevel can be imported and used to make debugging simpler
    logLevel: LogLevel.DEBUG
  });

app.message(process.env.IDENTIFICATION_NAME, async ({message, say}) => {
  pendingMessages.push(message);
    if (pendingMessages.length > 0) {
        var currentTime = new Date().valueOf()
        if (pendingMessages.length >= 5) {
            if ((currentTime - (pendingMessages[0].ts * 1000)) <= (60 * 1000)) {
                if (!isSend) {
                  isSend = true;
                  await publishMessage(channelId, `Head up!, More than five errors occurred within last 1 minite. Please check your firebase now !`);
                } 
            } else {
                pendingMessages = [];
                pendingMessages.push(message)
                isSend = false;
            } 
        } 
    }
    console.log(pendingMessages.length)
});

async function publishMessage(id, text) {
    try {
      // Call the chat.postMessage method using the built-in WebClient
      const result = await app.client.chat.postMessage({
        // The token you used to initialize your app
        token: process.env.SLACK_BOT_TOKEN,
        channel: id,
        text: text
        // You could also use a blocks[] array to send richer content
      });
  
      // Print result, which includes information about the message (like TS)
      console.log(result);
    }
    catch (error) {
      console.error(error);
    }
  }

async function findConversation(name) {
    try {
      // Call the conversations.list method using the built-in WebClient
      const result = await app.client.conversations.list({
        // The token you used to initialize your app
        token: process.env.SLACK_BOT_TOKEN
      });
  
      for (const channel of result.channels) {
        if (channel.name === name) {
          channelId = channel.id;
  
          // Print result
          console.log("Found conversation ID: " + channelId);
          // Break from for loop
          break;
        }
      }
    }
    catch (error) {
      console.error(error);
    }
  }



(async () => {
    // Start your app
    await app.start(process.env.PORT || 3000);
    
    await findConversation(process.env.CHANNEL_NAME)
    
    console.log('⚡️ Crashlytics bot app is running!');
  })();

