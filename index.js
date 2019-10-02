const puppeteer = require('puppeteer');
const request = require('request-promise-native');
const poll = require('promise-poller').default;
const dotenv = require('dotenv');
dotenv.config();

async function run() {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        slowMo: 10
    });
    const page = await browser.newPage();

    await page.goto(process.env.VFS_SITE);
    let urlToVisaStatus = await page.evaluate(() => {
        const linkToVisaStatus = document.querySelector('.container>nav>div>ul>li:nth-child(5)>a');
        const pageToVisaStatus = linkToVisaStatus.getAttribute('href');
        return pageToVisaStatus;
    })
    console.log('urlToVisaStatus', urlToVisaStatus);
    await page.goto(urlToVisaStatus);
    await page.type('#RefNo', process.env.REFERENCE);
    await page.type('#datetimepicker1', process.env.BIRTH);
    const requestId = await initiateCaptchaRequest(urlToVisaStatus);
    console.log('captchaRequest', requestId);

    const response = await pollForRequestResults(requestId);
    console.log('response', response);
    const js = `document.getElementById("g-recaptcha-response").innerHTML="${response}";`
    await page.evaluate(js);
}


async function initiateCaptchaRequest(pageUrl) {
    const formData = {
        method: 'userrecaptcha',
        googlekey: process.env.GOOGLE_CAPTCHA_KEY,
        key: process.env.TWO_CAPTCHA_API_KEY,
        pageurl: pageUrl,
        json: 1
    };
    const response = await request.post('http://2captcha.com/in.php', {form: formData});
    return JSON.parse(response).request;
}

async function pollForRequestResults(
    id, 
    retries = 30, 
    interval = 1500, 
    delay = 15000
) {
    await timeout(delay);
    return poll({
      taskFn: requestCaptchaResults(id),
      interval,
      retries
    });
}

function requestCaptchaResults(requestId) {
    const url = `http://2captcha.com/res.php?key=${process.env.TWO_CAPTCHA_API_KEY}&action=get&id=${requestId}&json=1`;
    return async function() {
        return new Promise(async function(resolve, reject){
        const rawResponse = await request.get(url);
        const resp = JSON.parse(rawResponse);
        if (resp.status === 0) return reject(resp.request);
        resolve(resp.request);
        });
    }
}

const timeout = millis => new Promise(resolve => setTimeout(resolve, millis))

run();