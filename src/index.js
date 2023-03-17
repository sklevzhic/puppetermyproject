import puppeteer from 'puppeteer';
import fs from "fs"


(async () => {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();

    const BASE_URL = "https://wordsofwonders.ru/category/perenos-slov/"

    // добавить какое-то условие
    // const maxPage = await getMaxPageOfCategory(page, BASE_URL)
    // const allLevels = await getAllLevels(page, maxPage)
    // fs.writeFileSync('file.json', JSON.stringify(allLevels));

    // console.log("Все уровни получены: ", allLevels.length)

    await fillAnswers(page)


    await browser.close()


    async function fillAnswers(page) {
        const allAnswers = await getAllAnswers()

        for (let i = 0; i <= allAnswers.length; i++) {
            console.log(`Пройдено ${i} из ${allAnswers.length}`)
            if (!allAnswers[i].isCompleted) {
                await page.goto(allAnswers[i].link)
                await page.waitForSelector(".entry-content")
                let div_selector_to_remove= ".code-block";
                await page.evaluate((sel) => {
                    let elements = document.querySelectorAll(sel);
                    for(let i=0; i< elements.length; i++){
                        elements[i].parentNode.removeChild(elements[i]);
                    }
                }, div_selector_to_remove)

                const html = await page.$eval('.entry-content', el => el.outerHTML);
                const title = await page.$eval(".entry-title", el => el.textContent)
                //     Saving file

                allAnswers[i].code = html
                allAnswers[i].value = title
                allAnswers[i].isCompleted = true

                fs.writeFileSync('fileResult.json', JSON.stringify(allAnswers));

                await page.waitForTimeout(7000)
            }
        }

    }

    async function getMaxPageOfCategory(page, url) {
        await page.goto(url)
        const pages = await page.$$eval('.nav-links > .page-numbers', (elements) => {
            return elements.map(e => e.textContent);
        });
        let maxPage = 1
        if (pages) {
            maxPage = pages[pages.length - 2]
        }
        return maxPage
    }

    async function getAllLevels(page, maxPage) {
        let res = []

        for (let i = 1; i <= maxPage; i++) {
            const links = await getLinksFromOnePage(page, i)
            console.log(`Страница ${i} из ${maxPage}`)
            res.push(links)
        }

        return res.flat(Infinity)
    }

    async function getLinksFromOnePage(page, numberPage) {

        await page.goto(BASE_URL + "page/" + numberPage)
        await page.waitForSelector(".ast-row")
        const pages = await page.$$eval('.ast-row .entry-title > a', (elements) => {
            return elements.map(e => {
                return {
                    link: e.href,
                    isCompleted: false,
                    key: "???",
                    value: "???",
                    code: "???"
                }
            });
        });
        return pages
    }


    async function getAllAnswers() {
        let data = fs.readFileSync('fileResult.json');
        if (!data) {
            throw new Error("пусто")
        }
        let dataOBJ = JSON.parse(data);
        return dataOBJ
    }


    // function getActiveLevel() {
    //     let data = fs.readFileSync('data.json');
    //     if (!data) {
    //         return 1
    //     }
    //     let dataOBJ = JSON.parse(data);
    //     return dataOBJ.currentPage ? dataOBJ.currentPage : 1
    // }

})();
