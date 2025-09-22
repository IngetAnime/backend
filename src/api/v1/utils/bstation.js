import puppeteer from "puppeteer";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);

// Parse a date (without year) for one week, 
// in a way that is robust during year transitions (December–January) as well as regular months (January–December).
// The logic is as follows:
// A data entry n comes in.
// Initialize n with the same year as today.
// If the difference from today is more than one month, then perform further checks:
//   - If today is in December and n is in January, assign n to the next year.
//   - If today is in January and n is in December, assign n to the previous year.
function parseDate(dateStr, time, timeZone) {
  const [hour, minute] = time.split(':');
  const [date, month] = dateStr.split('/');
  const today = dayjs();
  let dateTime = dayjs.tz(`${today.year()}-${month}-${date} ${hour}:${minute}:00`, timeZone);

  if (Math.abs(dateTime.diff(today, 'month')) > 1) {
    if ((today.month() === 11) && (dateTime.month() === 0)) {
      dateTime = dateTime.add(1, 'year');
    } else if ((today.month() === 0) && (dateTime.month() === 11)) {
      dateTime = dateTime.subtract(1, 'year');
    }
  }
  
  return dateTime;
}

export async function getTimeline(timeZone='Asia/Jakarta') {
  try {
    // Launch the browser and open a new blank page
    const browser = await puppeteer.launch({
      headless: true, // without display
      args: ["--no-sandbox", "--disable-setuid-sandbox"], // faster load
    });
    const page = await browser.newPage();

    // Navigate the page to a URL
    await page.goto("https://www.bilibili.tv/id/timeline", {
      waitUntil: "domcontentloaded",
    });

    // Wait for load
    await page.waitForSelector(".timeline-card");

    // Get information
    const data = await page.evaluate(() => {
      const results = [];

      document.querySelectorAll(".timeline-pc__item").forEach((dayEl) => {
        const date = dayEl.querySelector(".timeline-header__desc")?.innerText || "";

        dayEl.querySelectorAll(".timeline-card").forEach((card) => {
          const time = card.querySelector(".timeline-card__time")?.innerText.trim() || "";
          card.querySelectorAll(".timeline-card__card").forEach((item) => {
            const title = item.querySelector(".bstar-video-card__title-text")?.innerText.trim() || "";
            const picture = item.querySelector("img.bstar-image__img")?.src || "";
            const link = item.querySelector(".bstar-video-card__title-text")?.href || "";
            const episodeNumber = item.querySelector(".bstar-video-card__desc")?.innerText.trim() || "";
            results.push({ title, picture, link, episodeNumber, date, time });
          })

        });
      });

      return results;
    });

    await browser.close();

    // Parse and clean data
    const parsedData = data.map((item) => {
      const match = item.episodeNumber.match(/\d+/);
      const episodeNumber = match ? parseInt(match[0], 10) : null;
      const date = (item.date === 'Hari ini') ? dayjs().format('DD/MM') : item.date;
      
      const releaseAt = parseDate(date, item.time, timeZone).toISOString();
      return { 
        ...item, episodeNumber, releaseAt
      };
    });

    return parsedData;
  } catch(err) {
    throw err;
  }
}

export async function getInformation(url) {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    // Tunggu ep-list muncul
    await page.waitForSelector(".ep-list");

    // Ambil daftar episode
    const episodes = await page.$$eval(".ep-item", items =>
      items.map(el => ({
        title: el.getAttribute("title"),
        href: el.getAttribute("href"),
        number: el.textContent.trim(),
        premium: !!el.querySelector(".corner-mark")
      }))
    );

    const episodeAired = episodes.length;
    const lastEpisode = episodes[episodes.length - 1];

    // Pergi ke episode terakhir
    await page.goto("https://www.bilibili.tv" + lastEpisode.href, { waitUntil: "networkidle2" });

    // Ambil JSON-LD
    const jsonLd = await page.$$eval('script[type="application/ld+json"]', scripts =>
      scripts.map(s => JSON.parse(s.innerText))
    );

    // Cari VideoObject
    let videoInfo = null;
    for (const block of jsonLd) {
      if (Array.isArray(block)) {
        const vid = block.find(item => item["@type"] === "VideoObject");
        if (vid) videoInfo = vid;
      } else if (block["@type"] === "VideoObject") {
        videoInfo = block;
      }
    }

    await browser.close();

    return {
      episodeAired,
      lastEpisodeAiredAt: videoInfo?.uploadDate ? dayjs(videoInfo.uploadDate).toISOString() : null,
      premium: lastEpisode.premium,
      episodes,
    };
  } catch(err) {
    console.log("Error in the getBstationInformation service");
    throw err;
  }
}

// console.log((await getTimeline()));