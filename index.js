try {
  const startDate_ = document.querySelector("#startDate");
  const endDate_ = document.querySelector("#endDate");
  const results = document.querySelector("#results");

  function loadDates() {
    const savedStart = localStorage.getItem("startDate");
    const savedEnd = localStorage.getItem("endDate");
    if (savedStart && savedEnd) {
      startDate_.value = savedStart;
      endDate_.value = savedEnd;
      onSubmit();
    }
  }

  function saveDates() {
    localStorage.setItem("startDate", startDate_.value.toString());
    localStorage.setItem("endDate", endDate_.value.toString());
  }

  function onSubmit(e) {
    try {
      e?.preventDefault();

      if (!startDate_.value && !endDate_.value) return;

      let startDate = new Date(startDate_.value);
      let endDate = new Date(endDate_.value);
      const now = new Date();

      if (isNaN(startDate.getTime())) {
        startDate_.value = now;
        startDate = now;
      }
      if (isNaN(endDate.getTime())) {
        endDate_.value = now;
        endDate = now;
      }

      if (startDate > endDate) {
        endDate_.value = startDate;
        startDate_.value = endDate;
        startDate = endDate;
        endDate = new Date(startDate_.value);
      }

      saveDates();

      const duration = endDate.getTime() - startDate.getTime();
      const ONE_DAY = 1000 * 60 * 60 * 24;
      const days = Math.ceil(duration / ONE_DAY) + 1; // inclusive

      const TOTAL_PAGES = 531;
      const ppd = TOTAL_PAGES / days;

      const format = (d) =>
        d.toLocaleString("en-US", {
          weekday: "short", // "Sat"
          month: "long", // "June"
          day: "2-digit", // "01"
          year: "numeric", // "2019"
          timeZone: "UTC",
        });
      results.innerText = `To read the Book of Mormon between \n${format(
        startDate
      )} and \n${format(
        endDate
      )} \n(${days} days),\n you will need to read ${Math.ceil(
        ppd
      )} pages per day.`;

      const currentDay = Math.ceil(
        (now.getTime() - startDate.getTime()) / ONE_DAY
      );
      const currentPage = Math.min(Math.ceil(ppd * currentDay), TOTAL_PAGES);

      results.innerText += `\nToday you should be at about page ${currentPage}.`;
    } catch (err) {
      handleError(err);
    }
  }

  loadDates();
} catch (err) {
  handleError(err);
}

function handleError(err) {
  document.body.innerHTML = "";
  document.write(err.toString());
}
