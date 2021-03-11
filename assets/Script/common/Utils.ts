export function generateUid(): string {
    let len = 8;
    let res = [];
    for (let i = 0; i !== len; ++i) {
        res.push(
            String.fromCharCode(
                Math.floor(Math.random() * 26) + (Math.random() > 0.5 ? 65 : 97)
            )
        );
    }
    res.push(new Date().getTime() + "o");
    return res.join("");
}

export function randomColor(): cc.Color {
    let r = Math.round(Math.random() * 255);
    let g = Math.round(Math.random() * 255);
    let b = Math.round(Math.random() * 255);
    return new cc.Color(r, g, b);
}