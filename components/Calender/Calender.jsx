'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import moment from "moment-jalaali";
import styles from "./Calender.module.css";

moment.loadPersian({ dialect: "persian-modern", usePersianDigits: true });

// نام‌های کوتاه روزهای هفته
const weekDays = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

// دریافت سال جاری شمسی
const currentJYear = moment().jYear();
const isLeap = moment.jIsLeapYear(currentJYear);

// داده‌های ماه‌ها در تقویم جلالی
const monthData = [
    { name: "فروردین", days: 31, season: "بهار" },
    { name: "اردیبهشت", days: 31, season: "بهار" },
    { name: "خرداد", days: 31, season: "بهار" },
    { name: "تیر", days: 31, season: "تابستان" },
    { name: "مرداد", days: 31, season: "تابستان" },
    { name: "شهریور", days: 31, season: "تابستان" },
    { name: "مهر", days: 30, season: "پاییز" },
    { name: "آبان", days: 30, season: "پاییز" },
    { name: "آذر", days: 30, season: "پاییز" },
    { name: "دی", days: 30, season: "زمستان" },
    { name: "بهمن", days: 30, season: "زمستان" },
    { name: "اسفند", days: isLeap ? 30 : 29, season: "زمستان" },
];

// محاسبه اولین روز هر ماه
const computeFirstDays = () => {
    return monthData.map((_, index) => {
        const m = moment(`${currentJYear}/${index + 1}/1`, "jYYYY/jM/jD");
        return (m.day() + 1) % 7;
    });
};

const firstDays = computeFirstDays();

// نگاشت فصل به کلاس‌های CSS
const seasonClassMap = {
    "بهار": "bahar",
    "تابستان": "tabas",
    "پاییز": "paeiz",
    "زمستان": "zemistan"
};

const MonthCalendar = ({
    monthName,
    days,
    firstDay,
    season,
    monthIndex,
    clickedDates,
    updateClickedDates,
}) => {
    const router = useRouter();
    const blanks = Array(firstDay).fill(null);
    const daysArray = Array.from({ length: days }, (_, i) => i + 1);
    const totalCells = blanks.length + daysArray.length;
    const extraCells = Array((7 - (totalCells % 7)) % 7).fill(null);
    const cells = [...blanks, ...daysArray, ...extraCells];

    // تعیین تاریخ امروز به صورت فرمت شمسی (مثلاً "1401-7-25")
    const todayMoment = moment();
    const todayKey = todayMoment.format("jYYYY-jM-jD");

    return (
        <div className={`${styles.monthContainer} ${styles[season]}`}>
            <div className={styles.overlay}></div>
            <div className={styles.monthContent}>
                <h3 className={styles.monthTitle}>{monthName}</h3>
                <div className={styles.calendarGrid}>
                    {weekDays.map((day, idx) => (
                        <div key={idx} className={styles.weekDay}>
                            {day}
                        </div>
                    ))}
                    {cells.map((cell, idx) => {
                        if (!cell) {
                            return <div key={idx} className={styles.dayCell}></div>;
                        }
                        // ایجاد کلید تاریخ به فرمت "سال-ماه-روز"
                        const dateKey = `${currentJYear}-${monthIndex + 1}-${cell}`;
                        const cellMoment = moment(dateKey, "jYYYY-jM-jD");

                        let cellClass = styles.dayCell;
                        let clickable = false;

                        if (clickedDates[dateKey]) {
                            // اگر تاریخ قبلاً کلیک شده باشد، به سبز نمایش داده می‌شود
                            cellClass = `${styles.dayCell} ${styles.clickedDay}`;
                        } else if (cellMoment.isBefore(todayMoment, 'day')) {
                            // روزهای گذشته (و بدون کلیک) به قرمز نمایش داده می‌شوند
                            cellClass = `${styles.dayCell} ${styles.expiredDay}`;
                        } else if (cellMoment.isSame(todayMoment, 'day')) {
                            // روز جاری قابل کلیک است
                            clickable = true;
                        }

                        return (
                            <div
                                key={idx}
                                className={cellClass}
                                onClick={() => {
                                    if (clickable) {
                                        updateClickedDates(dateKey);
                                        router.push("/target");
                                    }
                                }}
                                style={clickable ? { cursor: "pointer" } : {}}
                            >
                                {cell}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const Calender = () => {
    // دسته‌بندی ماه‌ها بر اساس فصل
    const seasons = {
        "بهار": [],
        "تابستان": [],
        "پاییز": [],
        "زمستان": []
    };

    monthData.forEach((month, index) => {
        seasons[month.season].push({
            ...month,
            firstDay: firstDays[index],
            index: index,
        });
    });

    // نگهداری وضعیت روزهای کلیک شده در localStorage
    const [clickedDates, setClickedDates] = useState({});

    useEffect(() => {
        const stored = localStorage.getItem("clickedDates");
        if (stored) {
            setClickedDates(JSON.parse(stored));
        }
    }, []);

    const updateClickedDates = (dateKey) => {
        setClickedDates((prev) => {
            const newClickedDates = { ...prev, [dateKey]: true };
            localStorage.setItem("clickedDates", JSON.stringify(newClickedDates));
            return newClickedDates;
        });
    };

    return (
        <div className={styles.pageContainer}>
            <h1 className={styles.pageTitle}>تقویم سال {currentJYear}</h1>
            <div className={styles.seasonsContainer}>
                {Object.entries(seasons).map(([season, months]) => (
                    <div key={season} className={styles.seasonSection}>
                        <h2 className={`${styles.seasonTitle} ${styles[seasonClassMap[season]]}`}>
                            {season}
                        </h2>
                        <div className={styles.monthsContainer}>
                            {months.map((month, idx) => (
                                <MonthCalendar
                                    key={idx}
                                    monthName={month.name}
                                    days={month.days}
                                    firstDay={month.firstDay}
                                    season={seasonClassMap[season]}
                                    monthIndex={month.index}
                                    clickedDates={clickedDates}
                                    updateClickedDates={updateClickedDates}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Calender;
