/**
 * Hijri Date Library
 * A JavaScript library for converting between Gregorian and Hijri dates
 */

class HijriDate extends Date {
    constructor(...args) {
        super(...args);
        const gregYear = super.getFullYear();
        const gregMonth = super.getMonth() + 1;
        const gregDay = super.getDate();
        this._hijri = this._toHijri(gregYear, gregMonth, gregDay);
    }

    _toHijri(year, month, day) {
        // Convert Gregorian to Hijri date
        const jd = this._gregorianToJulian(year, month, day);
        const hijri = this._julianToHijri(jd);
        return hijri;
    }

    _gregorianToJulian(year, month, day) {
        if (month <= 2) {
            year--;
            month += 12;
        }
        const a = Math.floor(year / 100);
        const b = 2 - a + Math.floor(a / 4);
        const jd = Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + b - 1524.5;
        return jd;
    }

    _julianToHijri(jd) {
        const l = jd + 68569;
        const n = Math.floor((4 * l) / 146097);
        const l1 = l - Math.floor((146097 * n + 3) / 4);
        const i = Math.floor((4000 * (l1 + 1)) / 1461001);
        const l2 = l1 - Math.floor((1461 * i) / 4) + 31;
        const j = Math.floor((80 * l2) / 2447);
        const l3 = l2 - Math.floor((2447 * j) / 80);
        const l4 = Math.floor(j / 11);
        const hijriYear = 30 * n + i - 4716 + l4;
        const hijriMonth = j + 1 - 12 * l4;
        const hijriDay = l3;

        return {
            year: hijriYear,
            month: hijriMonth,
            day: hijriDay
        };
    }

    getHijriYear() {
        return this._hijri.year;
    }

    getHijriMonth() {
        return this._hijri.month;
    }

    getHijriDate() {
        return this._hijri.day;
    }

    getFullYear() {
        return this._hijri.year;
    }

    getMonth() {
        return this._hijri.month - 1;
    }

    getDate() {
        return this._hijri.day;
    }

    // Override toString to show Hijri date
    toString() {
        return `${this._hijri.year}-${this._hijri.month}-${this._hijri.day}`;
    }
}

export { HijriDate }; 