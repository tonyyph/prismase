# Prismase · Thông tin điền App Store Connect (v1.0.0)

Copy từng ô bên dưới vào App Store Connect (app ID `6820206176`, bundle `com.prismase.cyber`).
Nội dung store viết bằng tiếng Anh (ngôn ngữ chính: **English (U.S.)**). Ô nào có giới hạn ký
tự đã được đếm sẵn.

---

## 1. App Information (menu trái → General → App Information)

| Trường | Giá trị |
|---|---|
| Name (≤30) | `Prismase: Outlaw Sort Puzzle` (28) |
| Subtitle (≤30) | `Sort the spectrum` (17) |
| Primary Language | English (U.S.) |
| Category | **Games** |
| Primary subcategory | **Puzzle** |
| Secondary subcategory | **Casual** |
| Content Rights | **No**, it does not contain, show, or access third-party content |
| Age Rating | Xem mục 5 |

## 2. Pricing and Availability

| Trường | Giá trị |
|---|---|
| Price | **Free** ($0.00) |
| Availability | All countries or regions |
| Distribution (iPad / Mac) | Tắt "Make this app available on Mac" (app chỉ dành cho iPhone) |

## 3. App Privacy (menu trái → Trust & Safety → App Privacy)

**Privacy Policy URL:** `https://prismase.vercel.app/privacy`

Bấm **Get Started**. Câu *"Do you or your third-party partners collect data from this app?"*:
chọn **Yes, we collect data from this app**. App tự nó không thu thập gì, nhưng Google AdMob thì
có.

Tick các loại dữ liệu sau, rồi trả lời giống nhau cho từng loại:

| Loại dữ liệu | Mục đích (Purposes) | Linked to identity? | Used for tracking? |
|---|---|---|---|
| **Location → Coarse Location** | Third-Party Advertising, Analytics | No | **Yes** |
| **Identifiers → Device ID** | Third-Party Advertising, Analytics | No | **Yes** |
| **Usage Data → Product Interaction** | Third-Party Advertising, Analytics | No | **Yes** |
| **Usage Data → Advertising Data** | Third-Party Advertising, Analytics | No | **Yes** |
| **Diagnostics → Crash Data** | Analytics | No | No |
| **Diagnostics → Performance Data** | Analytics | No | No |
| **Diagnostics → Other Diagnostic Data** | Analytics | No | No |

Các loại khác (Contact Info, Health, Financial, Location → Precise, User Content, Purchases,
Search/Browsing History, Contacts, Sensitive Info) đều **không** tick.

Đối chiếu với hướng dẫn chính thức của Google nếu có gì khác:
https://developers.google.com/admob/ios/privacy/data-disclosure

Kết quả trên trang store sẽ là: **"Data Used to Track You"** (Location, Identifiers, Usage
Data) và **"Data Not Linked to You"** (Diagnostics).

## 4. Phiên bản 1.0 (menu trái → iOS App → 1.0 Prepare for Submission)

### Screenshots

- **iPhone 6.9" Display:** tải 7 ảnh trong `store/screenshots/ios-6.9/` theo đúng thứ tự tên
  file (01 → 07). Ảnh 1320 × 2868, JPEG, không có kênh alpha.
- Các cỡ nhỏ hơn (6.5", 5.5"…) App Store tự thu nhỏ từ bộ 6.9", không cần tải thêm.

### Promotional Text (≤170, sửa được bất cứ lúc nào không cần duyệt lại)

```
Sort painted brass medallions across hundreds of always-solvable levels. Calm, clever and crafted on the frontier, with a pinch of pirate.
```

### Description (≤4000)

```
High noon. The saloon's a mess, and every crate on the table holds the wrong loot.

Prismase is a calm, beautifully crafted sorting puzzle set on the frontier, with a pinch of pirate. Tap a crate to lift its top piece, tap another to set it down, and fill every crate with four of a kind: lassos, spurs, revolvers, treasure chests, saloon doors and more.

• Hundreds of always-solvable levels that grow from greenhorn to outlaw
• Twelve hand-painted brass medallions, each with its own emblem, so every colour is easy to tell apart
• Free undos every level, a lantern hint that always points to a move that still works, and an extra crate when you need elbow room
• Bounty rewards, a daily treasure chest, and doubloons to spend
• Painted wood, rope and parchment everywhere you look, with gentle sounds and haptics
• Play offline anywhere. No account, no timers, no pressure

Pull up a chair, partner, and sort the spectrum.
```

### Keywords (≤100, cách nhau bằng dấu phẩy, không có dấu cách)

```
sort,color,puzzle,western,cowboy,pirate,saloon,relax,brain,logic,offline,casual,calm,match,stack
```
(96 ký tự. Không lặp lại các từ đã có trong Name/Subtitle như "prismase", "outlaw", "spectrum".)

### URLs

| Trường | Giá trị |
|---|---|
| Support URL | `https://prismase.vercel.app/support` |
| Marketing URL | `https://prismase.vercel.app` |

> Marketing URL phải đúng tên miền này để AdMob kiểm tra được `app-ads.txt`.

### Version & Copyright

| Trường | Giá trị |
|---|---|
| Version | `1.0.0` |
| Copyright | `2026 <Tên của bạn hoặc tên công ty>` |

### Build

Chọn build **mới nhất có quảng cáo** (build 3 trở lên, sau khi chạy `pnpm release:ios`).
Build 1 và 2 chưa có AdMob, **không** chọn.

### What's New in This Version

Phiên bản đầu tiên không bắt buộc ô này. Nếu có ô thì dán:

```
Welcome to Prismase! Sort painted brass medallions across hundreds of levels, with hints, undo and a daily treasure chest. We'd love to hear what you think.
```

## 5. Age Rating (App Information → Age Rating → Edit)

Trả lời bảng câu hỏi như sau:

| Câu hỏi | Trả lời |
|---|---|
| Cartoon or Fantasy Violence | None |
| Realistic Violence | None |
| Prolonged Graphic or Sadistic Realistic Violence | None |
| Profanity or Crude Humor | None |
| Mature or Suggestive Themes | None |
| Horror/Fear Themes | None |
| Medical or Treatment Information | None |
| Alcohol, Tobacco, or Drug Use or References | None |
| Simulated Gambling | None |
| Sexual Content or Nudity / Graphic Sexual Content | None |
| Contests | None |
| Unrestricted Web Access | No |
| User-Generated Content / Messaging and Chat | No |
| Gambling (real money) | No |
| Loot Boxes | No |
| **Advertising** (nếu có câu này) | **Yes** |
| Parental Controls / Age Assurance | No |

Kết quả dự kiến: **4+** (một số phiên bản bảng hỏi cho ra 9+ khi có quảng cáo, cả hai đều được).

> **Made for Kids:** **không** tick. Nếu tick, Apple cấm quảng cáo cá nhân hoá và quyền theo dõi
> (ATT), app sẽ bị từ chối với cấu hình hiện tại.

## 6. App Review Information (cuối trang phiên bản 1.0)

| Trường | Giá trị |
|---|---|
| Sign-in required | **Bỏ tick** (app không có đăng nhập) |
| Contact: First / Last name | Tên của bạn |
| Contact: Phone | Số điện thoại có mã quốc gia, ví dụ `+84 9xx xxx xxx` |
| Contact: Email | `tonyphvincent@gmail.com` |
| Attachment | Không cần |

**Notes** (dán nguyên đoạn):

```
Prismase is a single-player offline puzzle game. No account or sign-in is needed.

Ads: the app uses Google AdMob. On first launch it shows Google's consent form (EEA/UK users only) and then the App Tracking Transparency prompt. Ads still work if tracking is denied. Full-screen ads appear only from level 6, at most once every 3 wins. Rewarded ads are always optional (hint, undo, skip level, double coins, extra crate).

How to play: tap a crate to lift its top piece, then tap another crate to place it on an empty crate or a matching piece. Fill every crate with four of a kind. Every level is verified solvable; the lantern Hint button shows a winning move.

Progress, coins and settings are stored only on the device.
```

## 7. Version Release

Chọn một trong hai:
- **Manually release this version**: duyệt xong, bạn tự bấm phát hành (nên chọn cho lần đầu,
  để kịp liên kết AdMob và kiểm tra lại).
- **Automatically release this version**: phát hành ngay khi được duyệt.

## 8. Export Compliance

Không cần làm gì. `app.json` đã khai `usesNonExemptEncryption: false`, nên App Store Connect
không hỏi khi chọn build.

---

## Checklist trước khi bấm "Add for Review"

- [ ] App Information: Name, Subtitle, Category, Content Rights
- [ ] Pricing: Free, all countries
- [ ] App Privacy: 7 loại dữ liệu + Privacy Policy URL, bấm **Publish**
- [ ] Age Rating đã trả lời
- [ ] 7 ảnh 6.9" đã tải lên
- [ ] Promotional Text, Description, Keywords, Support/Marketing URL, Copyright
- [ ] Đã chọn build có AdMob (build 3+), đã thử trên TestFlight
- [ ] App Review Information: liên hệ + Notes
- [ ] Version Release: Manual
- [ ] Sau khi app lên store: AdMob → App settings → **Link to app store**
