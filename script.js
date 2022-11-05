var g_token, g_hasCountTwitch, g_countHelix, g_pageHelix, g_hasFirstInTableTwitch, g_urlStreamsTwitch, g_dataUserTwitch, g_dataFollowsTwitch;
var g_overlayIndex = 0;
var g_hasToken = false;
var g_hasDataUserTwitch = false;
var g_currentChannel = "";
var g_playerOptions = { width: 16, height: 9, channel: g_currentChannel, parent: "stffdtiger.github.io" };
var g_player = new Twitch.Player("twitch-embed", g_playerOptions);
var g_playerHeight = setInterval(setPlayerDimensions, 1000);

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

function setPlayerDimensions() {
  var newWidth = parseInt(document.getElementById("page").offsetWidth) - 590; // 590 is left side (250) + right side (340)
  var newHeight = Math.floor(newWidth / 16 * 9);
  g_playerOptions = { width: newWidth, height: newHeight, channel: g_currentChannel, parent: "stffdtiger.github.io" };
  g_player = new Twitch.Player("twitch-embed", g_playerOptions);
}

function CookieExp() {
  var date = new Date();
  date.setTime(date.getTime() + (360*24*60*60*1000));
  var expires = "; expires=" + date.toGMTString();
  return expires;
}

function GetToken() {
  var hashCheck = document.location.hash;
  if (hashCheck) {
    var hashVar = "access_token=";
    var hashArray = document.location.hash.split("&");
    var hashTest = hashArray[0];
    do {
      hashTest = hashTest.substring(1);
    } while (hashTest.indexOf(hashVar) !== 0);
    g_token = hashTest.substring(hashVar.length, hashTest.length);
    g_hasToken = true;
    document.cookie = "token=" + g_token + CookieExp();
  } else {
    var cookieVar = "token=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var cookieArray = decodedCookie.split(';');
    for (let ii = 0 ; ii < cookieArray.length ; ii++) {
      var cookieTest = cookieArray[ii];
      while (cookieTest.charAt(0) === ' ') {
        cookieTest = cookieTest.substring(1);
      }
      if (cookieTest.indexOf(cookieVar) === 0) {
        g_token = cookieTest.substring(cookieVar.length, cookieTest.length);
        g_hasToken = true;
        document.cookie = "token=" + g_token + CookieExp();
        break;
      }
    }
  }
}

function LoadUser(userName) {
  var oldTable = document.getElementById("follow-table");
  if (oldTable) oldTable.parentNode.removeChild(oldTable);
  if (g_hasToken === true && userName !== "") {
    document.getElementById("current-user").innerHTML = userName;
    return StepOneHelix(userName);
  } else if (g_hasToken === false) {
    alert("You need to authenticate to use the follow list feature.");
  } else {
    document.getElementById("current-user").innerHTML = "User";
  }
}

function LoadChannel(channelName) {
  if (channelName === "") {
    document.getElementById("current-channel").innerHTML = "Channel";
  } else {
    document.getElementById("current-channel").innerHTML = channelName;
  }

  g_player.setChannel(channelName);
}

function StepOneHelix(userName) {
  $.ajax({
    type: "GET",
    url: "https://api.twitch.tv/helix/users?login=" + userName,
    headers: {
      "Client-ID": "k8nkd1h57i2l2a3mp4g46iwm2z15tg",
      "Authorization": "Bearer " + g_token
    },
    success: function(data) {
      //console.log(data);
      g_dataUserTwitch = data.data[0].id;
      g_hasDataUserTwitch = true;
    },
    complete: function(jqxhr, status) {
      if (status === "success" && !g_dataUserTwitch) {
        document.getElementById("invalid-username-helix").classList.add("showblock");
        g_hasDataUserTwitch = false;
      } else if (status === "success") {
        document.getElementById("invalid-username-helix").classList.remove("showblock");
        return StepTwoHelix(true, false);
      } else {
        document.getElementById("invalid-username-helix").classList.add("showblock");
        g_hasDataUserTwitch = false;
      }
    }
  });
}

function StepTwoHelix(init, destroy) {
  if (init) {
    g_hasCountTwitch = false;
    g_pageHelix = "";
    g_hasFirstInTableTwitch = false;
    if (!destroy) {
      let tableT = document.createElement("div");
      tableT.setAttribute("id", "follow-table");
      document.getElementById("follows-helix").appendChild(tableT);
    }
  }
  if (destroy) {
    let oldTableT = document.getElementById("follow-table");
    if (oldTableT) oldTableT.parentNode.removeChild(oldTableT);
    let tableT = document.createElement("div");
    tableT.setAttribute("id", "follow-table");
    document.getElementById("follows-helix").appendChild(tableT);
  }
  document.getElementById("follows-helix").classList.remove("showblock");
  document.getElementById("loading-helix").classList.add("showblock");
  $.ajax({
    type: "GET",
    url: "https://api.twitch.tv/helix/users/follows?from_id=" + g_dataUserTwitch + "&first=100&after=" + g_pageHelix,
    headers: {
      "Client-ID": "k8nkd1h57i2l2a3mp4g46iwm2z15tg",
      "Authorization": "Bearer " + g_token
    },
    success: function(data) {
      //console.log(data);
      g_dataFollowsTwitch = data;
      if (!g_hasCountTwitch) {
        g_countHelix = parseInt(data.total);
        g_countHelix -= parseInt(data.data.length);
        g_hasCountTwitch = true;
      } else {
        g_countHelix -= parseInt(data.data.length);
      }
      g_pageHelix = data.pagination.cursor;
      let isFirstId = true;
      g_urlStreamsTwitch = "https://api.twitch.tv/helix/streams";
      for (let ii = 0 ; ii < parseInt(data.data.length) ; ii++) {
        if (isFirstId) { // with first id add '?' instead of '&'
          g_urlStreamsTwitch = g_urlStreamsTwitch + "?user_id=" + data.data[ii].to_id;
          isFirstId = false;
        } else {
          g_urlStreamsTwitch = g_urlStreamsTwitch + "&user_id=" + data.data[ii].to_id;
        }
      }

    },
    complete: function(jqxhr, status) {
      if (status === "success") {
        return StepThreeHelix();
      } else {
        document.getElementById("loading-helix").classList.remove("showblock");
        document.getElementById("follows-helix").classList.add("showblock");
      }
    }
  });
}

function StepThreeHelix() {
  $.ajax({
    type: "GET",
    url: g_urlStreamsTwitch,
    headers: {
      "Client-ID": "k8nkd1h57i2l2a3mp4g46iwm2z15tg",
      "Authorization": "Bearer " + g_token
    },
    success: function(data) {
      //console.log(data);
      var spanT;
      var isLiveTwitch;
      for (let ii = 0 ; ii < parseInt(g_dataFollowsTwitch.data.length) ; ii++) {
        isLiveTwitch = false;
        spanT = document.createElement("span");
        spanT.classList.add("spanlink");
        spanT.index = g_dataFollowsTwitch.data[ii].to_login;
        for (let jj = 0 ; jj < parseInt(data.data.length) ; jj++) {
          if (data.data[jj].user_name === g_dataFollowsTwitch.data[ii].to_name && data.data[jj].type === "live") {
            spanT.classList.add("live");
            spanT.innerHTML = g_dataFollowsTwitch.data[ii].to_name + " (" + data.data[jj].viewer_count + " viewers)";
            spanT.title = data.data[jj].title;
            isLiveTwitch = true;
            break;
          }
        }
        if (!isLiveTwitch) {
          spanT.innerHTML = g_dataFollowsTwitch.data[ii].to_name;
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
    },
    complete: function(jqxhr, status) {
      if (status === "success") {
        if (g_countHelix > 0) {
          return StepTwoHelix(false, false);
        } else {
          document.getElementById("loading-helix").classList.remove("showblock");
          document.getElementById("follows-helix").classList.add("showblock");
        }
      } else {
        document.getElementById("loading-helix").classList.remove("showblock");
        document.getElementById("follows-helix").classList.add("showblock");
      }
    }
  });
}

function UpdateFollowListHelix() {
  if (g_hasDataUserTwitch) return StepTwoHelix(true, true);
}
