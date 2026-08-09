# LOCK — Hebrew Localization Matrix (v1)
מטריצת לוקליזציה EN→HE לכל ה-meta fields וטרמינולוגיית המוצר. עקרון: **transcreation, לא תרגום** — שמות מוצר נשארים באנגלית; פעולות ומצבים בעברית טבעית לתעשייה.

## 0. חוקי יסוד
- שמות מותג/מוצר נשארים: **LOCK · Passport · RADAR** (כמו "וואטסאפ", לא מתרגמים).
- Act = **פרויקט אמן** (לא "אקט"); בממשק קצר: "האמן/הפרויקט".
- RTL מלא: ניווט, chips, טיימליין — היפוך לוגי, לא היפוך מכני; מספרים ושעות נשארים LTR.
- פונט: Heebo (UI) · DM Mono נשאר למטא-נתונים (שעות, מזהים).

## 1. ישויות (workspace types)
| Meta field | EN | HE |
|---|---|---|
| workspace(act) | Artist | אמן |
| workspace(agency) | Representation | ייצוג אמנים |
| workspace(production) | Production | הפקה |
| external recipient | Booker / Private host | בוקר / מזמין פרטי |
| source confirmer | Source confirmer | מאמת מקור |
| admin | Operations | תפעול |

## 2. ניווט תחתון
| EN | HE |
|---|---|
| Radar | RADAR (נשאר) |
| Passport | Passport (נשאר) |
| Inbox | פניות |
| Roster | הרוסטר שלי |
| Opportunities | הזדמנויות |
| Today | היום |
| Events | אירועים |

## 3. core objects
| Object | EN label | HE |
|---|---|---|
| claim | Fact / Claim | נתון / טענה |
| source | Source | מקור |
| mandate | Access / Consent | הרשאה / הסכמה |
| case | Booking Case | תיק הזמנה |
| slot | Slot | סלוט |
| event | Event | אירוע |
| invite | Invite | הזמנה לסלוט |
| advance | Artist Advance | אדוונס / דף מוכנות |
| enquiry | Enquiry | פנייה |
| share_link | Share link | קישור שיתוף |
| receipt | Receipt | תיעוד פעולה |

## 4. states (chips) — צבע נשמר, מילה מתורגמת
| EN chip | HE chip |
|---|---|
| CANDIDATE | ממתין לאישור שלך |
| CONFIRMED | מאומת |
| STALE | דורש רענון |
| CONFLICT | סתירה |
| PENDING | ממתין |
| GRANTED | אושר |
| DECLINED | נדחה |
| REVOKED | בוטל |
| SHARE-READY | מוכן לשיתוף |
| NEXT MOVE | הצעד הבא |
| OPEN (slot) | פנוי |
| 2 TO DECIDE | 2 להכרעה |
| FULLY SET | ליינאפ סגור |
| CASTING | בשיבוץ |
| DRAFT | טיוטה |
| LIVE | פעיל |
| HOLD 22H | הולד · 22 ש' |
| AGREED | סוכם |
| ISSUED / PAID / OVERDUE | הופקה / שולם / בפיגור |

## 5. CTA-ים מרכזיים
| EN | HE |
|---|---|
| Accept / Decline | לאשר / לסרב בנימוס |
| Confirm the slot | לסגור את הסלוט |
| Open the case | לפתוח את התיק |
| Open the lineup | ללוח הליינאפ |
| Review the Passport | לצפות ב-Passport |
| Send the invite | לשלוח הזמנה |
| Copy invite link | להעתיק קישור הזמנה |
| Add a slot | להוסיף סלוט |
| Publish | לפרסם |
| Share Passport | לשתף Passport |
| Request to represent | לבקש הרשאת ייצוג |
| Send a nudge | לשלוח תזכורת עדינה |

## 6. אזורי מסך (eyebrows)
| EN | HE |
|---|---|
| NEXT SHOW · 30 DAYS TO DOORS | המופע הבא · 30 יום לפתיחת דלתות |
| CUES — BY DEADLINE | משימות — לפי דדליין |
| THE RUNWAY | המסלול — כל הלילות הקרובים |
| WAITING ON A REPLY | ממתין לתשובה |
| ACCESS & CONSENT | הרשאות והסכמות |
| THE LINEUP | הליינאפ |
| BOOKED BEFORE | עבדתם בעבר |
| MONEY — FEE & PAYMENT | כסף — תשלום ותנאים |
| APPROVALS | אישורים |
| THREAD | השתלשלות — הכול ברשומה אחת |

## 7. פתוח להכרעת Maria
1. Booker — "בוקר" (סלנג מקצועי) או "מנהל הזמנות"? המלצה: בוקר.
2. Slot — "סלוט" (מקובל בתעשייה) או "משבצת"? המלצה: סלוט.
3. Advance — נשאר "אדוונס" (מונח תעשייה) — לאשר.
4. האם Inbox = "פניות" גם אצל אמן וגם אצל משרד? המלצה: כן, אחיד.

## 8. סטטוס יישום
- מטריצה זו = שלב 1 (אוצר מילים מאושר).
- שלב 2: מתג שפה + RTL בפרוטוטייפ (מבנה, כיווניות, Heebo).
- שלב 3: transcreation מלא של כל המיקרו-קופי מסך-מסך לפי המטריצה.
