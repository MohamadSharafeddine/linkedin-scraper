const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const url = `https://www.linkedin.com/jobs/search?keywords=MLOps`;

  await page.goto(url, { waitUntil: 'networkidle2' });

  // Wait for job listings to load
  await page.waitForSelector('.result-card__contents');

  const jobs = await page.evaluate(() => {
    const jobCards = document.querySelectorAll('.result-card__contents');
    const jobList = [];

    jobCards.forEach((card) => {
      const jobTitle = card.querySelector('.full-width artdeco-entity-lockup__title ember-view')?.innerText;
      const companyName = card.querySelector('.class="artdeco-entity-lockup__subtitle ember-view')?.innerText;
      const jobLocation = card.querySelector('.job-card-container__metadata-item ')?.innerText;
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
