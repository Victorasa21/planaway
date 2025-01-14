// https://developer.mozilla.org/en-US/docs/Web/API/Window/DOMContentLoaded_event
// document.addEventListener("DOMContentLoaded", () => {
//   console.log("name-of-project JS imported successfully!");

// });
var calendar = document.getElementById("calendar-table");
var gridTable = document.getElementById("table-body");
var currentDate = new Date();
var selectedDate = currentDate;
var selectedDayBlock = null;
var globalEventObj = {};

var sidebar = document.getElementById("sidebar");

function createCalendar(date, side) {
  var currentDate = date;
  var startDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );

  var monthTitle = document.getElementById("month-name");
  var monthName = currentDate.toLocaleString("en-US", {
    month: "long",
  });
  var yearNum = currentDate.toLocaleString("en-US", {
    year: "numeric",
  });
  monthTitle.innerHTML = `${monthName} ${yearNum}`;

  if (side == "left") {
    gridTable.className = "animated fadeOutRight";
  } else {
    gridTable.className = "animated fadeOutLeft";
  }

  setTimeout(
    () => {
      gridTable.innerHTML = "";

      var newTr = document.createElement("div");
      newTr.className = "row";
      var currentTr = gridTable.appendChild(newTr);

      for (let i = 1; i < startDate.getDay(); i++) {
        let emptyDivCol = document.createElement("div");
        emptyDivCol.className = "col empty-day";
        currentTr.appendChild(emptyDivCol);
      }

      var lastDay = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );
      lastDay = lastDay.getDate();

      for (let i = 1; i <= lastDay; i++) {
        if (currentTr.children.length >= 7) {
          currentTr = gridTable.appendChild(addNewRow());
        }
        let currentDay = document.createElement("div");
        currentDay.className = "col";
        if (
          (selectedDayBlock == null && i == currentDate.getDate()) ||
          selectedDate.toDateString() ==
          new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            i
          ).toDateString()
        ) {
          selectedDate = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            i
          );

          document.getElementById("eventDayName").innerHTML =
            selectedDate.toLocaleString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            });

          selectedDayBlock = currentDay;
          setTimeout(() => {
            currentDay.classList.add("blue");
            currentDay.classList.add("lighten-3");
          }, 900);
        }
        currentDay.innerHTML = i;

        //show marks
        if (
          globalEventObj[
          new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            i
          ).toDateString()
          ]
        ) {
          let eventMark = document.createElement("div");
          eventMark.className = "day-mark";
          currentDay.appendChild(eventMark);
        }

        currentTr.appendChild(currentDay);
      }

      for (let i = currentTr.getElementsByTagName("div").length; i < 7; i++) {
        let emptyDivCol = document.createElement("div");
        emptyDivCol.className = "col empty-day";
        currentTr.appendChild(emptyDivCol);
      }

      if (side == "left") {
        gridTable.className = "animated fadeInLeft";
      } else {
        gridTable.className = "animated fadeInRight";
      }

      function addNewRow() {
        let node = document.createElement("div");
        node.className = "row";
        return node;
      }
    },
    !side ? 0 : 270
  );
}

createCalendar(currentDate);

var todayDayName = document.getElementById("todayDayName");
todayDayName.innerHTML =
  "Today is " +
  currentDate.toLocaleString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });

var prevButton = document.getElementById("prev");
var nextButton = document.getElementById("next");

prevButton.onclick = function changeMonthPrev() {
  currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
  createCalendar(currentDate, "left");
};
nextButton.onclick = function changeMonthNext() {
  currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1);
  createCalendar(currentDate, "right");
};

function addEvent(title, desc) {
  if (!globalEventObj[selectedDate.toDateString()]) {
    globalEventObj[selectedDate.toDateString()] = {};
  }
  globalEventObj[selectedDate.toDateString()][title] = desc;
}

async function showEvents() {
  let sidebarEvents = document.getElementById("sidebarEvents");

  const response = await axios.get(
    `https://${window.location.host}/notes/` + selectedDate.toDateString()
  );
  const notesArray = response.data.data;

  sidebarEvents.innerHTML = "";

  if (notesArray[0]) {
    let eventsCount = 0;

    notesArray.forEach((note) => {
      let eventContainer = document.createElement("div");
      eventContainer.className = "eventCard";

      let eventHeader = document.createElement("div");
      if (note.taskDone) {
        eventHeader.className = "eventCard-header-done";
      } else {
        eventHeader.className = "eventCard-header";
      }

      let eventDescription = document.createElement("div");
      if (note.taskDone) {
        eventDescription.className = "eventCard-description-done";
      } else {
        eventDescription.className = "eventCard-description";
      }

      eventHeader.appendChild(document.createTextNode(note.title));
      eventContainer.appendChild(eventHeader);

      eventDescription.appendChild(document.createTextNode(note.description));
      eventContainer.appendChild(eventDescription);

      let markWrapper = document.createElement("div");
      markWrapper.className = "eventCard-mark-wrapper";
      let mark = document.createElement("div");
      mark.classList = "eventCard-mark";
      mark.innerHTML = `<a href=notes/${note._id}/detail>
      <img class="edit-img" src="/images/edit.png">
    </a>`;
      markWrapper.appendChild(mark);
      eventContainer.appendChild(markWrapper);

      sidebarEvents.appendChild(eventContainer);

      eventsCount++;
    });
    let emptyFormMessage = document.getElementById("emptyFormTitle");
    emptyFormMessage.innerHTML = `${eventsCount} events now`;
  } else {
    let emptyMessage = document.createElement("div");
    emptyMessage.className = "empty-message";
    emptyMessage.innerHTML = "Sorry, no events to selected date";
    sidebarEvents.appendChild(emptyMessage);
    let emptyFormMessage = document.getElementById("emptyFormTitle");
    emptyFormMessage.innerHTML = "No events now";
  }
}

gridTable.onclick = function (e) {
  if (
    !e.target.classList.contains("col") ||
    e.target.classList.contains("empty-day")
  ) {
    return;
  }

  if (selectedDayBlock) {
    if (
      selectedDayBlock.classList.contains("blue") &&
      selectedDayBlock.classList.contains("lighten-3")
    ) {
      selectedDayBlock.classList.remove("blue");
      selectedDayBlock.classList.remove("lighten-3");
    }
  }
  selectedDayBlock = e.target;
  selectedDayBlock.classList.add("blue");
  selectedDayBlock.classList.add("lighten-3");

  selectedDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    parseInt(e.target.innerHTML)
  );

  showEvents();

  document.getElementById("eventDayName").innerHTML =
    selectedDate.toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
};

var changeFormButton = document.getElementById("changeFormButton");
var addForm = document.getElementById("addForm");
changeFormButton.onclick = function (e) {
  addForm.style.top = 0;
};

var cancelAdd = document.getElementById("cancelAdd");
cancelAdd.onclick = function (e) {
  addForm.style.top = "100%";
  let inputs = addForm.getElementsByTagName("input");
  for (let i = 0; i < inputs.length; i++) {
    inputs[i].value = "";
  }
  let labels = addForm.getElementsByTagName("label");
  for (let i = 0; i < labels.length; i++) {
    labels[i].className = "";
  }
};

var addEventButton = document.getElementById("addEventButton");
addEventButton.onclick = async function (e) {
  let title = document.getElementById("eventTitleInput").value.trim();
  let desc = document.getElementById("eventDescInput").value.trim();

  if (!title || !desc) {
    document.getElementById("eventTitleInput").value = "";
    document.getElementById("eventDescInput").value = "";
    let labels = addForm.getElementsByTagName("label");
    for (let i = 0; i < labels.length; i++) {
      labels[i].className = "";
    }
    return;
  }

  axios
    .post(`https://${window.location.host}/notes/create`, {
      title,
      description: desc,
      date: selectedDate.toDateString(),
    })
    .then(() => {
      showEvents();
    });

  // });

  if (!selectedDayBlock.querySelector(".day-mark")) {
    selectedDayBlock.appendChild(document.createElement("div")).className =
      "day-mark";
  }

  let inputs = addForm.getElementsByTagName("input");
  for (let i = 0; i < inputs.length; i++) {
    inputs[i].value = "";
  }
  let labels = addForm.getElementsByTagName("label");
  for (let i = 0; i < labels.length; i++) {
    labels[i].className = "";
  }
};
addEventListener("load", (event) => {
  event.preventDefault();
  showEvents();
});

//from here
weatherUpdate = todayDayName.appendChild(document.createElement("p"));
weatherUpdate.classList.add("weatherUpdate");
weatherUpdate.innerText = "";

addEventListener("click", async (event) => {
  const response = await axios.get(
    "https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&timezone=Europe/Berlin&daily=weathercode,temperature_2m_max,temperature_2m_min"
  );

  const selectDateString =
    selectedDate.getFullYear() +
    "-" +
    (selectedDate.getMonth() + 1) +
    "-" +
    selectedDate.getDate();
  const nextSevenDays = response.data.daily.time;

  if (nextSevenDays.includes(selectDateString)) {
    weatherUpdate.innerText = "";
    const index = response.data.daily.time.indexOf(selectDateString);
    switch (response.data.daily.weathercode[index]) {
      case 0:
      case 1:
      case 2:
      case 3:
        {
          document.querySelector(".header-background").style.backgroundImage =
            "url('/images/clear sky.jpeg')";
          weatherUpdate.innerText =
            " Maximum Temperature on " +
            selectedDate.toLocaleString("en-US", {
              day: "numeric",
              month: "short",
            }) +
            " : " +
            response.data.daily.temperature_2m_max[index] +
            "°C";
        }
        break;
      case 45:
      case 48:
        {
          document.querySelector(".header-background").style.backgroundImage =
            "url('/images/foggy.jpeg')";
          weatherUpdate.innerText =
            " Maximum Temperature on " +
            selectedDate.toLocaleString("en-US", {
              day: "numeric",
              month: "short",
            }) +
            " : " +
            response.data.daily.temperature_2m_max[index] +
            "°C";
        }
        break;
      case 56:
      case 57:
      case 66:
      case 67:
        {
          document.querySelector(".header-background").style.backgroundImage =
            "url('/images/freezingdrizzle.jpeg')";
          weatherUpdate.innerText =
            " Maximum Temperature on " +
            selectedDate.toLocaleString("en-US", {
              day: "numeric",
              month: "short",
            }) +
            " : " +
            response.data.daily.temperature_2m_max[index] +
            "°C";
        }
        break;
      case 61:
      case 63:
      case 65:
        {
          document.querySelector(".header-background").style.backgroundImage =
            "url('/images/rainyandcold.jpeg')";
          weatherUpdate.innerText =
            " Maximum Temperature on " +
            selectedDate.toLocaleString("en-US", {
              day: "numeric",
              month: "short",
            }) +
            " : " +
            response.data.daily.temperature_2m_max[index] +
            "°C";
        }
        break;
      case 51:
      case 53:
      case 55:
      case 80:
        {
          document.querySelector(".header-background").style.backgroundImage =
            "url('/images/rain.jpeg')";
          weatherUpdate.innerText =
            " Maximum Temperature on " +
            selectedDate.toLocaleString("en-US", {
              day: "numeric",
              month: "short",
            }) +
            " : " +
            response.data.daily.temperature_2m_max[index] +
            "°C";
        }
        break;
      case 85:
      case 86:
      case 77:
        {
          document.querySelector(".header-background").style.backgroundImage =
            "url('/images/snowshowers.jpeg')";
          weatherUpdate.innerText =
            " Maximum Temperature on " +
            selectedDate.toLocaleString("en-US", {
              day: "numeric",
              month: "short",
            }) +
            " : " +
            response.data.daily.temperature_2m_max[index] +
            "°C";
        }
        break;
      case 95:
      case 96:
      case 99:
        {
          document.querySelector(".header-background").style.backgroundImage =
            "url('/images/thunderstorm.jpeg')";
          weatherUpdate.innerText =
            " Maximum Temperature on " +
            selectedDate.toLocaleString("en-US", {
              day: "numeric",
              month: "short",
            }) +
            " : " +
            response.data.daily.temperature_2m_max[index] +
            "°C";
        }
        break;
      case 71:
      case 73:
      case 75:
        {
          document.querySelector(".header-background").style.backgroundImage =
            "url('/images/snowfall.webp')";
          weatherUpdate.innerText =
            " Maximum Temperature on " +
            selectedDate.toLocaleString("en-US", {
              day: "numeric",
              month: "short",
            }) +
            " : " +
            response.data.daily.temperature_2m_max[index] +
            "°C";
        }
        break;
      default: {
        document.querySelector(".header-background").style.backgroundImage =
          "url('https://raw.githubusercontent.com/JustMonk/codepen-resource-project/master/img/compressed-header.jpg')";
        weatherUpdate.innerText = "";
      }
    }
  } else {
    document.querySelector(".header-background").style.backgroundImage =
      "url('https://raw.githubusercontent.com/JustMonk/codepen-resource-project/master/img/compressed-header.jpg')";
    weatherUpdate.innerText = "";
  }
});
