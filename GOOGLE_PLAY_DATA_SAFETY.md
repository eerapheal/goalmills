# Google Play Console Data Safety & Privacy Policy Compliance Guide

**App Name:** GoalMills  
**Package Name:** `com.goalmills.app`  
**Standard:** Google Play Developer Policy (Data Safety & Target Audience Standards)  
**Last Updated:** April 2026  

---

## 1. App Content: Mandatory URLs for Play Console

Enter these URLs directly in the **Google Play Console** under **Policy and programs > App content**:

| Field | URL to Submit |
| :--- | :--- |
| **Privacy Policy URL** | `https://goalmills-web.vercel.app/privacy-policy` |
| **Data Deletion URL** | `https://goalmills-web.vercel.app/data-deletion` |

---

## 2. Google Play Console: Data Safety Questionnaire (Field-by-Field Answers)

Go to **Google Play Console > App content > Data safety** and complete the form using the exact selections below:

### Section A: Data Collection and Security Overview

| Question | Your Selection | Explanation |
| :--- | :--- | :--- |
| **Does your app collect or share any of the required user data types?** | **Yes** | The app collects account data (if user registers), app performance logs, and saved favorites. |
| **Is all of the user data collected by your app encrypted in transit?** | **Yes** | All network requests use HTTPS / TLS 1.2 and TLS 1.3 encryption. |
| **Do you provide a way for users to request that their data be deleted?** | **Yes** | Users can delete via in-app or via our dedicated web deletion page. |
| **Data Deletion Policy URL** | `https://goalmills-web.vercel.app/data-deletion` | Direct link to data deletion instructions. |

---

### Section B: Data Types Declarations

#### 1. Personal Info
Select **Personal Info**, and check the following sub-categories:

* **Name / Username**:
  * *Collected:* **Yes** | *Shared:* **No**
  * *Is this data processed ephemerally?* **No**
  * *Is this data required or optional?* **Data collection is optional** (Guests can view live scores without creating an account).
  * *Why is this user data collected?* Check **App functionality** and **Account management**.

* **Email address**:
  * *Collected:* **Yes** | *Shared:* **No**
  * *Is this data processed ephemerally?* **No**
  * *Is this data required or optional?* **Data collection is optional** (Required only for registered accounts or support inquiries).
  * *Why is this user data collected?* Check **App functionality**, **Account management**, and **Developer communications**.

* **User IDs**:
  * *Collected:* **Yes** | *Shared:* **No**
  * *Is this data processed ephemerally?* **No**
  * *Is this data required or optional?* **Data collection is optional**
  * *Why is this user data collected?* Check **App functionality** and **Account management**.

---

#### 2. Photos and Videos (Optional Profile Picture)
Select **Photos and Videos**, and check:

* **Photos**:
  * *Collected:* **Yes** | *Shared:* **No**
  * *Is this data processed ephemerally?* **No**
  * *Is this data required or optional?* **Data collection is optional** (Only if the user uploads a custom profile avatar).
  * *Why is this user data collected?* Check **Account management**.

---

#### 3. App Activity
Select **App Activity**, and check:

* **App interactions**:
  * *Collected:* **Yes** | *Shared:* **No**
  * *Is this data processed ephemerally?* **No**
  * *Is this data required or optional?* **Data collection is optional**
  * *Why is this user data collected?* Check **App functionality** (Saving favorite sports teams & personalized match feeds) and **Analytics**.

---

#### 4. App Info and Performance
Select **App Info and Performance**, and check:

* **Crash logs & Diagnostics**:
  * *Collected:* **Yes** | *Shared:* **No**
  * *Is this data processed ephemerally?* **No**
  * *Is this data required or optional?* **Data collection is optional**
  * *Why is this user data collected?* Check **Analytics** and **App functionality** (Fixing bugs and stability issues).

---

#### 5. Device or Other IDs
Select **Device or Other IDs**, and check:

* **Device or other IDs**:
  * *Collected:* **Yes** | *Shared:* **No**
  * *Is this data processed ephemerally?* **No**
  * *Is this data required or optional?* **Data collection is optional** (Only if user grants push notification permission).
  * *Why is this user data collected?* Check **App functionality** (Delivering live match score alerts).

---

### Section C: Data Types NOT Collected (Leave Unchecked)
Confirm that the following categories remain **UNCHECKED (No)**:
- ❌ **Location** (No Approximate or Precise GPS location collected)
- ❌ **Financial Info** (No credit cards, bank info, or payment processing)
- ❌ **Health & Fitness** (None)
- ❌ **Messages** (No SMS, MMS, or email content read)
- ❌ **Audio files** (No microphone or voice recording)
- ❌ **Files and docs** (No local device storage browsing)
- ❌ **Calendar** (None)
- ❌ **Contacts** (No address book access)
- ❌ **Web browsing** (No browser history collected)

---

## 3. Third-Party Services & SDK Policy Declarations

When asked about third-party SDKs or API services used in GoalMills:

1. **YouTube API Services / Embedded Video Player**:
   * GoalMills embeds match highlights using YouTube API Services.
   * Disclosed in Privacy Policy with direct links to [YouTube Terms of Service](https://www.youtube.com/t/terms) and [Google Privacy Policy](https://policies.google.com/privacy).

2. **Sports Data APIs (API-Football / API-Sports)**:
   * Used strictly for server-side fixture, score, and league statistics fetching. No personal user data is sent to sports data APIs.

3. **Cloud Infrastructure**:
   * Hosted on **Vercel** with databases encrypted at rest on **MongoDB Atlas**.

---

## 4. Ads & Target Audience Declarations

* **Ads Policy:** Select **"No, my app does not contain ads"** (or indicate native sponsorships if applicable).
* **Target Age Group:** Select **13 and older** (e.g., 13–15, 16–17, 18+).
* **App Access:** Select **"All functionality is available without special access restrictions"** (or provide test credentials if login is tested).

---

## 5. In-App Mobile Access Verification

GoalMills includes built-in in-app compliance:
* A direct **Shield / Data Safety icon** in the top navigation header (`Header.tsx`).
* A dedicated **In-App Data Safety & Privacy Screen** (`apps/mobiles/src/app/privacy.tsx`) allowing reviewers and users to inspect data policies, open web links, or submit deletion requests anytime.
