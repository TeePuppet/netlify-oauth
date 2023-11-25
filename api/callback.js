const tiny = require("tiny-json-http");

module.exports = async (req, res) => {
  const client_id = process.env.OAUTH_CLIENT_ID;
  const client_secret = process.env.OAUTH_CLIENT_SECRET;
  const tokenUrl = "https://github.com/login/oauth/access_token";

  const data = {
    code: req.query.code,
    client_id,
    client_secret
  };

  try {
    const { body } = await tiny.post({ 
      url: tokenUrl, 
      data, 
      headers: { "Accept": "application/json" } 
    });

    const postMsgContent = {
      token: body.access_token,
      provider: "github"
    };

    const script = `
    <script>
    (function() {
      function receiveMessage(e) {
        console.log("receiveMessage %o", e);
        window.opener.postMessage(
          'authorization:github:success:${JSON.stringify(postMsgContent)}', 
          e.origin
        );
      }

      window.addEventListener("message", receiveMessage, false);
      window.opener.postMessage("authorizing:github", "*");
    })()
    </script>`;

    return res.send(script);

  } catch (err) {
    console.log(err);
    res.redirect("/?error=😡");
  }
};
