var g_countHelix,
    g_hasFirstInTableTwitch,
    g_urlStreamsTwitch;
var g_overlayIndex = 0;
var g_hasToken = false;

const clientID = "k8nkd1h57i2l2a3mp4g46iwm2z15tg";
const redirectURI = "https://stffdtiger.github.io/ethcv/";
const backendURL = "https://ethcv-backend.vercel.app/api/auth";

function AddListeners() {
  document.getElementById("input-user").addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
      LoadUser(document.getElementById("input-user").value);
      ToggleDisplay("user-dropdown");
    }
  });
  document.getElementById("input-channel").addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
      LoadChannel(document.getElementById("input-channel").value);
      ToggleDisplay("channel-dropdown");
    }
  });
}

function ToggleDisplay(section) {
  var element = document.getElementById(section);
  if (element.classList.contains("showblock")) {
    element.classList.remove("showblock");
  } else {
    let elements = document.getElementsByClassName("dropdown-content showblock");
    while (elements[0]) {
      elements[0].classList.remove("showblock");
      elements = document.getElementsByClassName("dropdown-content showblock");
    }
    element.classList.add("showblock");
  }
}

function CookieExp() {
  var date = new Date();
  date.setTime(date.getTime() + (360*24*60*60*1000));
  var expires = "; expires=" + date.toGMTString();
  return expires;
}

function GetAuth() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  //console.log("code: ", code);
  if (code) {
    //$.post(backendURL, { code: code }, function(data) {
      //console.log(data);
      //return CreateFollowTable(data.data);
      //const cleanURL = window.location.origin + window.location.pathname;
      //window.history.replaceState({}, document.title, cleanURL);
    //});

    $.ajax({
      url: backendURL,
      method: "POST",
      data: JSON.stringify({ code: code }),
      contentType: "application/json",
      success: function(data) {
        console.log("SUCCESS: ", data);
      },
      error: function(xhr, status, error) {
        console.log("ERROR: ", status);
        console.log("Response: ", xhr.responseText);
      }
    });
  }
}

function LoadUser(userName) {
  if (userName !== "") {
    document.getElementById("current-user").innerHTML = userName;
    const url =
      "https://id.twitch.tv/oauth2/authorize" +
      "?client_id=" + clientID +
      "&redirect_uri=" + redirectURI +
      "&response_type=code" +
      "&scope=user:read:follows";

      window.location.href = url;
  }
}

function LoadChannel(channelName) {
  if (channelName === "") {
    document.getElementById("current-channel").innerHTML = "Channel";
    document.getElementById("frame-player").setAttribute("src", "about:blank");
    document.getElementById("frame-chat").setAttribute("src", "about:blank");
  } else {
    document.getElementById("current-channel").innerHTML = channelName;
    document.getElementById("frame-player").setAttribute("src", "https://player.twitch.tv/?channel="+channelName+"&parent=stffdtiger.github.io");
    document.getElementById("frame-chat").setAttribute("src", "https://www.twitch.tv/embed/"+channelName+"/chat?parent=stffdtiger.github.io&darkpopout");
  }
}

function CreateFollowTable(data) {
  g_hasFirstInTableTwitch = false;
  let tableT = document.createElement("div");
  tableT.setAttribute("id", "follow-table");
  document.getElementById("follows-helix").appendChild(tableT);
  var spanT;
  var isLiveTwitch;
  for (let ii = 0 ; ii < parseInt(data.length) ; ii++) {
    isLiveTwitch = false;
    spanT = document.createElement("span");
    spanT.classList.add("spanlink");
    spanT.index = data[ii].to_login;
    for (let jj = 0 ; jj < parseInt(data.length) ; jj++) {
      if (data[jj].user_name === data[ii].to_name && data[jj].type === "live") {
        spanT.classList.add("live");
        spanT.innerHTML = data[ii].to_name + " (" + data[jj].viewer_count + " viewers)";
        spanT.title = data[jj].title;
        isLiveTwitch = true;
        break;
      }
    }
    if (!isLiveTwitch) {
      spanT.innerHTML = data[ii].to_name;
    }
    spanT.onclick = function(event) { LoadChannel(event.target.index); };
    if (!g_hasFirstInTableTwitch) {
      document.getElementById("follow-table").appendChild(spanT);
      g_hasFirstInTableTwitch = true;
    } else {
      if (isLiveTwitch) {
        document.getElementById("follow-table").insertBefore(spanT, document.getElementById("follow-table").firstChild);
      } else {
        document.getElementById("follow-table").appendChild(spanT);
      }
    }
  }
}

