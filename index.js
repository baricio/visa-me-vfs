const puppeteer = require('puppeteer');
const request = require('request-promise-native');
const dotenv = require('dotenv');
dotenv.config();

async function run() {
    const browser = await puppeteer.launch({
        headless: false
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
    //await page.screenshot({path: 'screenshot/my-photo.png'});
    //browser.close();
}


async function initiateCaptchaRequest(apiKey, pageUrl) {
    const formData = {
        method: 'userrecaptcha',
        googlekey: process.env.TWO_CAPTCHA_KEY,
        key: apiKey,
        pageurl: pageUrl,
        json: 1
    };
    const response = await request.post('http://2captcha.com/in.php', {form: formData});
    return JSON.parse(response).request;
}
run();