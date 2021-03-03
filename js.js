function formatAMPM(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? "0" + minutes : minutes;
  var strTime = hours + ":" + minutes + " " + ampm;
  return strTime;
}
function getRobotMsg(text, date){
    return  '<div class="incoming_msg">' +
    '<div class="incoming_msg_img">' +
    '<img src="https://cdn0.iconfinder.com/data/icons/streamline-emoji-1/48/094-robot-face-3-512.png" alt="robot">' +
    "</div>" +
    '<div class="received_msg">' +
    '<div class="received_withd_msg">' +
    "<p>" +
    text +
    "</p>" +
    '<span class="time_date">' +
    date +
    "</span>" +
    "</div>" +
    "</div>" +
    "</div>";
}
function getUserMsg(text, date) {
    return '<div class="outgoing_msg">' +
    '<div class="sent_msg">' +
    "<p>" +
    text +
    "</p>" +
    '<span class="time_date">' +
    date +
    "</span>" +
    "</div>" +
    "</div>";
}

function insertChat(who, text, time) {
  if (time === undefined) {
    time = 0;
  }
  var control = "";
  var date = formatAMPM(new Date());

  if (who == "me") {
    control = getUserMsg(text, date)
  } else {
    control = getRobotMsg(text, date)
  }
  setTimeout(function () {
    $(".msg_history").append(control);
    $('.msg_history ').animate({
        scrollTop: $('.msg_history p:last').offset().top
    });
  }, time);
}

function resetChat() {
  $(".msg_history").empty();
}

$(".write_msg").on("keydown", function (e) {
  if (e.which == 13) {
    var text = $(this).val();
    if (text !== "") {
      insertChat("me", text);
      $(this).val("");

      insertChat("robot", "I didn't understand", 500);
    }
  }
});

$(".msg_send_btn").click(function () {
  $(".write_msg").trigger({ type: "keydown", which: 13, keyCode: 13 });
});

//-- Clear Chat
resetChat();

//-- Print Messages
insertChat("robot", "Hi, let's talk!", 10);