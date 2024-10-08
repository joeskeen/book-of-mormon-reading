import bookOfMormon from "./book-of-mormon.json" with { type: "json" };

document.getElementById("noFirefox").remove();

/**
 * elements on the page
 * @type {{startDate: HTMLInputElement, endDate: HTMLInputElement, results: HTMLElement}}
 */
const elements = {
  startDate: document.querySelector("#startDate"),
  endDate: document.querySelector("#endDate"),
  results: document.querySelector("#results"),
};

/**
 * keys used to store and retrieve data from local storage
 * @type {{startDate: string, endDate: string}}
 */
const storageKeys = {
  startDate: "startDate",
  endDate: "endDate",
};

// allow this to be called by the form's onsubmit function
globalThis.onSubmit = onSubmit;

try {
  loadDates();
} catch (err) {
  handleError(err);
}

////////////////////////////////////////////////////

function valueAsDate(value) {
  return new Date(value);
}

function dateAsValue(date) {
  return date.toISOString().split("T")[0];
}

function formatDateForDisplay(date) {
  return date.toLocaleString("en-US", {
    weekday: "short", // "Sat"
    month: "long", // "June"
    day: "numeric", // "01"
    year: "numeric", // "2019"
    timeZone: "UTC",
  });
}

function loadDates() {
  const savedStart = localStorage.getItem(storageKeys.startDate);
  const savedEnd = localStorage.getItem(storageKeys.endDate);
  if (savedStart && savedEnd) {
    elements.startDate.value = savedStart;
    elements.endDate.value = savedEnd;
    onSubmit();
  }
}

function saveDates() {
  localStorage.setItem(storageKeys.startDate, elements.startDate.value);
  localStorage.setItem(storageKeys.endDate, elements.endDate.value);
}

function onSubmit(e) {
  try {
    e?.preventDefault(); // prevent form submission, which reloads the page

    if (!elements.startDate.value && !elements.endDate.value) return; // don't do anything if no dates are set

    let startDate = valueAsDate(elements.startDate.value);
    let endDate = valueAsDate(elements.endDate.value);
    const now = new Date();

    // if the dates are invalid, set them to today
    if (isNaN(startDate.getTime())) {
      elements.startDate.value = dateAsValue(now);
      startDate = now;
    }
    if (isNaN(endDate.getTime())) {
      elements.endDate.value = dateAsValue(now);
      endDate = now;
    }

    // if the start date is after the end date, swap them
    if (startDate > endDate) {
      const temp = startDate;
      startDate = endDate;
      endDate = temp;
      elements.endDate.value = dateAsValue(endDate);
      elements.startDate.value = dateAsValue(startDate);
    }

    // save the dates to local storage
    saveDates();

    // calculate the number of days between the two dates
    const duration = endDate.getTime() - startDate.getTime();
    const ONE_DAY_MS = 1000 * 60 * 60 * 24;
    const days = Math.ceil(duration / ONE_DAY_MS) + 1; // inclusive

    // calculate the number of pages per day needed to read the Book of Mormon in that time
    const TOTAL_PAGES = bookOfMormon.totalPages;
    const ppd = TOTAL_PAGES / days;

    results.innerText = `To read the Book of Mormon between \n${formatDateForDisplay(
      startDate
    )} and \n${formatDateForDisplay(
      endDate
    )} \n(${days} days),\n you will need to read ${Math.ceil(
      ppd
    )} pages per day.`;

    if (now < startDate || now > endDate) {
      return;
    }

    // calculate what page you should be on today
    const currentDay = Math.ceil(
      (now.getTime() - startDate.getTime()) / ONE_DAY_MS
    );
    const currentPage = Math.min(Math.ceil(ppd * currentDay), TOTAL_PAGES);

    results.innerText += `\nToday you should be at about page ${currentPage}`;

    // calculate the chapter you should be on today
    const readChapters = bookOfMormon.chapters.sort((a,b) => a.page - b.page).filter(c => c.page <= currentPage);
    const currentChapter = readChapters[readChapters.length - 1];
    results.innerText += ` (${currentChapter.book}${currentChapter.chapter ? ` ${currentChapter.chapter}` : ''}).`;
  } catch (err) {
    handleError(err);
  }
}

function handleError(err) {
  console.error(err);
  document.body.innerHTML = "";
  document.body.innerText = err.toString();
}
