export class Logger {
    cache = [];
    loaders = [];
    write(text, { cache = false } = {}) {
        console.log(text);
        if (cache)
            this.cache.push(text);
    }
    loader(text) {
        this.loaders.push(new Loader('cats').start(text));
    }
    restoreCache(preRestoreContent) {
        this.loaders.forEach(loader => loader.stop());
        this.clear();
        if (preRestoreContent)
            this.write(preRestoreContent);
        this.cache.forEach(str => {
            this.write(str);
        });
    }
    clear() {
        console.clear();
        // @ts-ignore
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
    }
}
class Loader {
    type;
    index = 0;
    interval = null;
    constructor(type) {
        this.type = type;
    }
    start(text) {
        this.interval = setInterval(() => {
            this.index = this.index === animations[this.type].length - 1 ? 0 : this.index + 1;
            process.stdout.moveCursor(0, -1);
            process.stdout.clearLine(1);
            console.log(animations[this.type][this.index]);
        }, 100);
        return this;
    }
    stop() {
        if (this.interval)
            clearInterval(this.interval);
    }
}
const animations = {
    dots: ['.', '..', '...'],
    cats: [
        '̳៱˳_˳៱ ̳∫',
        '̳៱˳_˳៱ ̳ﾉ',
        '̳៱˳_˳៱ ̳∫',
        '̳៱˳_˳៱ ̳ﾉ',
        '̳៱˳_˳៱ ̳∫',
        '̳៱˳_˳៱ ̳ﾉ',
        '(≗ᆽ≗)ﾉ',
        '(≗ᆽ≗)ﾉ',
        '(≗ᆽ≗)ﾉ',
        '(=◕ᆽ◕ฺ=)∫',
        '(=◕ᆽ◕ฺ=)ﾉ',
        '(₌ꈍᆽꈍ₌)_',
        '(₌ꈍᆽꈍ₌)_',
    ],
};
const log = new Logger();
export default log;
//# sourceMappingURL=log.js.map