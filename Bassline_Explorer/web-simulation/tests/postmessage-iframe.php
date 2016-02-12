<html>
<head>
    <title>postMessage Receiver</title>
</head>
<body>
<div id="test">Send me a message!</div>
    <script>
        function urldecode(url) {
            return decodeURIComponent(url.replace(/\+/g, ' '));
        };

        function listener(event) {
          if (event.origin !== "http://localhost")
            return;

          document.getElementById("test").innerHTML = "received: "+ event.data;


        };
        if (window.addEventListener) {
          addEventListener("message", listener, false)
        } else {
          attachEvent("onmessage", listener);
        };
    </script>
</body>
</html>
