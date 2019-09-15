const puppeteer = require('puppeteer');

async function run() {
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();

    console.log('got to page')
    await page.goto('https://www.vfsglobal.com/portugal/Brazil/index.html');
    console.log('evaluate')
    let urlToVisaStatus = await page.evaluate(() => {
        console.log('start evaluating')
        const linkToVisaStatus = document.querySelector('.container>nav>div>ul>li:nth-child(5)>a');
        const pageToVisaStatus = linkToVisaStatus.getAttribute('href');
        return pageToVisaStatus;
    })
    console.log('urlToVisaStatus', urlToVisaStatus);
    await page.goto(urlToVisaStatus);
    //await page.screenshot({path: 'screenshot/my-photo.png'});
    //browser.close();
}

run();