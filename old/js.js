var answers = {
  whoIs: [
    "Bassel is a machine learning engineer passionate about applying math in real-world problems.",
    "He also likes to read books and play chess in his free time.",
  ],
  workExp: [
    "Bassel has +4 years of professional experience in software development.",
    "He worked as software developer, web developer and assistant teacher.",
    "To have a closer look at his work experience, please have a look at his " +
      "<a target = '_blank', href ='https://www.linkedin.com/in/bassel-sh-k/'> Linkedin account</a>",
  ],
  education: [
    "Bassel studied information systems engineering in HIAST(Syria).",
    "He was busy for the last 3 years learning about AI and machine learning.",
    "To have a closer look at his education, please have a look at his " +
      "<a target = '_blank', href ='https://www.linkedin.com/in/bassel-sh-k/'> Linkedin account</a>",
  ],
  skills: [
    "Bassel is very skilled in software engineering and machine learning.",
    "He has a good experience in python, tensorflow and data science tools.",
    "He can also cook teasty food.",
    "To have a closer look at his skills, please have a look at his " +
      "<a target = '_blank', href ='https://www.linkedin.com/in/bassel-sh-k/'> Linkedin account</a>",
  ],
  projects: [
    "Bassel demonstrated his skills through delivering many machine learning projects.",
    "He worked on many case studies from computer vision and NLP.",
    "To have a closer look at his work, have a look at his " +
      "<a target = '_blank', href ='https://github.com/basselkassem/'> Github account</a>",
  ],
};

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
function getRobotMsg(text, date) {
  return (
    '<div class="incoming_msg">' +
    '<div class="incoming_msg_img">' +
    '<img src="imgs/robot.webp" alt="robot">' +
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
    "</div>"
  );
}
function getUserMsg(text, date) {
  return (
    '<div class="outgoing_msg">' +
    '<div class="sent_msg">' +
    "<p>" +
    text +
    "</p>" +
    '<span class="time_date">' +
    date +
    "</span>" +
    "</div>" +
    "</div>"
  );
}
function insertChat(who, text, time) {
  if (time === undefined) {
    time = 0;
  }
  var control = "";
  var date = formatAMPM(new Date());

  if (who == "me") {
    control = getUserMsg(text, date);
  } else {
    control = getRobotMsg(text, date);
  }
  setTimeout(function () {
    $(".msg_history").append(control);
    $(".msg_history ").animate(
      {
        scrollTop: $(".msg_history").prop("scrollHeight"),
      },
      500
    );
  }, time);
}
function resetChat() {
  $(".msg_history").empty();
}

$("#woIs").click(() => {
  insertChat("me", "Who is Bassel Kassem?");
  for (let i = 0; i < answers["whoIs"].length; i++) {
    insertChat("robot", answers["whoIs"][i], (i + 1) * 500);
  }
});
$("#workExp").click(() => {
  insertChat("me", "Tell me about Bassel's work experience?");
  for (let i = 0; i < answers["workExp"].length; i++) {
    insertChat("robot", answers["workExp"][i], (i + 1) * 500);
  }
});
$("#education").click(() => {
  insertChat("me", "Tell me about Bassel's education?");
  for (let i = 0; i < answers["education"].length; i++) {
    insertChat("robot", answers["education"][i], (i + 1) * 500);
  }
});
$("#skills").click(() => {
  insertChat("me", "What are Bassel's skills?");
  for (let i = 0; i < answers["skills"].length; i++) {
    insertChat("robot", answers["skills"][i], (i + 1) * 500);
  }
});
$("#projects").click(() => {
  insertChat("me", "Tell me a little bit about Bassel's projects!");
  for (let i = 0; i < answers["projects"].length; i++) {
    insertChat("robot", answers["projects"][i], (i + 1) * 500);
  }
});

resetChat();
insertChat("robot", "Hi, how are you doning!", 10);

$(document).ready(() => {

});
