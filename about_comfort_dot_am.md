### 📦 Comfort.am

---

**1. 🌐 Cloudflare & Domain (DNS Փոխանցում)**

- Դոմեյնի (`comfort.am`) DNS-ն այս պահին իմ Cloudflare աքաունթում է։

1. Բացել ձեր Cloudflare աքաունթը և add անել `comfort.am` դոմեյնը։
2. Երբ Nameserver-ները փոխեք, ասեք՝ ես իմ Cloudflare-ից կջնջեմ դոմեյնը։

---

**2. 🔑 Hosting & Server Access**

- **Contabo Dashboard:** Login: `sekhleyan.gevorg@gmail.com` | Pass: `B3dXGtJQ3bx6`
- **VPS SSH Direct:** `ssh root@109.199.127.128` (Pass: `dMF4ctkj5RH2fhyjE05ly98xH6`)
- **Bluehost Account:** մտնել Profile settings և Primary Email-ը փոխել ձեր մեյլով։ Նամակը հաստատելուց հետո ես իմ կողմից 2FA-ն կանջատեմ։

---

**3. 💻 Source Code**

- Կոդ ի path ը է VPS-ի ներսում (`/root/` և `/var/www/` թղթապանակներում)։
- Լրացուցիչ ուղարկում եմ նաև G Drive հղումը՝ `[https://drive.google.com/file/d/1U_4ES196vaGvGJxWh0Cav1a3kGftsm6m/view?usp=drive_link]`:

---

**4. 🗄️ Database (VPS Self-Hosted MongoDB)**

- MongoDB-ն աշխատում է VPS-ի ներսում,
- **DB Admin Access:**
- User: `comfort_admin`
- Pass: `tG9#xM2!vK4$wQ8*zL1^pY7_bR3`
- Auth Database: `admin`

- **Automated Daily Backup:** VPS-ում `crontab`-ով `/root/mongo_backups/` թղթապանակում։
- **Local Dev Port Security:** Local dev-ի համար 27017 պորտը դրսից բացելու համար VPS-ում աշխատացրեք `sudo ufw allow 27017/tcp`, իսկ փակելու համար՝ `sudo ufw deny 27017/tcp`:

---
