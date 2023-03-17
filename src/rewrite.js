import fs from "fs";

let data = fs.readFileSync('file.json');
let dataOBJ = JSON.parse(data);
let res = []

 dataOBJ.forEach((el,i) => {
    res.push({
        key: i,
        value: el.value.slice(el.value.indexOf("«") +1, el.value.indexOf("»")),
        code: el.code
    })
})

res = res.sort( (a,b) => {
    if (a.value < b.value) return -1;
    if (a.value > b.value) return 1;
    return 0;
});

fs.writeFileSync('file.json', JSON.stringify(res));
