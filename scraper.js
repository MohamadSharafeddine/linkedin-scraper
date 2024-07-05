const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const query = 'MLOps';
  const url = `https://www.linkedin.com/jobs/search?keywords=MLOps&location=Lebanon&geoId=101834488&trk=public_jobs_jobs-search-bar_search-submit&position=1&pageNum=0&currentJobId=3960300799`;

  await page.goto(url, { waitUntil: 'networkidle2' });

  // Wait for job listings to load
  await page.waitForSelector('.base-card__full-link');

  const jobs = await page.evaluate(() => {
    const jobCards = document.querySelectorAll('.base-card__full-link');
    const jobList = [];

    jobCards.forEach((card) => {
      const jobTitle = card.querySelector('.result-card__title')?.innerText;
      const companyName = card.querySelector('.result-card__subtitle')?.innerText;
      const jobLocation = card.querySelector('.job-result-card__location')?.innerText;
      const jobDescription = card.querySelector('.job-result-card__snippet')?.innerText;
      const jobPostDate = card.querySelector('.job-result-card__listdate--new')?.innerText || card.querySelector('.job-result-card__listdate')?.innerText;
      const applicationLink = card.querySelector('a.result-card__full-card-link')?.href;

      jobList.push({
        jobTitle,
        companyName,
        jobLocation,
        jobDescription,
        jobPostDate,
        applicationLink,
      });
    });

    return jobList;
  });

  await browser.close();

  fs.writeFileSync('jobs.json', JSON.stringify(jobs, null, 2));
  console.log('Job data extracted and saved to jobs.json');
})();
